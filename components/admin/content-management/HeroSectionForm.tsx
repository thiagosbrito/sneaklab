import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSupabaseBrowser from "@/utils/supabase/client";

interface HeroSectionFormProps {
  initialData?: {
    backgroundImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    ctaRedirectTo: string;
  };
  onSave: () => void;
}

export default function HeroSectionForm({ initialData, onSave }: HeroSectionFormProps) {
  const [formData, setFormData] = useState({
    backgroundImageUrl: initialData?.backgroundImageUrl || "",
    heroTitle: initialData?.heroTitle || "",
    heroSubtitle: initialData?.heroSubtitle || "",
    ctaText: initialData?.ctaText || "",
    ctaRedirectTo: initialData?.ctaRedirectTo || "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabaseBrowser();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(fileName, file, { upsert: false });
    if (uploadError) {
      setError("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from("content-images")
      .getPublicUrl(data.path);
    setFormData((prev) => ({ ...prev, backgroundImageUrl: publicUrlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const snakeCaseData = {
      background_image_url: formData.backgroundImageUrl,
      hero_title: formData.heroTitle,
      hero_subtitle: formData.heroSubtitle,
      cta_text: formData.ctaText,
      cta_redirect_to: formData.ctaRedirectTo,
    };

    const { error } = await supabase.from("hero_section").upsert([snakeCaseData]);

    if (error) {
      console.error("Error saving hero section:", error.message);
    } else {
      alert("Hero section saved successfully!");
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="backgroundImage">Background Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
        {formData.backgroundImageUrl && (
          <div className="mt-2 flex items-center space-x-2">
            <img
              src={formData.backgroundImageUrl}
              alt="Background preview"
              className="w-10 h-10 object-contain rounded border"
            />
            <span className="text-xs text-gray-500 break-all">
              {formData.backgroundImageUrl}
            </span>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="heroTitle">Hero Title</Label>
        <Input
          type="text"
          id="heroTitle"
          name="heroTitle"
          value={formData.heroTitle}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
        <Input
          type="text"
          id="heroSubtitle"
          name="heroSubtitle"
          value={formData.heroSubtitle}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="ctaText">CTA Text</Label>
        <Input
          type="text"
          id="ctaText"
          name="ctaText"
          value={formData.ctaText}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="ctaRedirectTo">CTA Redirect To</Label>
        <Input
          type="text"
          id="ctaRedirectTo"
          name="ctaRedirectTo"
          value={formData.ctaRedirectTo}
          onChange={handleChange}
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit">Save</Button>
    </form>
  );
}
