"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import type { CategoriesResponse } from '@/lib/api-types';

// All categories hook
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoriesResponse> => {
      return apiClient.get<CategoriesResponse>('/categories');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change very rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

// Menu categories hook (only categories that should show in menu)
export function useMenuCategories() {
  return useQuery({
    queryKey: ['categories', 'menu'],
    queryFn: async (): Promise<CategoriesResponse> => {
      return apiClient.get<CategoriesResponse>('/categories?menuOnly=true');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - menu categories change very rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

// Individual category hook
export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      return apiClient.get(`/categories/by-id/${id}`);
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

// Category by slug hook
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', 'slug', slug],
    queryFn: async () => {
      return apiClient.get(`/categories/${slug}`);
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404 (category not found)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

// Helper hook to get categories state in a unified way
export function useCategoriesState() {
  const { data, isLoading, error } = useCategories();
  
  return {
    categories: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

// Helper hook to get menu categories state in a unified way
export function useMenuCategoriesState() {
  const { data, isLoading, error } = useMenuCategories();
  
  return {
    categories: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}