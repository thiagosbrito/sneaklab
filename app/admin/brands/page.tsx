
"use client";
import { useEffect, useState } from "react";
import type { Database } from '@/utils/supabase/database.types';
import useSupabaseBrowser from '@/utils/supabase/client';
import BrandForm from '@/components/brands/BrandForm';

export default function BrandsPage() {
  const supabase = useSupabaseBrowser();
  const [brands, setBrands] = useState<Database['public']['Tables']['brands']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function fetchBrands() {
    setLoading(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });
    if (error) setError(error.message);
    else setBrands(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddBrand(brand: Omit<Database['public']['Tables']['brands']['Insert'], 'id'>) {
    setAdding(true);
    setError(null);
    const { error } = await supabase.from('brands').insert([brand]);
    if (error) setError(error.message);
    else await fetchBrands();
    setAdding(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Brands</h1>
      <div className="max-w-md mb-8">
        <BrandForm onSubmit={handleAddBrand} loading={adding} />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 border border-gray-100">
                <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain rounded" />
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
