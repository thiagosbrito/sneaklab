-- ===============================================
-- MESSAGING TABLES RLS SETUP
-- Run this after creating messaging tables with drizzle-kit
-- ===============================================

-- CONVERSATIONS TABLE RLS
-- ===============================================

-- Enable Row Level Security for conversations
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view own conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can create conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can update own conversations" ON "conversations";
DROP POLICY IF EXISTS "Admin can manage all conversations" ON "conversations";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_conversations_customer_id" ON "conversations"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_conversations_assigned_admin_id" ON "conversations"("assigned_admin_id");
CREATE INDEX IF NOT EXISTS "idx_conversations_status" ON "conversations"("status");
CREATE INDEX IF NOT EXISTS "idx_conversations_type" ON "conversations"("type");
CREATE INDEX IF NOT EXISTS "idx_conversations_related_order_id" ON "conversations"("related_order_id");
CREATE INDEX IF NOT EXISTS "idx_conversations_created_at" ON "conversations"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_conversations_last_message_at" ON "conversations"("last_message_at" DESC);

-- RLS Policies for conversations

-- 1. Users can view conversations they're part of
CREATE POLICY "Users can view own conversations" ON "conversations"
  FOR SELECT USING (
    auth.uid() = "customer_id" OR 
    auth.uid() = "assigned_admin_id" OR
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- 2. Customers can create conversations (only as customer)
CREATE POLICY "Users can create conversations" ON "conversations"
  FOR INSERT WITH CHECK (
    auth.uid() = "customer_id" AND
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid()
    )
  );

-- 3. Users can update conversations they're part of (limited updates)
CREATE POLICY "Users can update own conversations" ON "conversations"
  FOR UPDATE USING (
    auth.uid() = "customer_id" OR 
    auth.uid() = "assigned_admin_id" OR
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- 4. Admin policy: Admins can manage all conversations
CREATE POLICY "Admin can manage all conversations" ON "conversations"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- MESSAGES TABLE RLS
-- ===============================================

-- Enable Row Level Security for messages
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "messages";
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON "messages";
DROP POLICY IF EXISTS "Users can update own messages" ON "messages";
DROP POLICY IF EXISTS "Admin can manage all messages" ON "messages";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_messages_sender_type" ON "messages"("sender_type");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_messages_status" ON "messages"("status");
CREATE INDEX IF NOT EXISTS "idx_messages_is_internal" ON "messages"("is_internal");

-- RLS Policies for messages

-- 1. Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations" ON "messages"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "conversations"
      WHERE "conversations"."id" = "messages"."conversation_id"
      AND (
        auth.uid() = "conversations"."customer_id" OR 
        auth.uid() = "conversations"."assigned_admin_id" OR
        EXISTS (
          SELECT 1 FROM "profiles"
          WHERE "profiles"."id" = auth.uid() 
          AND "profiles"."role" = 'ADMIN'
        )
      )
    )
    -- Hide internal messages from customers
    AND (
      "messages"."is_internal" = false OR
      EXISTS (
        SELECT 1 FROM "profiles"
        WHERE "profiles"."id" = auth.uid() 
        AND "profiles"."role" = 'ADMIN'
      )
    )
  );

-- 2. Users can insert messages in conversations they're part of
CREATE POLICY "Users can insert messages in their conversations" ON "messages"
  FOR INSERT WITH CHECK (
    auth.uid() = "sender_id" AND
    EXISTS (
      SELECT 1 FROM "conversations"
      WHERE "conversations"."id" = "messages"."conversation_id"
      AND (
        auth.uid() = "conversations"."customer_id" OR 
        auth.uid() = "conversations"."assigned_admin_id" OR
        EXISTS (
          SELECT 1 FROM "profiles"
          WHERE "profiles"."id" = auth.uid() 
          AND "profiles"."role" = 'ADMIN'
        )
      )
    )
    -- Only admins can create internal messages
    AND (
      "messages"."is_internal" = false OR
      EXISTS (
        SELECT 1 FROM "profiles"
        WHERE "profiles"."id" = auth.uid() 
        AND "profiles"."role" = 'ADMIN'
      )
    )
  );

-- 3. Users can update their own messages (limited updates like read status)
CREATE POLICY "Users can update own messages" ON "messages"
  FOR UPDATE USING (
    auth.uid() = "sender_id" OR
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- 4. Admin policy: Admins can manage all messages
CREATE POLICY "Admin can manage all messages" ON "messages"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- MESSAGE_ATTACHMENTS TABLE RLS
-- ===============================================

-- Enable Row Level Security for message_attachments
ALTER TABLE "message_attachments" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON "message_attachments";
DROP POLICY IF EXISTS "Users can insert attachments in their conversations" ON "message_attachments";
DROP POLICY IF EXISTS "Users can delete own attachments" ON "message_attachments";
DROP POLICY IF EXISTS "Admin can manage all attachments" ON "message_attachments";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_message_attachments_message_id" ON "message_attachments"("message_id");
CREATE INDEX IF NOT EXISTS "idx_message_attachments_uploaded_by" ON "message_attachments"("uploaded_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_message_attachments_created_at" ON "message_attachments"("created_at" DESC);

-- RLS Policies for message_attachments

-- 1. Users can view attachments in conversations they're part of
CREATE POLICY "Users can view attachments in their conversations" ON "message_attachments"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "messages"
      JOIN "conversations" ON "conversations"."id" = "messages"."conversation_id"
      WHERE "messages"."id" = "message_attachments"."message_id"
      AND (
        auth.uid() = "conversations"."customer_id" OR 
        auth.uid() = "conversations"."assigned_admin_id" OR
        EXISTS (
          SELECT 1 FROM "profiles"
          WHERE "profiles"."id" = auth.uid() 
          AND "profiles"."role" = 'ADMIN'
        )
      )
      -- Hide attachments from internal messages for customers
      AND (
        "messages"."is_internal" = false OR
        EXISTS (
          SELECT 1 FROM "profiles"
          WHERE "profiles"."id" = auth.uid() 
          AND "profiles"."role" = 'ADMIN'
        )
      )
    )
  );

-- 2. Users can insert attachments in conversations they're part of
CREATE POLICY "Users can insert attachments in their conversations" ON "message_attachments"
  FOR INSERT WITH CHECK (
    auth.uid() = "uploaded_by_user_id" AND
    EXISTS (
      SELECT 1 FROM "messages"
      JOIN "conversations" ON "conversations"."id" = "messages"."conversation_id"
      WHERE "messages"."id" = "message_attachments"."message_id"
      AND (
        auth.uid() = "conversations"."customer_id" OR 
        auth.uid() = "conversations"."assigned_admin_id" OR
        EXISTS (
          SELECT 1 FROM "profiles"
          WHERE "profiles"."id" = auth.uid() 
          AND "profiles"."role" = 'ADMIN'
        )
      )
    )
  );

-- 3. Users can delete their own attachments
CREATE POLICY "Users can delete own attachments" ON "message_attachments"
  FOR DELETE USING (
    auth.uid() = "uploaded_by_user_id" OR
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- 4. Admin policy: Admins can manage all attachments
CREATE POLICY "Admin can manage all attachments" ON "message_attachments"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- Enable realtime for messaging tables
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "conversations";
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "message_attachments";
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
  END;
END $$;

-- Success message
SELECT 'Messaging RLS setup completed successfully!' as status;