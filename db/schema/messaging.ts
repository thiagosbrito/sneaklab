import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { profiles } from './profiles'
import { orders } from './orders'

// Conversation types
export type ConversationType = 'support' | 'order_inquiry' | 'complaint' | 'general' | 'order_update'
export type ConversationStatus = 'open' | 'waiting_customer' | 'waiting_admin' | 'resolved' | 'closed'
export type MessageStatus = 'sent' | 'delivered' | 'read'
export type SenderType = 'customer' | 'admin' | 'system'

// Conversations table - groups related messages
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Participants
  customerId: uuid('customer_id').notNull(), // Always present
  assignedAdminId: uuid('assigned_admin_id'), // Optional - for assignment
  
  // Conversation metadata
  type: text('type', { enum: ['support', 'order_inquiry', 'complaint', 'general', 'order_update'] }).notNull().default('general'),
  status: text('status', { enum: ['open', 'waiting_customer', 'waiting_admin', 'resolved', 'closed'] }).notNull().default('open'),
  subject: text('subject').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  
  // Related entities
  relatedOrderId: text('related_order_id'), // Optional - link to specific order (matches orders.id text type)
  
  // Metadata
  isPrivate: boolean('is_private').notNull().default(false), // Admin-only conversations
  metadata: jsonb('metadata'), // Additional context, tags, etc.
  
  // Tracking
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  customerLastReadAt: timestamp('customer_last_read_at', { withTimezone: true }),
  adminLastReadAt: timestamp('admin_last_read_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
})

// Individual messages within conversations
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relationships
  conversationId: uuid('conversation_id').notNull(),
  senderId: uuid('sender_id').notNull(), // Profile ID of sender
  
  // Message content
  content: text('content').notNull(),
  senderType: text('sender_type', { enum: ['customer', 'admin', 'system'] }).notNull(),
  
  // Message metadata
  status: text('status', { enum: ['sent', 'delivered', 'read'] }).notNull().default('sent'),
  isInternal: boolean('is_internal').notNull().default(false), // Admin-only internal notes
  
  // Optional data
  metadata: jsonb('metadata'), // Additional context, formatting, etc.
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  editedAt: timestamp('edited_at', { withTimezone: true }),
})

// Optional file attachments for messages
export const messageAttachments = pgTable('message_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relationships
  messageId: uuid('message_id').notNull(),
  
  // File data
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'), // In bytes as string
  mimeType: text('mime_type'),
  
  // Metadata
  uploadedByUserId: uuid('uploaded_by_user_id').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  customer: one(profiles, {
    fields: [conversations.customerId],
    references: [profiles.id],
    relationName: 'customerConversations'
  }),
  assignedAdmin: one(profiles, {
    fields: [conversations.assignedAdminId],
    references: [profiles.id],
    relationName: 'adminConversations'
  }),
  relatedOrder: one(orders, {
    fields: [conversations.relatedOrderId],
    references: [orders.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.id],
  }),
  attachments: many(messageAttachments),
}))

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
  uploadedBy: one(profiles, {
    fields: [messageAttachments.uploadedByUserId],
    references: [profiles.id],
  }),
}))

// TypeScript types
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type MessageAttachment = typeof messageAttachments.$inferSelect
export type NewMessageAttachment = typeof messageAttachments.$inferInsert

// Extended types with relations
export type ConversationWithDetails = Conversation & {
  customer: { id: string; fullName: string | null; phone: string | null }
  assignedAdmin?: { id: string; fullName: string | null } | null
  relatedOrder?: { id: string; status: string; totalAmount: string } | null
  messages: (Message & {
    sender: { id: string; fullName: string | null; role: string | null }
    attachments: MessageAttachment[]
  })[]
  _count: {
    unreadMessages: number
  }
}

export type MessageWithDetails = Message & {
  sender: { id: string; fullName: string | null; role: string | null }
  attachments: MessageAttachment[]
}