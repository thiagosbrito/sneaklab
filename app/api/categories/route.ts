import { NextResponse } from 'next/server'
import { getCategoriesFromDB, getMenuCategoriesFromDB } from '@/db/queries/categories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const menuOnly = searchParams.get('menuOnly') === 'true'

    const categories = menuOnly 
      ? await getMenuCategoriesFromDB()
      : await getCategoriesFromDB()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}