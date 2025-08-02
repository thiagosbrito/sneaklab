'use server'

import { db } from '@/db'
import { shoppingBags } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BagItem {
  id: string
  quantity: number
  addedAt: string
  [key: string]: unknown // Allow for full product properties
}

/**
 * Server Action: Sync user's bag to database
 */
export async function syncBagAction(bagItems: BagItem[]) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check if user already has a bag
    const existing = await db
      .select()
      .from(shoppingBags)
      .where(eq(shoppingBags.userId, user.id))
      .limit(1)

    if (existing.length > 0) {
      // Update existing bag
      const result = await db
        .update(shoppingBags)
        .set({ 
          items: bagItems,
          updatedAt: new Date()
        })
        .where(eq(shoppingBags.userId, user.id))
        .returning()

      return { success: true, bag: result[0] }
    } else {
      // Create new bag
      const result = await db
        .insert(shoppingBags)
        .values({
          userId: user.id,
          items: bagItems,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      return { success: true, bag: result[0] }
    }
  } catch (error) {
    console.error('Error syncing bag:', error)
    throw new Error('Failed to sync bag to database')
  }
}

/**
 * Server Action: Load user's bag from database
 */
export async function loadBagAction(): Promise<BagItem[]> {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return [] // Return empty array for unauthenticated users
    }

    const result = await db
      .select()
      .from(shoppingBags)
      .where(eq(shoppingBags.userId, user.id))
      .limit(1)

    if (result.length === 0) {
      return []
    }

    // Return the items array, ensuring it's an array of BagItems
    const items = result[0].items as BagItem[]
    return Array.isArray(items) ? items : []
  } catch (error) {
    console.error('Error loading bag:', error)
    return []
  }
}

/**
 * Server Action: Clear user's bag from database
 */
export async function clearBagAction() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Delete the user's bag
    await db
      .delete(shoppingBags)
      .where(eq(shoppingBags.userId, user.id))

    return { success: true }
  } catch (error) {
    console.error('Error clearing bag:', error)
    throw new Error('Failed to clear bag from database')
  }
}