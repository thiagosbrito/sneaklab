import { NextResponse } from 'next/server'
import { db } from '@/db'
import { brands } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(brands)
      .orderBy(desc(brands.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}