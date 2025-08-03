"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { syncBagAction, loadBagAction, clearBagAction, BagItem } from '@/lib/actions/bag-actions';

// Load bag query with enhanced caching
export function useBagQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ['bag'],
    queryFn: loadBagAction,
    enabled,
    staleTime: 2 * 60 * 1000,   // 2 minutes - balance freshness with performance
    gcTime: 15 * 60 * 1000,     // 15 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: false,       // Don't refetch on mount if we have cached data
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Authentication')) return false;
      return failureCount < 2;
    },
    // Network-mode for better offline experience
    networkMode: 'offlineFirst',
  });
}

// Sync bag mutation with optimistic updates
export function useSyncBag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bagItems: BagItem[]) => syncBagAction(bagItems),
    onMutate: async (newBagItems) => {
      // Cancel outgoing refetches to avoid overriding optimistic update
      await queryClient.cancelQueries({ queryKey: ['bag'] });

      // Snapshot the previous value
      const previousBag = queryClient.getQueryData(['bag']);

      // Optimistically update to the new value
      queryClient.setQueryData(['bag'], newBagItems);

      // Return context for rollback
      return { previousBag };
    },
    onError: (error, newBagItems, context) => {
      // Rollback to previous value on error
      if (context?.previousBag) {
        queryClient.setQueryData(['bag'], context.previousBag);
      }
      console.error('Bag sync failed:', error);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ['bag'] });
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