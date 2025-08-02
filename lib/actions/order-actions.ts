"use server";

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { orders, orderItems, profiles, type Profile } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateOrderData, OrderItem } from '@/utils/orders';
import { revalidateTag } from 'next/cache';
import { sendOrderNotification, sendAdminNotification } from '@/lib/notifications';
import { getOrCreateUserProfile } from './auth-actions';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Environment variables for n8n integration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_API_KEY = process.env.N8N_API_KEY

interface N8nWebhookPayload {
  event_type: 'order_created' | 'order_status_changed'
  order_id: string
  status: string
  previous_status?: string
  timestamp: string
  order_data: Record<string, unknown>
  customer_data?: {
    name: string
    phone: string
    address: Json
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
      return
    }

    console.log('N8N webhook sent successfully:', payload.event_type, payload.order_id)
  } catch (error) {
    console.error('Error sending N8N webhook:', error)
    // Don't throw error - webhook failures shouldn't break order creation
  }
}

/**
 * Create a new order with Drizzle ORM
 */
export async function createOrderAction(orderData: CreateOrderData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Get or create user profile using the centralized function
    let profile: Profile | null = await getOrCreateUserProfile(user.id, user.email || undefined)
    
    if (!profile) {
      throw new Error('Failed to create or retrieve user profile')
    }

    // Calculate order totals
    const items: OrderItem[] = orderData.items.map(item => ({
      ...item,
      customization_fee: item.customization_fee || 0,
      item_total: item.base_price + (item.customization_fee || 0)
    }))

    const totalAmount = items.reduce((sum, item) => sum + (item.item_total * item.quantity), 0)

    // Create the order with Drizzle
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: user.id,
        totalAmount: totalAmount.toString(),
        notes: orderData.notes || null,
        status: 'pending'
      })
      .returning()

    // Create order items with Drizzle
    const orderItemsData = items.map(item => ({
      orderId: newOrder.id,
      productId: item.product_id || null,
      quantity: item.quantity,
      basePrice: item.base_price.toString(),
      customizationDetails: item.customization_details,
      customizationFee: (item.customization_fee || 0).toString(),
      itemTotal: item.item_total.toString()
    }))

    await db.insert(orderItems).values(orderItemsData)

    // Send n8n webhook for order creation
    await sendN8nWebhook({
      event_type: 'order_created',
      order_id: newOrder.id,
      status: 'pending',
      timestamp: new Date().toISOString(),
      order_data: {
        ...newOrder,
        items: orderItemsData
      },
      customer_data: {
        name: profile.fullName || user.email || 'Customer',
        phone: profile.phone || '',
        address: profile.address as Json,
        email: user.email
      }
    })

    // Send notifications based on user role
    const isAdmin = profile?.role === 'ADMIN';
    
    if (isAdmin) {
      // Admin users only get the admin notification, not the customer notification
      await sendAdminNotification(
        'New Order Created',
        `A new order #${newOrder.id} has been created by ${profile?.fullName || user.email}.`,
        'order',
        'medium',
        newOrder.id,
        'order',
        { orderValue: totalAmount, isAdminNotification: true }
      );
    } else {
      // Regular customers get the customer notification, and admins get the admin notification
      await sendOrderNotification(newOrder.id, user.id, 'pending');
      await sendAdminNotification(
        'New Order Created',
        `A new order #${newOrder.id} has been created by ${profile?.fullName || user.email}.`,
        'order',
        'medium',
        newOrder.id,
        'order',
        { orderValue: totalAmount }
      );
    }

    // Revalidate cache
    revalidateTag('user-orders')
    revalidateTag(`order-${newOrder.id}`)

    return {
      success: true,
      data: {
        ...newOrder,
        order_items: orderItemsData
      }
    }

  } catch (error) {
    console.error('Order creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }
  }
}

/**
 * Update order status with Drizzle ORM
 */
export async function updateOrderStatusAction(orderId: string, status: string, notes?: string) {
  try {
    const supabase = await createClient()
    
    // Get current user and verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Get current order
    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!currentOrder) {
      throw new Error('Order not found')
    }

    // Update order status
    const updateData: any = {
      status,
      ...(notes && { 
        [status === 'confirmed' ? 'feasibility_notes' : 'production_notes']: notes 
      })
    }

    // Add timestamp fields based on status
    const now = new Date().toISOString()
    switch (status) {
      case 'confirmed':
        updateData.confirmed_at = now
        break
      case 'ready':
        updateData.ready_at = now
        break
      case 'delivered':
        updateData.delivered_at = now
        break
      case 'completed':
        updateData.completed_at = now
        break
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning()

    // Get order with details for webhook
    const orderWithDetails = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: {
          with: {
            product: true
          }
        }
      }
    })

    // Get user profile separately
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, updatedOrder.userId)
    })

    // Send n8n webhook for status change
    if (orderWithDetails) {
      await sendN8nWebhook({
        event_type: 'order_status_changed',
        order_id: orderId,
        status,
        previous_status: currentOrder.status,
        timestamp: new Date().toISOString(),
        order_data: orderWithDetails,
        customer_data: {
          name: userProfile?.fullName || 'Customer',
          phone: userProfile?.phone || '',
          address: userProfile?.address as Json,
          email: userProfile?.id // User ID as fallback
        }
      })
    }

    // Send status change notifications based on customer role
    const isCustomerAdmin = userProfile?.role === 'ADMIN';
    
    if (!isCustomerAdmin) {
      // Only send customer notification if they're not an admin
      await sendOrderNotification(orderId, updatedOrder.userId, status, currentOrder.status);
    }
    
    // Always send admin notification for status changes
    await sendAdminNotification(
      'Order Status Updated',
      `Order #${orderId} status changed from ${currentOrder.status} to ${status}.`,
      'order',
      'medium',
      orderId,
      'order',
      { previousStatus: currentOrder.status, newStatus: status, customerIsAdmin: isCustomerAdmin }
    );

    // Revalidate cache
    revalidateTag('user-orders')
    revalidateTag('admin-orders')
    revalidateTag(`order-${orderId}`)

    return {
      success: true,
      data: updatedOrder
    }

  } catch (error) {
    console.error('Order status update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status'
    }
  }
}

/**
 * Get user orders with Drizzle ORM
 */
export async function getUserOrdersAction() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Get user orders with items
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: {
          with: {
            product: true
          }
        }
      }
    })

    return {
      success: true,
      data: userOrders
    }

  } catch (error) {
    console.error('Get user orders error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders'
    }
  }
}