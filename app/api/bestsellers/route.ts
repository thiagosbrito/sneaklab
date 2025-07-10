import { NextResponse } from 'next/server'
import { getBestSellers } from '@/utils/bestsellers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    // Validate limit parameter
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Fetching top ${limit} bestsellers...`)
    
    const bestsellers = await getBestSellers(limit)
    
    console.log(`✅ API: Returning ${bestsellers.length} bestsellers`)
    
    return NextResponse.json({
      success: true,
      data: bestsellers,
      count: bestsellers.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('❌ API: Error fetching bestsellers:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch bestsellers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}