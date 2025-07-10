import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from './models/products';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: number;
  created_at: string;
  product?: Product;
}

/**
 * Add a product to user's wishlist
 */
export async function addToWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .insert([
        {
          user_id: userId,
          product_id: productId,
        }
      ]);

    if (error) {
      // Handle duplicate entries gracefully
      if (error.code === '23505') {
        return { success: true }; // Already in wishlist, treat as success
      }
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: 'Failed to add to wishlist' };
  }
}

/**
 * Remove a product from user's wishlist
 */
export async function removeFromWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: 'Failed to remove from wishlist' };
  }
}

/**
 * Get user's wishlist with product details
 */
export async function getUserWishlist(
  supabase: SupabaseClient,
  userId: string
): Promise<{ wishlist: WishlistItem[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        user_id,
        product_id,
        created_at,
        product:products (
          id,
          name,
          description,
          price,
          "promoPrice",
          "imageUrl",
          "isAvailable",
          category,
          "brandId",
          brands!inner (
            id,
            name
          ),
          categories!inner (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return { wishlist: [], error: error.message };
    }

    // Transform the data to match our Product model
    const transformedWishlist: WishlistItem[] = data?.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product,
        brandName: item.product.brands?.name,
        categoryName: item.product.categories?.name,
      } : undefined
    })) || [];

    return { wishlist: transformedWishlist };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { wishlist: [], error: 'Failed to fetch wishlist' };
  }
}

/**
 * Check if a product is in user's wishlist
 */
export async function isInWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: number
): Promise<{ isInWishlist: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking wishlist:', error);
      return { isInWishlist: false, error: error.message };
    }

    return { isInWishlist: !!data };
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return { isInWishlist: false, error: 'Failed to check wishlist' };
  }
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(
  supabase: SupabaseClient,
  userId: string
): Promise<{ count: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting wishlist count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return { count: 0, error: 'Failed to get wishlist count' };
  }
}