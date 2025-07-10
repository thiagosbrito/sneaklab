import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from './models/products';
import { Database } from '@/utils/supabase/database.types';

type WishlistRow = Database['public']['Tables']['wishlist']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type BrandRow = Database['public']['Tables']['brands']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

type WishlistWithProduct = WishlistRow & {
  products: ProductRow & {
    brands: BrandRow | null;
    categories: CategoryRow;
  };
};

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
        products (
          id,
          name,
          description,
          price,
          promoPrice,
          imageURL,
          isAvailable,
          brandID,
          categoryID,
          created_at,
          brands (
            id,
            name,
            logo
          ),
          categories (
            id,
            name,
            slug
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
    const transformedWishlist: WishlistItem[] = data?.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      created_at: item.created_at || '',
      product: item.products ? {
        id: item.products.id.toString(),
        name: item.products.name,
        description: item.products.description,
        imageUrl: item.products.imageURL || [],
        brandID: item.products.brandID?.toString() || '',
        brandName: item.products.brands?.name,
        brandLogo: item.products.brands?.logo,
        category: item.products.categories?.slug || '',
        categoryID: item.products.categoryID,
        categoryName: item.products.categories?.name,
        isAvailable: item.products.isAvailable,
        price: item.products.price || 0,
        promoPrice: item.products.promoPrice,
        created_at: item.products.created_at
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