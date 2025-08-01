import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders, orderItems, products, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Get order details
    const [orderDetails] = await db
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
        customer_email: profiles.id,
        customer_phone: profiles.phone,
        customer_address: profiles.address,
      })
      .from(orders)
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .where(eq(orders.id, orderId))

    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items
    const items = await db
      .select({
        id: orderItems.id,
        order_id: orderItems.orderId,
        product_id: orderItems.productId,
        quantity: orderItems.quantity,
        base_price: orderItems.basePrice,
        customization_details: orderItems.customizationDetails,
        customization_fee: orderItems.customizationFee,
        item_total: orderItems.itemTotal,
        created_at: orderItems.createdAt,
        products: {
          name: products.name,
          description: products.description,
          imageURL: products.imageURL,
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId))

    return NextResponse.json({
      ...orderDetails,
      order_items: items
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}