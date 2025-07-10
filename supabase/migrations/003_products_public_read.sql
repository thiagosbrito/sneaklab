-- Allow public read access to products, categories, and brands
-- This enables unauthenticated users to browse the shop

-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view products" ON products;
DROP POLICY IF EXISTS "Only authenticated users can view products" ON products;

-- Create policy allowing everyone to read products
CREATE POLICY "Everyone can view available products" ON products
    FOR SELECT USING ("isAvailable" = true);

-- Enable RLS on categories table and allow public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view categories" ON categories;

-- Create policy allowing everyone to read categories
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

-- Enable RLS on brands table and allow public read
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view brands" ON brands;

-- Create policy allowing everyone to read brands
CREATE POLICY "Everyone can view brands" ON brands
    FOR SELECT USING (true);