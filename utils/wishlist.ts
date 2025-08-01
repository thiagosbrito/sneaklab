import { WishlistItemWithProduct } from '@/db/queries/wishlist';

export type WishlistItem = WishlistItemWithProduct;

/**
 * Add a product to user's wishlist
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to add to wishlist' };
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
  userId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to remove from wishlist' };
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
  userId: string
): Promise<{ wishlist: WishlistItem[]; error?: string }> {
  try {
    const response = await fetch(`/api/wishlist?userId=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { wishlist: [], error: error.message || 'Failed to fetch wishlist' };
    }

    const wishlist = await response.json();
    return { wishlist };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { wishlist: [], error: 'Failed to fetch wishlist' };
  }
}

/**
 * Check if a product is in user's wishlist
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<{ isInWishlist: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/wishlist/check?userId=${userId}&productId=${productId}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { isInWishlist: false, error: error.message || 'Failed to check wishlist' };
    }

    const result = await response.json();
    return { isInWishlist: result.isInWishlist };
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return { isInWishlist: false, error: 'Failed to check wishlist' };
  }
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(
  userId: string
): Promise<{ count: number; error?: string }> {
  try {
    const response = await fetch(`/api/wishlist/count?userId=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { count: 0, error: error.message || 'Failed to get wishlist count' };
    }

    const result = await response.json();
    return { count: result.count };
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return { count: 0, error: 'Failed to get wishlist count' };
  }
}