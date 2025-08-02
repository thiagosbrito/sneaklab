"use server";

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { profiles, type Profile } from '@/db/schema';
import { revalidateTag } from 'next/cache';

interface SignupResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Signup action that creates both auth user and profile using Drizzle
 */
export async function signupWithProfileAction(
  email: string,
  password: string,
  fullName?: string
): Promise<SignupResult> {
  try {
    const supabase = await createClient();

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'CUSTOMER',
          full_name: fullName || email.split('@')[0]
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }

    // Step 2: Create profile in database using Drizzle
    try {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: authData.user.id,
          fullName: fullName || authData.user.email?.split('@')[0] || 'Customer',
          phone: '',
          address: null,
          role: 'CUSTOMER',
        })
        .returning();

      console.log('Profile created successfully:', newProfile.id);
      
      // Revalidate any profile-related cache
      revalidateTag('user-profile');
      
      return {
        success: true,
        message: 'Thanks for signing up! Please check your email for a verification link.'
      };

    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      
      // If profile creation fails, we should still return success since auth user was created
      // The profile will be created later when the user first places an order
      return {
        success: true,
        message: 'Account created successfully! Please check your email for a verification link.'
      };
    }

  } catch (error) {
    console.error('Signup action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get or create user profile - used as fallback when profile doesn't exist
 */
export async function getOrCreateUserProfile(userId: string, userEmail?: string): Promise<Profile | null> {
  try {
    // First try to get existing profile
    const existingProfile = await db.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.id, userId)
    });

    if (existingProfile) {
      return existingProfile;
    }

    // Create profile if it doesn't exist
    const [newProfile] = await db
      .insert(profiles)
      .values({
        id: userId,
        fullName: userEmail?.split('@')[0] || 'Customer',
        phone: '',
        address: null,
        role: 'CUSTOMER',
      })
      .returning();

    console.log('Created missing profile for user:', userId);
    revalidateTag('user-profile');
    
    return newProfile;

  } catch (error) {
    console.error('Error getting/creating profile:', error);
    return null;
  }
}