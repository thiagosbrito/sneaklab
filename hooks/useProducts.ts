"use client";

import { useState, useEffect } from 'react';
import { Product } from '@/utils/models/products';

interface UseProductsOptions {
  category?: string;
  brand?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 20
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (options.category) params.append('category', options.category);
      if (options.brand) params.append('brand', options.brand.toString());
      if (options.search) params.append('search', options.search);
      if (options.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());
      if (options.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());
      if (options.available !== undefined) params.append('available', options.available.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const endpoint = options.category 
        ? `/api/products/category/${options.category}?${params.toString()}`
        : `/api/products?${params.toString()}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      setProducts(result.data || []);
      setPagination(result.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 20
      });

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 20
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    options.category,
    options.brand,
    options.search,
    options.minPrice,
    options.maxPrice,
    options.available,
    options.sortBy,
    options.sortOrder,
    options.page,
    options.limit
  ]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  };
}

export function useProduct(id: string): {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setProduct(null);
          setError('Product not found');
          return;
        }
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch product');
      }

      setProduct(result.data);

    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
}