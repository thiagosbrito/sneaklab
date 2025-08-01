import { db } from '@/db'
import { wishlist, products, brands, categories, Product } from '@/db/schema'
import { and, count, desc, eq } from 'drizzle-orm'

export interface WishlistItemWithProduct {
  id: string
  userId: string
  productId: string
  createdAt: Date | null
  product: Product | null
}

/**
 * Add a product to user's wishlist (server-side)
 */
export async function addToWishlistFromDB(userId: string, productId: string) {
  try {
    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, error: 'Product already in wishlist' }
    }

    // Add to wishlist
    await db.insert(wishlist).values({
      userId,
      productId,
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return { success: false, error: 'Failed to add to wishlist' }
  }
}

/**
 * Remove a product from user's wishlist (server-side)
 */
export async function removeFromWishlistFromDB(userId: string, productId: string) {
  try {
    const result = await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))

    return { success: true }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: 'Failed to remove from wishlist' }
  }
}

/**
 * Get user's wishlist with product details (server-side)
 */
export async function getUserWishlistFromDB(userId: string): Promise<WishlistItemWithProduct[]> {
  try {
    const result = await db
      .select({
        id: wishlist.id,
        userId: wishlist.userId,
        productId: wishlist.productId,
        createdAt: wishlist.createdAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          imageURL: products.imageURL,
          price: products.price,
          promoPrice: products.promoPrice,
          isAvailable: products.isAvailable,
          brandID: products.brandID,
          categoryID: products.categoryID,
          createdAt: products.createdAt,
        },
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .leftJoin(brands, eq(products.brandID, brands.id))
      .leftJoin(categories, eq(products.categoryID, categories.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching user wishlist:', error)
    throw error
  }
}

/**
 * Check if a product is in user's wishlist (server-side)
 */
export async function isInWishlistFromDB(userId: string, productId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ id: wishlist.id })
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1)

    return result.length > 0
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return false
  }
}

/**
 * Get wishlist count for a user (server-side)
 */
export async function getWishlistCountFromDB(userId: string): Promise<number> {
  try {
    const [{ wishlistCount }] = await db
      .select({ wishlistCount: count() })
      .from(wishlist)
      .where(eq(wishlist.userId, userId))

    return Number(wishlistCount)
  } catch (error) {
    console.error('Error getting wishlist count:', error)
    return 0
  }
}