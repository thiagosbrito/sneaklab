import { Brand } from '@/db/schema';
import { getBrandsFromDB, getBrandsWithProductCountFromDB, getBrandByIdFromDB } from '@/db/queries/brands';

export interface BrandWithProductCount extends Brand {
  product_count: number;
}

/**
 * Get all brands - uses direct DB query for server-side, API for client-side
 */
export async function getBrands(): Promise<Brand[]> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getBrandsFromDB();
  }

  // Client-side: use API
  try {
    const response = await fetch('/api/brands');
    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }

    const brands = await response.json();
    return brands || [];
  } catch (error) {
    console.error('Error in getBrands:', error);
    throw error;
  }
}

/**
 * Get brands with product count - uses direct DB query for server-side, API for client-side
 */
export async function getBrandsWithProductCount(): Promise<BrandWithProductCount[]> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getBrandsWithProductCountFromDB();
  }

  // Client-side: use API (fallback to current implementation for now)
  try {
    // For now, fetch brands and set product_count to 0
    // TODO: Create /api/brands/with-count endpoint for actual product counts
    const brands = await getBrands();
    
    const brandsWithCount: BrandWithProductCount[] = brands.map(brand => ({
      ...brand,
      product_count: 0 // TODO: Calculate actual product count
    }));

    return brandsWithCount;
  } catch (error) {
    console.error('Error in getBrandsWithProductCount:', error);
    throw error;
  }
}

/**
 * Get a brand by ID - uses direct DB query for server-side, API for client-side
 */
export async function getBrandById(brandId: string): Promise<Brand | null> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getBrandByIdFromDB(brandId);
  }

  // Client-side: use API
  try {
    const response = await fetch(`/api/brands/${brandId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch brand');
    }

    const brand = await response.json();
    return brand;
  } catch (error) {
    console.error('Error in getBrandById:', error);
    return null;
  }
}

/**
 * Get brand name by ID - utility function for quick lookups
 */
export async function getBrandNameById(brandId: string): Promise<string | null> {
  try {
    const brand = await getBrandById(brandId);
    return brand?.name || null;
  } catch (error) {
    console.error('Error getting brand name by ID:', error);
    return null;
  }
}