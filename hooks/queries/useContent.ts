"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import type { 
  HeroSectionResponse, 
  ShowcaseSectionResponse 
} from '@/lib/api-types';

// Hero section hook
export const useHeroSection = () => {
  return useQuery({
    queryKey: ['hero-section'],
    queryFn: async (): Promise<HeroSectionResponse> => {
      return apiClient.get<HeroSectionResponse>('/content/hero');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - content changes rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404s
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Showcase section hook
export const useShowcaseSection = () => {
  return useQuery({
    queryKey: ['showcase-section'],
    queryFn: async (): Promise<ShowcaseSectionResponse> => {
      return apiClient.get<ShowcaseSectionResponse>('/content/showcase');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - content changes rarely
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 404s
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Helper hooks for easier state management
export function useHeroSectionState() {
  const { data, isLoading, error } = useHeroSection();
  
  return {
    heroData: data || null, // Data comes directly from API, not wrapped
    loading: isLoading,
    error: error?.message || null,
  };
}

export function useShowcaseSectionState() {
  const { data, isLoading, error } = useShowcaseSection();
  
  return {
    showcaseData: data || null, // Data comes directly from API, not wrapped
    loading: isLoading,
    error: error?.message || null,
  };
}
