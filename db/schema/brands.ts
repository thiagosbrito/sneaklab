import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { products } from './products'

export const brands = pgTable('brands', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}))

export type Brand = typeof brands.$inferSelect
export type NewBrand = typeof brands.$inferInsert