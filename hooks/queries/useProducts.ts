"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient, buildQueryString, ApiError } from '@/lib/api-client';
import type { 
  ProductsResponse, 
  ProductFilters, 
  ProductWithRelations,
  ApiResponse 
} from '@/lib/api-types';
import type { Product } from '@/db/schema';

// Products listing hook
export function useProducts(filters: ProductFilters = {}) {
  const queryKey = ['products', filters];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<ProductsResponse> => {
      const queryString = buildQueryString(filters);
      const endpoint = filters.category 
        ? `/products/category/${filters.category}?${queryString}`
        : `/products?${queryString}`;
      
      return apiClient.get<ProductsResponse>(endpoint);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change frequently
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404 (category not found)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

// Individual product hook
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<ApiResponse<ProductWithRelations>> => {
      return apiClient.get<ApiResponse<ProductWithRelations>>(`/products/${id}`);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - individual products change less frequently
    gcTime: 30 * 60 * 1000,    // 30 minutes
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404 (product not found)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

// Products by category hook (alternative to useProducts with category filter)
export function useProductsByCategory(categorySlug: string, filters: Omit<ProductFilters, 'category'> = {}) {
  const queryKey = ['products', 'category', categorySlug, filters];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<ProductsResponse> => {
      const queryString = buildQueryString(filters);
      return apiClient.get<ProductsResponse>(`/products/category/${categorySlug}?${queryString}`);
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404 (category not found)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

// Helper hook to get product loading and error states in a unified way
export function useProductState(id: string) {
  const { data, isLoading, error, isError } = useProduct(id);
  
  return {
    product: data?.data || null,
    loading: isLoading,
    error: error?.message || null,
    notFound: error?.status === 404,
  };
}

// Helper hook to get products listing state in a unified way  
export function useProductsState(filters: ProductFilters = {}) {
  const { data, isLoading, error, isError } = useProducts(filters);
  
  return {
    products: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    categoryNotFound: error?.status === 404,
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}