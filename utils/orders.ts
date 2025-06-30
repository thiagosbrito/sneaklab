import { createClient } from '@supabase/supabase-js'

// Order creation utilities for SneakLab app
export interface CreateOrderData {
  items: Array<{
    product_id?: string
    quantity: number
    base_price: number
    customization_details: any
    customization_fee?: number
  }>
  notes?: string
}

export interface OrderItem {
  product_id?: string
  quantity: number
  base_price: number
  customization_details: any
  customization_fee: number
  item_total: number
}

/**
 * Create an order for the currently authenticated user
 */
export async function createOrder(
  supabase: ReturnType<typeof createClient>,
  orderData: CreateOrderData
) {
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be authenticated to create an order')
  }

  // Calculate total amount
  const items: OrderItem[] = orderData.items.map(item => ({
    ...item,
    customization_fee: item.customization_fee || 0,
    item_total: item.base_price + (item.customization_fee || 0)
  }))

  const totalAmount = items.reduce((sum, item) => sum + (item.item_total * item.quantity), 0)

  try {
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

    if (orderError) throw orderError

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

    if (itemsError) throw itemsError

    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Get orders for the current user
 */
export async function getUserOrders(
  supabase: ReturnType<typeof createClient>,
  limit?: number
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, description, image_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Get a specific order for the current user
 */
export async function getUserOrder(
  supabase: ReturnType<typeof createClient>,
  orderId: string
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, description, image_url)
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  supabase: ReturnType<typeof createClient>,
  profileData: {
    full_name?: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zip: string
      country?: string
    }
  }
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...profileData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user profile
 */
export async function getUserProfile(
  supabase: ReturnType<typeof createClient>
) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

// Order status constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered',
  COMPLETED: 'completed'
} as const

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]
