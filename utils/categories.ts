import { Category } from '@/db/schema';
import { 
  getCategoriesFromDB, 
  getMenuCategoriesFromDB, 
  getCategoryBySlugFromDB, 
  getCategoryByIdFromDB 
} from '@/db/queries/categories';

/**
 * Get all categories - uses direct DB query for server-side, API for client-side
 */
export async function getCategories(): Promise<Category[]> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getCategoriesFromDB();
  }

  // Client-side: use API
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const categories = await response.json();
    return categories || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
}

/**
 * Get categories that should show in menu - uses direct DB query for server-side, API for client-side
 */
export async function getMenuCategories(): Promise<Category[]> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getMenuCategoriesFromDB();
  }

  // Client-side: use API
  try {
    const response = await fetch('/api/categories?menuOnly=true');
    if (!response.ok) {
      throw new Error('Failed to fetch menu categories');
    }

    const categories = await response.json();
    return categories || [];
  } catch (error) {
    console.error('Error in getMenuCategories:', error);
    throw error;
  }
}

/**
 * Get a category by slug - uses direct DB query for server-side, API for client-side
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getCategoryBySlugFromDB(slug);
  }

  // Client-side: use API
  try {
    const response = await fetch(`/api/categories/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch category');
    }

    const category = await response.json();
    return category;
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error);
    return null;
  }
}

/**
 * Get a category by ID - uses direct DB query for server-side, API for client-side
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getCategoryByIdFromDB(id);
  }

  // Client-side: use API
  try {
    const response = await fetch(`/api/categories/by-id/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch category');
    }

    const category = await response.json();
    return category;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return null;
  }
}