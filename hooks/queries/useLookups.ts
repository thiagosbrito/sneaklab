"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import type { Brand, Category } from '@/db/schema';

// Brand lookup hook
export function useBrand(brandId: string | null | undefined) {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: async (): Promise<Brand> => {
      return apiClient.get<Brand>(`/brands/${brandId}`);
    },
    enabled: !!brandId,
    staleTime: 30 * 60 * 1000, // 30 minutes - brand data changes rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

// Category lookup hook
export function useCategory(categoryId: string | null | undefined) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: async (): Promise<Category> => {
      return apiClient.get<Category>(`/categories/by-id/${categoryId}`);
    },
    enabled: !!categoryId,
    staleTime: 30 * 60 * 1000, // 30 minutes - category data changes rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

// Helper hooks for easier state management
export function useBrandName(brandId: string | null | undefined) {
  const { data, isLoading, error } = useBrand(brandId);
  
  return {
    brandName: data?.name || null,
    loading: isLoading,
    error: error?.message || null,
  };
}

export function useCategoryName(categoryId: string | null | undefined) {
  const { data, isLoading, error } = useCategory(categoryId);
  
  return {
    categoryName: data?.name || null,
    loading: isLoading,
    error: error?.message || null,
  };
}

// Combined hook for product display names
export function useProductDisplayNames(
  categoryId: string | null | undefined,
  brandId?: string | null | undefined
) {
  const { brandName, loading: brandLoading } = useBrandName(brandId);
  const { categoryName, loading: categoryLoading } = useCategoryName(categoryId);
  
  return {
    brandName,
    categoryName,
    loading: brandLoading || categoryLoading,
    error: null, // Could combine errors if needed
  };
}
