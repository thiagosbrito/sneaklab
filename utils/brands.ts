import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabase/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];

export interface BrandWithProductCount extends Brand {
  product_count: number;
}

/**
 * Get all brands from the database
 */
export async function getBrands(supabase: SupabaseClient): Promise<Brand[]> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBrands:', error);
    throw error;
  }
}

/**
 * Get brands with product count
 */
export async function getBrandsWithProductCount(supabase: SupabaseClient): Promise<BrandWithProductCount[]> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select(`
        *,
        products(count)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching brands with product count:', error);
      throw error;
    }

    // Transform the data to include product count
    const brandsWithCount: BrandWithProductCount[] = (data || []).map(brand => ({
      ...brand,
      product_count: Array.isArray(brand.products) ? brand.products.length : 0
    }));

    return brandsWithCount;
  } catch (error) {
    console.error('Error in getBrandsWithProductCount:', error);
    throw error;
  }
}

/**
 * Get a brand by ID
 */
export async function getBrandById(supabase: SupabaseClient, brandId: number): Promise<Brand | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) {
      console.error('Error fetching brand:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getBrandById:', error);
    return null;
  }
}