"use client";

import { useState, useEffect } from 'react';

/**
 * Simple hook to get category name by ID
 */
export function useCategoryName(categoryId: string | null | undefined) {
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setCategoryName(null);
      return;
    }

    setLoading(true);
    
    fetch(`/api/categories/by-id/${categoryId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(category => {
        setCategoryName(category?.name || null);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching category:', error);
        setCategoryName(null);
        setLoading(false);
      });
  }, [categoryId]);

  return { categoryName, loading };
}