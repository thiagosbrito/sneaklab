import { db } from '@/db'
import { products, categories, brands } from '@/db/schema'
import { and, count, desc, asc, eq, ilike, gte, lte, sql } from 'drizzle-orm'

export interface ProductsResult {
  products: Array<{
    id: string
    name: string
    description: string | null
    imageURL: string[] | null
    brandID: string | null
    categoryID: string
    isAvailable: boolean
    price: string | null
    promoPrice: string | null
    createdAt: Date
    brandName?: string | null
    categoryName?: string | null
    categorySlug?: string | null
  }>
  totalCount: number
  currentPage: number
  totalPages: number
  categoryNotFound?: boolean
}

export interface ProductFilters {
  categorySlug?: string
  brandId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  isAvailable?: boolean
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Get products from the database with filters (server-side)
 */
export async function getProductsFromDB(filters: ProductFilters = {}): Promise<ProductsResult> {
  const {
    categorySlug,
    brandId,
    search,
    minPrice,
    maxPrice,
    isAvailable = true,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters

  try {
    console.log('🔍 Fetching products from DB with filters:', filters)

    // Build WHERE conditions
    const conditions = []
    
    if (isAvailable !== undefined) {
      conditions.push(eq(products.isAvailable, isAvailable))
    }
    
    if (categorySlug) {
      conditions.push(eq(categories.slug, categorySlug))
    }
    
    if (brandId) {
      conditions.push(eq(products.brandID, brandId))
    }
    
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`))
    }
    
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()))
    }
    
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build ORDER BY clause
    const orderByClause = sortOrder === 'desc' 
      ? desc(sortBy === 'name' ? products.name : sortBy === 'price' ? products.price : products.createdAt)
      : asc(sortBy === 'name' ? products.name : sortBy === 'price' ? products.price : products.createdAt)

    // Calculate offset
    const offset = (page - 1) * limit

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(products)
      .leftJoin(categories, eq(products.categoryID, categories.id))
      .leftJoin(brands, eq(products.brandID, brands.id))
      .where(whereClause)

    // Get products with joins
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageURL: products.imageURL,
        brandID: products.brandID,
        categoryID: products.categoryID,
        isAvailable: products.isAvailable,
        price: products.price,
        promoPrice: products.promoPrice,
        createdAt: products.createdAt,
        brandName: brands.name,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryID, categories.id))
      .leftJoin(brands, eq(products.brandID, brands.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // Check if category exists when filtering by category
    let categoryNotFound = false
    if (categorySlug && result.length === 0) {
      const categoryExists = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1)
      
      categoryNotFound = categoryExists.length === 0
    }

    const totalPages = Math.ceil(Number(totalCount) / limit)

    return {
      products: result,
      totalCount: Number(totalCount),
      currentPage: page,
      totalPages,
      categoryNotFound
    }

  } catch (error) {
    console.error('❌ Error fetching products from database:', error)
    return {
      products: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0
    }
  }
}

/**
 * Get products by category from the database (server-side)
 */
export async function getProductsByCategoryFromDB(
  categorySlug: string, 
  options: Omit<ProductFilters, 'categorySlug'> = {}
): Promise<ProductsResult> {
  return getProductsFromDB({ ...options, categorySlug })
}

/**
 * Get a product by ID from the database (server-side)
 */
export async function getProductByIdFromDB(id: string) {
  try {
    console.log('🔍 Fetching product by ID from DB:', id)

    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageURL: products.imageURL,
        brandID: products.brandID,
        categoryID: products.categoryID,
        isAvailable: products.isAvailable,
        price: products.price,
        promoPrice: products.promoPrice,
        createdAt: products.createdAt,
        brandName: brands.name,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryID, categories.id))
      .leftJoin(brands, eq(products.brandID, brands.id))
      .where(eq(products.id, id))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    console.log('✅ Product fetched from DB:', result[0].name)
    return result[0]

  } catch (error) {
    console.error('❌ Error fetching product from database:', error)
    return null
  }
}

/**
 * Get featured products from the database (server-side)
 */
export async function getFeaturedProductsFromDB(limit: number = 8) {
  const result = await getProductsFromDB({
    isAvailable: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit
  })
  
  return result.products
}

/**
 * Search products in the database (server-side)
 */
export async function searchProductsFromDB(
  searchTerm: string,
  options: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResult> {
  return getProductsFromDB({ ...options, search: searchTerm })
}