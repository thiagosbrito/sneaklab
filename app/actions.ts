"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, products, brands, heroSection } from "@/db/schema";
import { upsertHeroSectionFromDB, upsertAboutUsSectionFromDB, createShowcaseSectionFromDB } from "@/db/queries/content";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: 'CUSTOMER'
      }
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/", error.message);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

// Category actions using Drizzle
export const createCategoryAction = async (formData: FormData) => {
  try {
    const name = formData.get("name")?.toString();
    const slug = formData.get("slug")?.toString();
    const description = formData.get("description")?.toString();
    const showInMenu = formData.get("showInMenu") === "true";

    if (!name || !slug) {
      return { error: "Name and slug are required" };
    }

    const result = await db.insert(categories).values({
      name,
      slug,
      description: description || null,
      showInMenu,
      imageURL: null, // Set to null for now, can be updated later
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
};

// Product actions using Drizzle
export const createProductAction = async (product: {
  name: string;
  description?: string;
  brandID: string;
  categoryID: string;
  price: number;
  promoPrice?: number | null;
  isAvailable: boolean;
  imageURL: string[];
}) => {
  try {
    if (!product.name || !product.brandID || !product.categoryID || !product.price) {
      return { error: "Name, brand, category, and price are required" };
    }

    const result = await db.insert(products).values({
      name: product.name,
      description: product.description || null,
      brandID: product.brandID,
      categoryID: product.categoryID,
      price: product.price.toString(), // Convert to decimal string
      promoPrice: product.promoPrice?.toString() || null,
      isAvailable: product.isAvailable,
      imageURL: product.imageURL,
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
};

// Brand actions using Drizzle
export const createBrandAction = async (formData: FormData) => {
  try {
    const name = formData.get("name")?.toString();
    const logo = formData.get("logo")?.toString();

    if (!name || !logo) {
      return { error: "Name and logo are required" };
    }

    const result = await db.insert(brands).values({
      name,
      logo,
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: "Failed to create brand" };
  }
};

// Hero section actions using Drizzle
export const upsertHeroSectionAction = async (formData: FormData) => {
  try {
    const heroTitle = formData.get("heroTitle")?.toString();
    const heroSubtitle = formData.get("heroSubtitle")?.toString();
    const backgroundImageUrl = formData.get("backgroundImageUrl")?.toString();
    const ctaText = formData.get("ctaText")?.toString();
    const ctaRedirectTo = formData.get("ctaRedirectTo")?.toString();

    if (!heroTitle || !heroSubtitle || !backgroundImageUrl || !ctaText || !ctaRedirectTo) {
      return { error: "All fields are required" };
    }

    const result = await upsertHeroSectionFromDB({
      heroTitle,
      heroSubtitle,
      backgroundImageUrl,
      ctaText,
      ctaRedirectTo,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error upserting hero section:", error);
    return { error: "Failed to save hero section" };
  }
};

// About Us section actions using Drizzle
export const upsertAboutUsSectionAction = async (formData: FormData) => {
  try {
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !description) {
      return { error: "Title and description are required" };
    }

    const result = await upsertAboutUsSectionFromDB({
      title,
      description,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error upserting about us section:", error);
    return { error: "Failed to save about us section" };
  }
};

// Showcase section actions using Drizzle
export const createShowcaseSectionAction = async (formData: FormData) => {
  try {
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString();
    const subtitleA = formData.get("subtitleA")?.toString();
    const subtitleB = formData.get("subtitleB")?.toString();
    const subtitleDescriptionA = formData.get("subtitleDescriptionA")?.toString();
    const subtitleDescriptionB = formData.get("subtitleDescriptionB")?.toString();

    if (!title || !description || !imageUrl || !subtitleA || !subtitleB || !subtitleDescriptionA || !subtitleDescriptionB) {
      return { error: "All fields are required" };
    }

    const result = await createShowcaseSectionFromDB({
      title,
      description,
      imageUrl,
      subtitleA,
      subtitleB,
      subtitleDescriptionA,
      subtitleDescriptionB,
      isActive: true, // Set as active by default
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating showcase section:", error);
    return { error: "Failed to save showcase section" };
  }
};
