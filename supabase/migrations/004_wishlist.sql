-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist(created_at);

-- RLS policies for wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishlist items
CREATE POLICY "Users can view own wishlist items" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert items to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete items from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON wishlist TO authenticated;
GRANT ALL ON wishlist TO service_role;