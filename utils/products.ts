import { Product } from '@/db/schema'
import { 
  getProductsFromDB, 
  getProductsByCategoryFromDB, 
  getProductByIdFromDB, 
  getFeaturedProductsFromDB, 
  searchProductsFromDB,
  ProductsResult as DBProductsResult,
  ProductFilters as DBProductFilters
} from '@/db/queries/products'

export interface ProductsResult {
  products: Product[]
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

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResult> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getProductsFromDB(filters)
  }

  // Client-side: use API
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
    console.log('🔍 Fetching products with filters:', filters)

    // Build query parameters
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (brandId) params.set('brand', brandId)
    if (search) params.set('search', search)
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString())
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString())
    if (isAvailable !== undefined) params.set('available', isAvailable.toString())
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    params.set('page', page.toString())
    params.set('limit', limit.toString())

    // Use appropriate API endpoint
    const endpoint = categorySlug 
      ? `/api/products/category/${categorySlug}?${params.toString()}`
      : `/api/products?${params.toString()}`

    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    const result = await response.json()
    
    return {
      products: result.data || [],
      totalCount: result.totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((result.totalCount || 0) / limit),
      categoryNotFound: result.categoryNotFound
    }

  } catch (error) {
    console.error('❌ Error fetching products:', error)
    return {
      products: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0
    }
  }
}

export async function getProductsByCategory(
  categorySlug: string, 
  options: Omit<ProductFilters, 'categorySlug'> = {}
): Promise<ProductsResult> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getProductsByCategoryFromDB(categorySlug, options)
  }
  
  // Client-side: use API
  return getProducts({ ...options, categorySlug })
}

export async function getProductById(id: string): Promise<Product | null> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getProductByIdFromDB(id)
  }

  // Client-side: use API
  try {
    console.log('🔍 Fetching product by ID:', id)

    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null // Product not found
      }
      throw new Error('Failed to fetch product')
    }

    const result = await response.json()
    console.log('✅ Product fetched:', result.name)
    
    return result

  } catch (error) {
    console.error('❌ Error fetching product:', error)
    return null
  }
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return getFeaturedProductsFromDB(limit)
  }
  
  // Client-side: use API
  const result = await getProducts({
    isAvailable: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit
  })
  
  return result.products
}

export async function searchProducts(
  searchTerm: string,
  options: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResult> {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use direct database query
    return searchProductsFromDB(searchTerm, options)
  }
  
  // Client-side: use API
  return getProducts({ ...options, search: searchTerm })
}