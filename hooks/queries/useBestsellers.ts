"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BestsellersResponse } from '@/lib/api-types';

// Bestsellers hook
export function useBestsellers(limit: number = 20) {
  return useQuery({
    queryKey: ['bestsellers', limit],
    queryFn: async (): Promise<BestsellersResponse> => {
      return apiClient.get<BestsellersResponse>(`/bestsellers?limit=${limit}`);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - bestsellers change less frequently
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for bestsellers
  });
}

// Helper hook to get bestsellers state in a unified way
export function useBestsellersState(limit: number = 20) {
  const { data, isLoading, error } = useBestsellers(limit);
  
  return {
    bestsellers: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}