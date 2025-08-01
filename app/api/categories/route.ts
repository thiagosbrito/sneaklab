import { NextResponse } from 'next/server'
import { db } from '@/db'
import { categories } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}