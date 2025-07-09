import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSupabaseBrowser from "@/utils/supabase/client";

interface ShowcaseSectionFormProps {
  initialData?: {
    imageUrl: string;
    title: string;
    subtitleA: string;
    subtitleB: string;
    subtitleDescriptionA: string;
    subtitleDescriptionB: string;
    description: string;
  };
  onSave: () => void;
}

export default function ShowcaseSectionForm({ initialData, onSave }: ShowcaseSectionFormProps) {
  const [formData, setFormData] = useState({
    imageUrl: initialData?.imageUrl || "",
    title: initialData?.title || "",
    subtitleA: initialData?.subtitleA || "",
    subtitleB: initialData?.subtitleB || "",
    subtitleDescriptionA: initialData?.subtitleDescriptionA || "",
    subtitleDescriptionB: initialData?.subtitleDescriptionB || "",
    description: initialData?.description || "",
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
    setFormData((prev) => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const snakeCaseData = {
      image_url: formData.imageUrl,
      title: formData.title,
      subtitle_a: formData.subtitleA,
      subtitle_b: formData.subtitleB,
      subtitle_description_a: formData.subtitleDescriptionA,
      subtitle_description_b: formData.subtitleDescriptionB,
      description: formData.description,
    };

    const { error } = await supabase.from("showcase_section").upsert([snakeCaseData]);

    if (error) {
      console.error("Error saving showcase section:", error.message);
    } else {
      alert("Showcase section saved successfully!");
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
        {formData.imageUrl && (
          <div className="mt-2 flex items-center space-x-2">
            <img
              src={formData.imageUrl}
              alt="Image preview"
              className="w-10 h-10 object-contain rounded border"
            />
            <span className="text-xs text-gray-500 break-all">
              {formData.imageUrl}
            </span>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="subtitleA">Subtitle A</Label>
        <Input
          type="text"
          id="subtitleA"
          name="subtitleA"
          value={formData.subtitleA}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="subtitleB">Subtitle B</Label>
        <Input
          type="text"
          id="subtitleB"
          name="subtitleB"
          value={formData.subtitleB}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="subtitleDescriptionA">Subtitle Description A</Label>
        <Input
          type="text"
          id="subtitleDescriptionA"
          name="subtitleDescriptionA"
          value={formData.subtitleDescriptionA}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="subtitleDescriptionB">Subtitle Description B</Label>
        <Input
          type="text"
          id="subtitleDescriptionB"
          name="subtitleDescriptionB"
          value={formData.subtitleDescriptionB}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit">Save</Button>
    </form>
  );
}
