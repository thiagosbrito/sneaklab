"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { 
  HeroSectionResponse, 
  ShowcaseSectionResponse 
} from '@/lib/api-types';

// Hero section hook
export function useHeroSection() {
  return useQuery({
    queryKey: ['content', 'hero'],
    queryFn: async () => {
      // Call API directly since it returns the hero data, not wrapped in ApiResponse
      const response = await fetch('/api/content/hero');
      if (!response.ok) {
        throw new Error(`Failed to fetch hero content: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - content changes infrequently
    gcTime: 60 * 60 * 1000,    // 1 hour
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no content found)
      if (error?.message?.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

// Showcase section hook
export function useShowcaseSection() {
  return useQuery({
    queryKey: ['content', 'showcase'],
    queryFn: async () => {
      // Call API directly since it returns the showcase data, not wrapped in ApiResponse
      const response = await fetch('/api/content/showcase');
      if (!response.ok) {
        throw new Error(`Failed to fetch showcase content: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - content changes infrequently
    gcTime: 60 * 60 * 1000,    // 1 hour
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no content found)
      if (error?.message?.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

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
