import { NextResponse } from 'next/server'
import { getProducts, ProductFilters } from '@/utils/products'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const filters: ProductFilters = {
      categorySlug: searchParams.get('category') || undefined,
      brandId: searchParams.get('brand') ? parseInt(searchParams.get('brand')!) : undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      isAvailable: searchParams.get('available') !== 'false', // Default to true
      sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'created_at') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    }

    // Validate pagination parameters
    if (filters.page! < 1) filters.page = 1
    if (filters.limit! < 1 || filters.limit! > 100) filters.limit = 20

    console.log(`🔍 API: Fetching products with filters:`, filters)

    const result = await getProducts(filters)

    console.log(`✅ API: Returning ${result.products.length} products (page ${result.currentPage}/${result.totalPages})`)

    return NextResponse.json({
      success: true,
      data: result.products,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: filters.limit
      },
      filters: filters,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300', // Cache for 3 minutes
      }
    })

  } catch (error) {
    console.error('❌ API: Error fetching products:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}