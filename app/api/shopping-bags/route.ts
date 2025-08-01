import { NextResponse } from 'next/server'
import { syncBagToDatabase, loadBagFromDatabase, clearBagFromDatabase } from '@/db/queries/shopping-bags'

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

    const bagItems = await loadBagFromDatabase(userId)

    return NextResponse.json({ items: bagItems })
  } catch (error) {
    console.error('Error loading bag:', error)
    return NextResponse.json(
      { error: 'Failed to load bag' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, items } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      )
    }

    const result = await syncBagToDatabase(userId, items)

    return NextResponse.json({ success: true, bag: result })
  } catch (error) {
    console.error('Error syncing bag:', error)
    return NextResponse.json(
      { error: 'Failed to sync bag' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await clearBagFromDatabase(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing bag:', error)
    return NextResponse.json(
      { error: 'Failed to clear bag' },
      { status: 500 }
    )
  }
}