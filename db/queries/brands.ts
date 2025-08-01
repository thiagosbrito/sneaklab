import { db } from '@/db'
import { brands, products } from '@/db/schema'
import { count, desc, eq } from 'drizzle-orm'

export interface BrandWithProductCount {
  id: string
  name: string
  logo: string
  createdAt: Date
  product_count: number
}

/**
 * Get all brands from the database (server-side)
 */
export async function getBrandsFromDB() {
  try {
    const result = await db
      .select()
      .from(brands)
      .orderBy(desc(brands.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching brands from database:', error)
    throw error
  }
}

/**
 * Get brands with product count from the database (server-side)
 */
export async function getBrandsWithProductCountFromDB(): Promise<BrandWithProductCount[]> {
  try {
    const result = await db
      .select({
        id: brands.id,
        name: brands.name,
        logo: brands.logo,
        createdAt: brands.createdAt,
        product_count: count(products.id),
      })
      .from(brands)
      .leftJoin(products, eq(brands.id, products.brandID))
      .groupBy(brands.id, brands.name, brands.logo, brands.createdAt)
      .orderBy(desc(brands.createdAt))

    return result.map(row => ({
      ...row,
      product_count: Number(row.product_count), // Convert BigInt to number
    }))
  } catch (error) {
    console.error('Error fetching brands with product count from database:', error)
    throw error
  }
}

/**
 * Get a brand by ID from the database (server-side)
 */
export async function getBrandByIdFromDB(brandId: string) {
  try {
    const result = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching brand by ID from database:', error)
    throw error
  }
}