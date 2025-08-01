import { NextResponse } from 'next/server'
import { getWishlistCountFromDB } from '@/db/queries/wishlist'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const count = await getWishlistCountFromDB(userId)

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error getting wishlist count:', error)
    return NextResponse.json(
      { error: 'Failed to get wishlist count' },
      { status: 500 }
    )
  }
}