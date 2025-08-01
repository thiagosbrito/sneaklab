-- Recreate RLS policy after column type change from UUID to TEXT
-- The user_id column is now TEXT type instead of UUID

CREATE POLICY "Users can manage their own bag items" ON shopping_bags
    FOR ALL USING (auth.uid()::text = user_id);