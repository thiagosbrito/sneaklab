"use client";

import { useState, useEffect } from 'react';
import { BestSellerProduct } from '@/utils/bestsellers';

interface UseBestsellersResult {
  bestsellers: BestSellerProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBestsellers(limit: number = 20): UseBestsellersResult {
  const [bestsellers, setBestsellers] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestsellers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/bestsellers?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bestsellers: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch bestsellers');
      }
      
      setBestsellers(result.data || []);
    } catch (err) {
      console.error('Error fetching bestsellers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBestsellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, [limit]);

  return {
    bestsellers,
    loading,
    error,
    refetch: fetchBestsellers
  };
}