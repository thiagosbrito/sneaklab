import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { products } from './products'

export const wishlist = pgTable('wishlist', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  productId: text('product_id').notNull().references(() => products.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id],
  }),
}))

export type WishlistItem = typeof wishlist.$inferSelect
export type NewWishlistItem = typeof wishlist.$inferInsert