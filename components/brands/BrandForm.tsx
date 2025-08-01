"use client";
import { useState, useRef } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useSupabaseBrowser from '@/utils/supabase/client';
import { createBrandAction } from '@/app/actions';

interface BrandFormProps {
  onSuccess?: () => void;
  loading?: boolean;
}

export default function BrandForm({ onSuccess, loading }: BrandFormProps) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabaseBrowser();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !logo) {
      setError("Name and logo are required.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('logo', logo);
      
      const result = await createBrandAction(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Reset form
        setName("");
        setLogo("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSuccess?.();
      }
    } catch (err) {
      setError("Failed to create brand");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error: uploadError } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, file, { upsert: false });
    if (uploadError) {
      setError('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(data.path);
    setLogo(publicUrlData.publicUrl);
    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Brand name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
        {logo && (
          <div className="mt-2 flex items-center space-x-2">
            <img src={logo} alt="Logo preview" className="w-10 h-10 object-contain rounded border" />
            <span className="text-xs text-gray-500 break-all">{logo}</span>
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Brand"}
      </Button>
    </form>
  );
}
