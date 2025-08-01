"use client";

import { useState, useEffect } from 'react';

/**
 * Simple hook to get brand name by ID
 */
export function useBrandName(brandId: string | null | undefined) {
  const [brandName, setBrandName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brandId) {
      setBrandName(null);
      return;
    }

    setLoading(true);
    
    fetch(`/api/brands/${brandId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(brand => {
        setBrandName(brand?.name || null);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching brand:', error);
        setBrandName(null);
        setLoading(false);
      });
  }, [brandId]);

  return { brandName, loading };
}