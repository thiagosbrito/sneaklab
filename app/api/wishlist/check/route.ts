import { NextResponse } from 'next/server'
import { isInWishlistFromDB } from '@/db/queries/wishlist'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    const isInWishlist = await isInWishlistFromDB(userId, productId)

    return NextResponse.json({ isInWishlist })
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to check wishlist' },
      { status: 500 }
    )
  }
}