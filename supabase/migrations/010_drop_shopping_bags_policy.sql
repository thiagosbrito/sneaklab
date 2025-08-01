-- Temporarily drop RLS policy that depends on user_id column
-- This is needed before changing column type from UUID to TEXT

DROP POLICY IF EXISTS "Users can manage their own bag items" ON shopping_bags;