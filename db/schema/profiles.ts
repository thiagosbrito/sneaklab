import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core'

// Address interface for the address JSONB field
export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zipCode?: string;
  country?: string;
}

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  phone: text('phone'),
  address: jsonb('address').$type<CustomerAddress>(),
  role: text('role', { enum: ['ADMIN', 'CUSTOMER'] }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert