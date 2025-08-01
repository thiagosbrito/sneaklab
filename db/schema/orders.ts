import { pgTable, text, decimal, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { products } from './products'

// Customization details interface for the customization_details JSONB field
export interface CustomizationDetails extends Record<string, string | number | boolean | null | undefined | CustomizationDetails | CustomizationDetails[]> {
  size?: string;
  color?: string;
  material?: string;
  personalizations?: Array<{
    type: string;
    value: string;
    position?: string;
  }>;
  notes?: string;
}

export const orders = pgTable('orders', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  feasibilityNotes: text('feasibility_notes'),
  productionNotes: text('production_notes'),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id),
  quantity: integer('quantity').default(1),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  customizationDetails: jsonb('customization_details').$type<CustomizationDetails>(),
  customizationFee: decimal('customization_fee', { precision: 10, scale: 2 }).default('0'),
  itemTotal: decimal('item_total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert