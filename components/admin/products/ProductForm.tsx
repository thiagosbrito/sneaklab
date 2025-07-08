"use client";
import { useState, useRef } from "react";
import type { Database } from '@/utils/supabase/database.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useSupabaseBrowser from '@/utils/supabase/client';

interface Brand {
  id: number;
  name: string;
}
interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  onSubmit: (product: Omit<Database['public']['Tables']['products']['Insert'], 'id'>) => Promise<void>;
  loading?: boolean;
  brands: Brand[];
  categories: Category[];
}

export default function ProductForm({ onSubmit, loading, brands, categories }: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandID, setBrandID] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabaseBrowser();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false });
      if (uploadError) {
        setError('Upload failed: ' + uploadError.message);
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    setImageURLs(uploadedUrls);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !brandID || !categoryID || !price || imageURLs.length === 0) {
      setError("All fields and at least one image are required.");
      return;
    }
    await onSubmit({
      name,
      description,
      brandID: Number(brandID),
      categoryID: Number(categoryID),
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      isAvailable,
      imageURL: imageURLs,
      created_at: new Date().toISOString(),
    });
    setName("");
    setDescription("");
    setBrandID("");
    setCategoryID("");
    setPrice("");
    setPromoPrice("");
    setIsAvailable(true);
    setImageURLs([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <Input
            placeholder="Product name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <Input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <select
            className="block w-full rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={brandID}
            onChange={e => setBrandID(e.target.value)}
            required
          >
            <option value="" disabled>Select a brand</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="block w-full rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={categoryID}
            onChange={e => setCategoryID(e.target.value)}
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <Input
            placeholder="Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Promo Price</label>
          <Input
            placeholder="Promo Price"
            type="number"
            value={promoPrice}
            onChange={e => setPromoPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Product Images</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
        {imageURLs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {imageURLs.map((url, idx) => (
              <img key={idx} src={url} alt="Product preview" className="w-16 h-16 object-contain rounded border" />
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={e => setIsAvailable(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Product is available</span>
        </label>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </Button>
    </form>
  );
}
