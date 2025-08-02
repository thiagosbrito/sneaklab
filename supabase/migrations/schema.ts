import { pgTable, foreignKey, text, integer, numeric, jsonb, timestamp, boolean, uuid, unique, pgPolicy, index, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const orderItems = pgTable("order_items", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	orderId: text("order_id"),
	productId: text("product_id"),
	quantity: integer().default(1),
	basePrice: numeric("base_price", { precision: 10, scale:  2 }).notNull(),
	customizationDetails: jsonb("customization_details"),
	customizationFee: numeric("customization_fee", { precision: 10, scale:  2 }).default('0'),
	itemTotal: numeric("item_total", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const aboutUsSection = pgTable("about_us_section", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(false).notNull(),
});

export const brands = pgTable("brands", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	logo: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const wishlist = pgTable("wishlist", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: text("product_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "wishlist_product_id_products_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	imageUrl: text().array(),
	showInMenu: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const heroSection = pgTable("hero_section", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	heroTitle: text("hero_title").notNull(),
	heroSubtitle: text("hero_subtitle").notNull(),
	backgroundImageUrl: text("background_image_url").notNull(),
	ctaText: text("cta_text").notNull(),
	ctaRedirectTo: text("cta_redirect_to").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(false).notNull(),
});

export const orders = pgTable("orders", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	notes: text(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: 'string' }),
	readyAt: timestamp("ready_at", { withTimezone: true, mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	feasibilityNotes: text("feasibility_notes"),
	productionNotes: text("production_notes"),
}, (table) => [
	pgPolicy("Users can view own orders", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() = user_id)` }),
	pgPolicy("Users can insert own orders", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Admin can manage all orders", { as: "permissive", for: "all", to: ["public"] }),
]);

export const products = pgTable("products", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	imageUrl: text().array(),
	brandId: text(),
	categoryId: text().notNull(),
	isAvailable: boolean().default(true).notNull(),
	price: numeric({ precision: 10, scale:  2 }),
	promoPrice: numeric({ precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "products_brandID_brands_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_categoryID_categories_id_fk"
		}),
]);

export const shoppingBags = pgTable("shopping_bags", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	items: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const messageAttachments = pgTable("message_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: text("file_size"),
	mimeType: text("mime_type"),
	uploadedByUserId: uuid("uploaded_by_user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_message_attachments_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_message_attachments_message_id").using("btree", table.messageId.asc().nullsLast().op("uuid_ops")),
	index("idx_message_attachments_uploaded_by").using("btree", table.uploadedByUserId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can view attachments in their conversations", { as: "permissive", for: "select", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM (messages
     JOIN conversations ON ((conversations.id = messages.conversation_id)))
  WHERE ((messages.id = message_attachments.message_id) AND ((auth.uid() = conversations.customer_id) OR (auth.uid() = conversations.assigned_admin_id) OR (EXISTS ( SELECT 1
           FROM profiles
          WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text))))) AND ((messages.is_internal = false) OR (EXISTS ( SELECT 1
           FROM profiles
          WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text))))))))` }),
	pgPolicy("Users can insert attachments in their conversations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can delete own attachments", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Admin can manage all attachments", { as: "permissive", for: "all", to: ["public"] }),
]);

export const showcaseSection = pgTable("showcase_section", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	imageUrl: text("image_url").notNull(),
	subtitleA: text("subtitle_a").notNull(),
	subtitleB: text("subtitle_b").notNull(),
	subtitleDescriptionA: text("subtitle_description_a").notNull(),
	subtitleDescriptionB: text("subtitle_description_b").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(false).notNull(),
});

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	fullName: text("full_name"),
	phone: text(),
	address: jsonb(),
	role: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	pgPolicy("Users can view own profile", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() = id)` }),
	pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Admin can view all profiles", { as: "permissive", for: "all", to: ["public"] }),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id").notNull(),
	assignedAdminId: uuid("assigned_admin_id"),
	type: text().default('general').notNull(),
	status: text().default('open').notNull(),
	subject: text().notNull(),
	priority: text().default('medium').notNull(),
	relatedOrderId: uuid("related_order_id"),
	isPrivate: boolean("is_private").default(false).notNull(),
	metadata: jsonb(),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
	customerLastReadAt: timestamp("customer_last_read_at", { withTimezone: true, mode: 'string' }),
	adminLastReadAt: timestamp("admin_last_read_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	closedAt: timestamp("closed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_conversations_assigned_admin_id").using("btree", table.assignedAdminId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_conversations_customer_id").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_last_message_at").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_conversations_related_order_id").using("btree", table.relatedOrderId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_conversations_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	pgPolicy("Users can view own conversations", { as: "permissive", for: "select", to: ["public"], using: sql`((auth.uid() = customer_id) OR (auth.uid() = assigned_admin_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text)))))` }),
	pgPolicy("Users can create conversations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update own conversations", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Admin can manage all conversations", { as: "permissive", for: "all", to: ["public"] }),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	content: text().notNull(),
	senderType: text("sender_type").notNull(),
	status: text().default('sent').notNull(),
	isInternal: boolean("is_internal").default(false).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_messages_is_internal").using("btree", table.isInternal.asc().nullsLast().op("bool_ops")),
	index("idx_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_sender_type").using("btree", table.senderType.asc().nullsLast().op("text_ops")),
	index("idx_messages_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	pgPolicy("Users can view messages in their conversations", { as: "permissive", for: "select", to: ["public"], using: sql`((EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((auth.uid() = conversations.customer_id) OR (auth.uid() = conversations.assigned_admin_id) OR (EXISTS ( SELECT 1
           FROM profiles
          WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text)))))))) AND ((is_internal = false) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text))))))` }),
	pgPolicy("Users can insert messages in their conversations", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update own messages", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Admin can manage all messages", { as: "permissive", for: "all", to: ["public"] }),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: text().notNull(),
	status: text().default('unread').notNull(),
	priority: text().default('medium').notNull(),
	relatedId: uuid("related_id"),
	relatedType: text("related_type"),
	metadata: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_notifications_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_notifications_related").using("btree", table.relatedId.asc().nullsLast().op("uuid_ops"), table.relatedType.asc().nullsLast().op("uuid_ops")),
	index("idx_notifications_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_notifications_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_notifications_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can view their own notifications", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() = user_id)` }),
	pgPolicy("Users can update their own notifications", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Authenticated users can insert notifications", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Admin can manage all notifications", { as: "permissive", for: "all", to: ["public"] }),
]);

function gen_random_uuid(): string | import("drizzle-orm").SQL<unknown> {
	throw new Error("Function not implemented.");
}
