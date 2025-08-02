CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"assigned_admin_id" uuid,
	"type" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"subject" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"related_order_id" uuid,
	"is_private" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"last_message_at" timestamp with time zone,
	"customer_last_read_at" timestamp with time zone,
	"admin_last_read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" text,
	"mime_type" text,
	"uploaded_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"sender_type" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	"edited_at" timestamp with time zone
);
