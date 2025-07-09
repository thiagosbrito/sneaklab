"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardSheet from "@/components/ui/DashboardSheet";
import HeroSectionForm from "@/components/admin/content-management/HeroSectionForm";
import useSupabaseBrowser from "@/utils/supabase/client";

export default function HeroSectionPage() {
  const [formData, setFormData] = useState({
    backgroundImageUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    ctaText: "",
    ctaRedirectTo: "",
  });
  const [hasContent, setHasContent] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    const fetchHeroSection = async () => {
      const { data, error } = await supabase.from("hero_section").select("*").single();

      if (error) {
        console.error("Error fetching hero section:", error.message);
      } else if (data) {
        setFormData({
          backgroundImageUrl: data.background_image_url || "",
          heroTitle: data.hero_title || "",
          heroSubtitle: data.hero_subtitle || "",
          ctaText: data.cta_text || "",
          ctaRedirectTo: data.cta_redirect_to || "",
        });
        setHasContent(true);
      } else {
        setHasContent(false);
      }
    };

    fetchHeroSection();
  }, [supabase]);

  const handleSave = () => {
    setIsSheetOpen(false);
    setHasContent(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Hero Section</h1>
      {hasContent ? (
        <>
          <div
            className="flex flex-col items-center justify-center h-[850px] bg-cover bg-center text-white w-full mb-6"
            style={{ backgroundImage: `url(${formData.backgroundImageUrl})` }}
          >
            <div className="max-w-3xl px-4 text-center">
              <h1 className="text-4xl font-bold text-shadow-sm">{formData.heroTitle}</h1>
              <p className="mt-4 text-lg">{formData.heroSubtitle}</p>
              <div className="mt-8">
                <a
                  href={formData.ctaRedirectTo}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  {formData.ctaText}
                </a>
              </div>
            </div>
          </div>
          <DashboardSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            title="Edit Hero Section"
            description="Update the content for the hero section."
            trigger={<Button onClick={() => setIsSheetOpen(true)}>Edit Content</Button>}
          >
            <HeroSectionForm initialData={formData} onSave={handleSave} />
          </DashboardSheet>
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">No content registered for the hero section.</p>
          <DashboardSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            title="Add Hero Section"
            description="Provide content for the hero section."
            trigger={<Button onClick={() => setIsSheetOpen(true)}>Add Content</Button>}
            size="xl"
          >
            <HeroSectionForm onSave={handleSave} />
          </DashboardSheet>
        </div>
      )}
    </div>
  );
}
