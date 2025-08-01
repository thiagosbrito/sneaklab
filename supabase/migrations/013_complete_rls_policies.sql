-- Complete RLS policies for the new text-based schema
-- Run after drizzle-kit push creates the tables

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_section ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Everyone can view available products" ON products
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can modify products" ON products
    FOR ALL TO public USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

-- Categories policies
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT TO public USING (true);

-- Brands policies
CREATE POLICY "Everyone can view brands" ON brands
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can modify brands" ON brands
    FOR ALL TO public USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE TO public USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT TO public USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their order items" ON order_items
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Shopping bags policies
CREATE POLICY "Users can manage their own bag items" ON shopping_bags
    FOR ALL TO public USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view own wishlist items" ON wishlist
    FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist" ON wishlist
    FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist" ON wishlist
    FOR DELETE TO public USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO public USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO public USING (auth.uid() = id);

-- Content management policies (admin only)
CREATE POLICY "Admins can manage hero sections" ON hero_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::text AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can manage about us sections" ON about_us_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::text AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can manage showcase sections" ON showcase_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::text AND profiles.role = 'ADMIN'
        )
    );