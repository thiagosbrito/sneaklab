"use client";
import { useEffect, useState } from "react";
import { Brand } from '@/db/schema';
import BrandForm from '@/components/brands/BrandForm';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBrands() {
    setLoading(true);
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      
      if (response.ok) {
        setBrands(data);
      } else {
        setError(data.error || 'Failed to fetch brands');
      }
    } catch (err) {
      setError('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleBrandSuccess = () => {
    fetchBrands(); // Refresh the list
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Brands</h1>
      <div className="max-w-md mb-8">
        <BrandForm onSuccess={handleBrandSuccess} />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 border border-gray-100">
                <ImageWithFallback
                  src={brand.logo || ''}
                  alt={brand.name}
                  className="w-12 h-12 object-contain rounded"
                  fallback={<div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">No Image</div>}
                />
                <div>
                  <div className="font-semibold text-lg">{brand.name}</div>
                  <div className="text-xs text-gray-500">ID: {brand.id}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-gray-500">No brands found.</div>
          )}
        </div>
      )}
    </div>
  );
}
