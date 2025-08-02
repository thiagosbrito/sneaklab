import { pgTable, text, timestamp, uuid, boolean, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { profiles } from './profiles'
import { orders } from './orders'

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['order', 'message', 'system'] }).notNull(),
  status: text('status', { enum: ['unread', 'read'] }).notNull().default('unread'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  relatedId: uuid('related_id'), // Reference to order_id, message_id, etc.
  relatedType: text('related_type'), // 'order', 'message', etc.
  metadata: json('metadata'), // Additional data like order status changes, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
})

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [notifications.relatedId],
    references: [orders.id],
  }),
}))

export type Notification = typeof notifications.$inferSelect
export type InsertNotification = typeof notifications.$inferInsert