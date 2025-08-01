import { pgTable, text, boolean, decimal, timestamp } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { brands } from './brands'
import { categories } from './categories'
import { orderItems } from './orders'
import { wishlist } from './wishlist'

export const products = pgTable('products', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  imageURL: text('imageURL').array(),
  brandID: text('brandID').references(() => brands.id),
  categoryID: text('categoryID').notNull().references(() => categories.id),
  isAvailable: boolean('isAvailable').notNull().default(true),
  price: decimal('price', { precision: 10, scale: 2 }),
  promoPrice: decimal('promoPrice', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandID],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryID],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  wishlistItems: many(wishlist),
}))

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert