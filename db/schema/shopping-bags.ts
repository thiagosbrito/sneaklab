import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const shoppingBags = pgTable('shopping_bags', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  items: jsonb('items').notNull().default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type ShoppingBag = typeof shoppingBags.$inferSelect
export type NewShoppingBag = typeof shoppingBags.$inferInsert