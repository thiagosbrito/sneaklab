"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { syncBagAction, loadBagAction, clearBagAction, BagItem } from '@/lib/actions/bag-actions';

// Load bag query
export function useBagQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ['bag'],
    queryFn: loadBagAction,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - bag doesn't change frequently
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Authentication')) return false;
      return failureCount < 2;
    },
  });
}

// Sync bag mutation
export function useSyncBag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bagItems: BagItem[]) => syncBagAction(bagItems),
    onSuccess: (data, variables) => {
      // Update the bag query cache with the new data
      queryClient.setQueryData(['bag'], variables);
    },
    onError: (error) => {
      console.error('Bag sync failed:', error);
    }
  });
}

// Clear bag mutation
export function useClearBag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearBagAction,
    onSuccess: () => {
      // Update the bag query cache to empty array
      queryClient.setQueryData(['bag'], []);
    },
    onError: (error) => {
      console.error('Bag clear failed:', error);
    }
  });
}

// Helper hook to get bag state in a unified way
export function useBagState() {
  const { data, isLoading, error } = useBagQuery();
  
  return {
    bag: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}