"use client";

import { useState, useEffect } from 'react';
import { getCategoryName, getBrandName, getProductDisplayNames } from '@/utils/lookups';

/**
 * Hook to get category name by ID
 */
export function useCategoryName(categoryId: string | null | undefined) {
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setCategoryName(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getCategoryName(categoryId)
      .then((name) => {
        if (isMounted) {
          setCategoryName(name);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch category name');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  return { categoryName, loading, error };
}

/**
 * Hook to get brand name by ID
 */
export function useBrandName(brandId: string | null | undefined) {
  const [brandName, setBrandName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setBrandName(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getBrandName(brandId)
      .then((name) => {
        if (isMounted) {
          setBrandName(name);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch brand name');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [brandId]);

  return { brandName, loading, error };
}

/**
 * Hook to get both category and brand names for a product
 */
export function useProductDisplayNames(
  categoryId: string | null | undefined,
  brandId?: string | null | undefined
) {
  const [names, setNames] = useState<{
    categoryName: string | null;
    brandName: string | null;
  }>({
    categoryName: null,
    brandName: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setNames({ categoryName: null, brandName: null });
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getProductDisplayNames(categoryId, brandId)
      .then((result) => {
        if (isMounted) {
          setNames(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch display names');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId, brandId]);

  return { ...names, loading, error };
}

/**
 * Hook for batch category names lookup
 */
export function useCategoryNames(categoryIds: string[]) {
  const [categoryNames, setCategoryNames] = useState<Map<string, string | null>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryIds.length === 0) {
      setCategoryNames(new Map());
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Import the batch function dynamically to avoid circular dependency
    import('@/utils/lookups').then(({ getCategoryNames }) => {
      return getCategoryNames(categoryIds);
    })
      .then((namesMap) => {
        if (isMounted) {
          setCategoryNames(namesMap);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch category names');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryIds.join(',')]); // Use join to create stable dependency

  return { categoryNames, loading, error };
}

/**
 * Hook for batch brand names lookup
 */
export function useBrandNames(brandIds: string[]) {
  const [brandNames, setBrandNames] = useState<Map<string, string | null>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brandIds.length === 0) {
      setBrandNames(new Map());
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Import the batch function dynamically to avoid circular dependency
    import('@/utils/lookups').then(({ getBrandNames }) => {
      return getBrandNames(brandIds);
    })
      .then((namesMap) => {
        if (isMounted) {
          setBrandNames(namesMap);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch brand names');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [brandIds.join(',')]); // Use join to create stable dependency

  return { brandNames, loading, error };
}