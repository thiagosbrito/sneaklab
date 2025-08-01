import { db } from '@/db'
import { categories } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'

/**
 * Get all categories from the database (server-side)
 */
export async function getCategoriesFromDB() {
  try {
    const result = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name))

    return result
  } catch (error) {
    console.error('Error fetching categories from database:', error)
    throw error
  }
}

/**
 * Get categories that should show in menu from the database (server-side)
 */
export async function getMenuCategoriesFromDB() {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.showInMenu, true))
      .orderBy(asc(categories.name))

    return result
  } catch (error) {
    console.error('Error fetching menu categories from database:', error)
    throw error
  }
}

/**
 * Get a category by slug from the database (server-side)
 */
export async function getCategoryBySlugFromDB(slug: string) {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching category by slug from database:', error)
    throw error
  }
}

/**
 * Get a category by ID from the database (server-side)
 */
export async function getCategoryByIdFromDB(id: string) {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching category by ID from database:', error)
    throw error
  }
}