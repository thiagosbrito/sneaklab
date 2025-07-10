import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/utils/supabase/database.types'
import { Product, ProductWithDetails, mapDatabaseProductToProduct } from '@/utils/models/products'

export interface ProductsResult {
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export interface ProductFilters {
  categorySlug?: string
  brandId?: number
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
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

    // Build the query with joins
    let query = supabase
      .from('products')
      .select(`
        *,
        brands (id, name, logo),
        categories!inner (id, name, slug, description, imageURL, showInMenu)
      `, { count: 'exact' })

    // Apply filters
    if (isAvailable !== undefined) {
      query = query.eq('isAvailable', isAvailable)
    }

    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug)
    }

    if (brandId) {
      query = query.eq('brandID', brandId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice)
    }

    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Products query error:', error)
      throw error
    }

    console.log('✅ Products fetched:', data?.length || 0, 'Total count:', count)

    // Map database products to frontend Product type
    const products = (data as ProductWithDetails[])?.map(mapDatabaseProductToProduct) || []

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      products,
      totalCount,
      currentPage: page,
      totalPages
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
  return getProducts({ ...options, categorySlug })
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    console.log('🔍 Fetching product by ID:', id)

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (id, name, logo),
        categories!inner (id, name, slug, description, imageURL, showInMenu)
      `)
      .eq('id', parseInt(id))
      .eq('isAvailable', true)
      .single()

    if (error) {
      console.error('❌ Product query error:', error)
      if (error.code === 'PGRST116') {
        return null // Product not found
      }
      throw error
    }

    console.log('✅ Product fetched:', data.name)

    return mapDatabaseProductToProduct(data as ProductWithDetails)

  } catch (error) {
    console.error('❌ Error fetching product:', error)
    return null
  }
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
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
  return getProducts({ ...options, search: searchTerm })
}