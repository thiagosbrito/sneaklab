-- ===============================================
-- ROW LEVEL SECURITY SETUP FOR SNEAKLAB
-- Run this after drizzle-kit push to ensure RLS is properly configured
-- Use snake_case column names as they appear in the actual database
-- ===============================================

-- NOTIFICATIONS TABLE RLS
-- ===============================================

-- Enable Row Level Security for notifications
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view their own notifications" ON "notifications";
DROP POLICY IF EXISTS "Users can update their own notifications" ON "notifications";
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON "notifications";
DROP POLICY IF EXISTS "Admin can manage all notifications" ON "notifications";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "idx_notifications_status" ON "notifications"("status");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notifications_related" ON "notifications"("related_id", "related_type");

-- RLS Policies for notifications

-- 1. Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON "notifications"
  FOR SELECT USING (auth.uid() = "user_id");

-- 2. Users can mark their own notifications as read/update
CREATE POLICY "Users can update their own notifications" ON "notifications"
  FOR UPDATE USING (auth.uid() = "user_id");

-- 3. Only authenticated users can insert notifications (for system/admin use)
CREATE POLICY "Authenticated users can insert notifications" ON "notifications"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Admin policy: Admins can view/manage all notifications
CREATE POLICY "Admin can manage all notifications" ON "notifications"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles" 
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- PROFILES TABLE RLS (if not already set)
-- ===============================================

-- Enable RLS for profiles
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
DROP POLICY IF EXISTS "Admin can view all profiles" ON "profiles";

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON "profiles"
  FOR SELECT USING (auth.uid() = "id");

CREATE POLICY "Users can update own profile" ON "profiles"
  FOR UPDATE USING (auth.uid() = "id");

CREATE POLICY "Admin can view all profiles" ON "profiles"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles" p
      WHERE p."id" = auth.uid() 
      AND p."role" = 'ADMIN'
    )
  );

-- ORDERS TABLE RLS
-- ===============================================

-- Enable RLS for orders
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON "orders";
DROP POLICY IF EXISTS "Users can insert own orders" ON "orders";
DROP POLICY IF EXISTS "Admin can manage all orders" ON "orders";

-- Orders RLS policies
CREATE POLICY "Users can view own orders" ON "orders"
  FOR SELECT USING (auth.uid() = "user_id");

CREATE POLICY "Users can insert own orders" ON "orders"
  FOR INSERT WITH CHECK (auth.uid() = "user_id");

CREATE POLICY "Admin can manage all orders" ON "orders"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- MESSAGING TABLES RLS (for future messaging implementation)
-- ===============================================

-- Note: These policies are for when messaging tables are created
-- Uncomment when messaging feature is implemented

/*
-- Enable RLS for conversations
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;

-- Conversations policies
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

CREATE POLICY "Users can create conversations" ON "conversations"
  FOR INSERT WITH CHECK (auth.uid() = "customer_id");

CREATE POLICY "Admin can manage conversations" ON "conversations"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid() 
      AND "profiles"."role" = 'ADMIN'
    )
  );

-- Enable RLS for messages
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- Messages policies
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
  );

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
  );
*/

-- Enable realtime for existing tables (skip if already added)
-- Note: These may show errors if already added - that's normal
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
  END;
END $$;

-- Success message
SELECT 'RLS setup completed successfully!' as status;