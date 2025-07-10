import { NextResponse } from 'next/server'
import { getProductById } from '@/utils/products'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid product ID',
          message: 'Product ID must be a valid number'
        },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Fetching product with ID: ${id}`)

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found',
          message: `Product with ID ${id} not found or not available`
        },
        { status: 404 }
      )
    }

    console.log(`✅ API: Returning product: ${product.name}`)

    return NextResponse.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      }
    })

  } catch (error) {
    console.error('❌ API: Error fetching product:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}