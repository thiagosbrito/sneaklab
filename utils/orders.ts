import { CustomizationDetails } from '@/db/schema'

/**
 * Order types and constants for SneakLab app
 */

export interface CreateOrderData {
  items: Array<{
    product_id?: string
    quantity: number
    base_price: number
    customization_details: CustomizationDetails
    customization_fee?: number
  }>
  notes?: string
}

export interface OrderItem {
  product_id?: string
  quantity: number
  base_price: number
  customization_details: CustomizationDetails
  customization_fee: number
  item_total: number
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
