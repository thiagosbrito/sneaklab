import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateOrderData, OrderItem } from '@/utils/orders'

// Environment variables for n8n integration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_API_KEY = process.env.N8N_API_KEY

interface N8nWebhookPayload {
  event_type: 'order_created' | 'order_status_changed'
  order_id: string
  status: string
  previous_status?: string
  timestamp: string
  order_data: any
  customer_data?: {
    name: string
    phone: string
    address: any
    email?: string
  }
}

/**
 * Send webhook to n8n for WhatsApp notifications
 */
async function sendN8nWebhook(payload: N8nWebhookPayload): Promise<void> {
  if (!N8N_WEBHOOK_URL) {
    console.log('N8N_WEBHOOK_URL not configured, skipping webhook')
    return
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sneaklab-orders',
        ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` })
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N webhook failed:', response.status, errorText)
      throw new Error(`N8N webhook failed: ${response.status}`)
    }

    console.log('N8N webhook sent successfully:', payload.event_type, payload.order_id)
  } catch (error) {
    console.error('Error sending N8N webhook:', error)
    // Don't throw error - webhook failures shouldn't break order creation
  }
}

/**
 * POST /api/orders - Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderData, profileData }: {
      orderData: CreateOrderData
      profileData?: {
        full_name?: string
        phone?: string
        address?: any
      }
    } = body

    // Validate required data
    if (!orderData?.items?.length) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      )
    }

    // Update user profile if provided
    if (profileData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }

    // Calculate order totals
    const items: OrderItem[] = orderData.items.map(item => ({
      ...item,
      customization_fee: item.customization_fee || 0,
      item_total: item.base_price + (item.customization_fee || 0)
    }))

    const totalAmount = items.reduce((sum, item) => sum + (item.item_total * item.quantity), 0)

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        notes: orderData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      base_price: item.base_price,
      customization_details: item.customization_details,
      customization_fee: item.customization_fee,
      item_total: item.item_total
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Get user profile for webhook
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Send n8n webhook for order creation
    await sendN8nWebhook({
      event_type: 'order_created',
      order_id: order.id,
      status: 'pending',
      timestamp: new Date().toISOString(),
      order_data: {
        ...order,
        items: orderItems
      },
      customer_data: profile ? {
        name: profile.full_name || user.email || 'Customer',
        phone: profile.phone,
        address: profile.address,
        email: user.email
      } : undefined
    })

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders?id={orderId} - Update order status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user to update orders
    // In production, you should check if user has admin role

    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, notes }: { status: string, notes?: string } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Get current order to track status change
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        ...(notes && { 
          [`${status}_notes`]: notes // e.g., feasibility_notes, production_notes
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Send n8n webhook for status changes to 'confirmed' or 'ready'
    if (['confirmed', 'ready'].includes(status) && currentOrder.status !== status) {
      // Get full order details for webhook
      const { data: orderWithDetails } = await supabase
        .from('orders_with_user_details')
        .select(`
          *,
          order_items (
            quantity,
            base_price,
            customization_fee,
            item_total,
            customization_details,
            products (name, description)
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderWithDetails) {
        await sendN8nWebhook({
          event_type: 'order_status_changed',
          order_id: orderId,
          status,
          previous_status: currentOrder.status,
          timestamp: new Date().toISOString(),
          order_data: orderWithDetails,
          customer_data: {
            name: orderWithDetails.customer_name,
            phone: orderWithDetails.customer_phone,
            address: orderWithDetails.customer_address,
            email: orderWithDetails.customer_email
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}