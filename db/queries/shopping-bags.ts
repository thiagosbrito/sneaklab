import { db } from '@/db'
import { shoppingBags } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface BagItem {
  id: string
  quantity: number
  addedAt: string
  [key: string]: any // Allow for full product properties
}

/**
 * Sync user's bag to database (server-side)
 */
export async function syncBagToDatabase(userId: string, bagItems: BagItem[]) {
  try {
    // Check if user already has a bag
    const existing = await db
      .select()
      .from(shoppingBags)
      .where(eq(shoppingBags.userId, userId))
      .limit(1)

    if (existing.length > 0) {
      // Update existing bag
      const result = await db
        .update(shoppingBags)
        .set({ 
          items: bagItems,
          updatedAt: new Date()
        })
        .where(eq(shoppingBags.userId, userId))
        .returning()

      return result[0]
    } else {
      // Create new bag
      const result = await db
        .insert(shoppingBags)
        .values({
          userId,
          items: bagItems
        })
        .returning()

      return result[0]
    }
  } catch (error) {
    console.error('Error syncing bag to database:', error)
    throw error
  }
}

/**
 * Load user's bag from database (server-side)
 */
export async function loadBagFromDatabase(userId: string): Promise<BagItem[]> {
  try {
    const result = await db
      .select()
      .from(shoppingBags)
      .where(eq(shoppingBags.userId, userId))
      .limit(1)

    if (result.length === 0) {
      return [] // No bag found
    }

    // Return the items array, ensuring it's properly typed
    const items = result[0].items as BagItem[]
    return Array.isArray(items) ? items : []
  } catch (error) {
    console.error('Error loading bag from database:', error)
    throw error
  }
}

/**
 * Clear user's bag from database (server-side)
 */
export async function clearBagFromDatabase(userId: string) {
  try {
    await db
      .update(shoppingBags)
      .set({ 
        items: [],
        updatedAt: new Date()
      })
      .where(eq(shoppingBags.userId, userId))

    return { success: true }
  } catch (error) {
    console.error('Error clearing bag from database:', error)
    throw error
  }
}