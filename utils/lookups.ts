import { getBrandNameById } from './brands'
import { getCategoryNameById } from './categories'

/**
 * Utility functions for quick ID-to-name lookups
 */

/**
 * Get category name by category ID
 * @param categoryId - The category ID
 * @returns Category name or null if not found
 */
export async function getCategoryName(categoryId: string): Promise<string | null> {
  return getCategoryNameById(categoryId)
}

/**
 * Get brand name by brand ID
 * @param brandId - The brand ID
 * @returns Brand name or null if not found
 */
export async function getBrandName(brandId: string): Promise<string | null> {
  return getBrandNameById(brandId)
}

/**
 * Get both category and brand names for a product
 * @param categoryId - The category ID
 * @param brandId - The brand ID (optional)
 * @returns Object with category and brand names
 */
export async function getProductDisplayNames(
  categoryId: string, 
  brandId?: string | null
): Promise<{ categoryName: string | null; brandName: string | null }> {
  const [categoryName, brandName] = await Promise.all([
    getCategoryName(categoryId),
    brandId ? getBrandName(brandId) : Promise.resolve(null)
  ])

  return { categoryName, brandName }
}

/**
 * Batch lookup for multiple category IDs
 * @param categoryIds - Array of category IDs
 * @returns Map of category ID to category name
 */
export async function getCategoryNames(categoryIds: string[]): Promise<Map<string, string | null>> {
  const results = await Promise.all(
    categoryIds.map(async (id) => [id, await getCategoryName(id)] as const)
  )
  
  return new Map(results)
}

/**
 * Batch lookup for multiple brand IDs
 * @param brandIds - Array of brand IDs
 * @returns Map of brand ID to brand name
 */
export async function getBrandNames(brandIds: string[]): Promise<Map<string, string | null>> {
  const results = await Promise.all(
    brandIds.map(async (id) => [id, await getBrandName(id)] as const)
  )
  
  return new Map(results)
}