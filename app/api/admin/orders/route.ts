import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders, orderItems, products, profiles } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get orders with user details for admin panel
    const result = await db
      .select({
        id: orders.id,
        user_id: orders.userId,
        total_amount: orders.totalAmount,
        notes: orders.notes,
        status: orders.status,
        created_at: orders.createdAt,
        confirmed_at: orders.confirmedAt,
        ready_at: orders.readyAt,
        delivered_at: orders.deliveredAt,
        completed_at: orders.completedAt,
        feasibility_notes: orders.feasibilityNotes,
        production_notes: orders.productionNotes,
        customer_name: profiles.fullName,
        customer_email: profiles.id, // We'll need auth.users for actual email
        customer_phone: profiles.phone,
        customer_address: profiles.address,
      })
      .from(orders)
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .orderBy(desc(orders.createdAt))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}