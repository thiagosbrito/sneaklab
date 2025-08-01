-- Migration: 010_convert_ids_to_uuid.sql
-- Purpose: Convert existing numeric ID fields to UUID format directly
-- This is a more straightforward approach that modifies existing columns in place

-- Step 1: Create a temporary mapping table to preserve old ID relationships
CREATE TEMP TABLE id_conversion_map (
    table_name TEXT,
    old_id INTEGER,
    new_uuid TEXT
);

-- Step 2: Generate UUIDs for all records and store mappings
-- Products table
INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'products', id, gen_random_uuid()::TEXT FROM products;

-- Categories table  
INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'categories', id, gen_random_uuid()::TEXT FROM categories;

-- Brands table
INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'brands', id, gen_random_uuid()::TEXT FROM brands;

-- Content management tables
INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'about_us_section', id, gen_random_uuid()::TEXT FROM about_us_section;

INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'hero_section', id, gen_random_uuid()::TEXT FROM hero_section;

INSERT INTO id_conversion_map (table_name, old_id, new_uuid)
SELECT 'showcase_section', id, gen_random_uuid()::TEXT FROM showcase_section;

-- Step 3: Drop existing foreign key constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brandID_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_categoryID_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_product_id_fkey;

-- Step 4: Convert primary key columns from INTEGER to TEXT (UUID)

-- Categories first (no dependencies)
ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'categories' AND old_id = categories.id
);

-- Brands second (no dependencies)  
ALTER TABLE brands ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'brands' AND old_id = brands.id
);

-- Products third (depends on categories and brands)
-- First update foreign keys
ALTER TABLE products ALTER COLUMN categoryID TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'categories' AND old_id = products.categoryID
);

ALTER TABLE products ALTER COLUMN brandID TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'brands' AND old_id = products.brandID
);

-- Then update primary key
ALTER TABLE products ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'products' AND old_id = products.id
);

-- Content management tables (no dependencies)
ALTER TABLE about_us_section ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'about_us_section' AND old_id = about_us_section.id
);

ALTER TABLE hero_section ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'hero_section' AND old_id = hero_section.id
);

ALTER TABLE showcase_section ALTER COLUMN id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'showcase_section' AND old_id = showcase_section.id
);

-- Step 5: Update foreign key references in related tables

-- Update order_items.product_id (convert from number to UUID)
ALTER TABLE order_items ALTER COLUMN product_id TYPE TEXT USING (
    CASE 
        WHEN product_id IS NULL THEN NULL
        -- Handle case where product_id might already be text but represents a number
        WHEN product_id ~ '^[0-9]+$' THEN (
            SELECT new_uuid FROM id_conversion_map 
            WHERE table_name = 'products' AND old_id = product_id::INTEGER
        )
        ELSE product_id -- Already a UUID, keep as is
    END
);

-- Update wishlist.product_id (convert from number to UUID)
ALTER TABLE wishlist ALTER COLUMN product_id TYPE TEXT USING (
    SELECT new_uuid FROM id_conversion_map 
    WHERE table_name = 'products' AND old_id = wishlist.product_id
);

-- Step 6: Set default UUID generation for new records
ALTER TABLE products ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE brands ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE about_us_section ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE hero_section ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE showcase_section ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 7: Recreate foreign key constraints
ALTER TABLE products ADD CONSTRAINT products_brandID_fkey 
    FOREIGN KEY (brandID) REFERENCES brands(id);

ALTER TABLE products ADD CONSTRAINT products_categoryID_fkey 
    FOREIGN KEY (categoryID) REFERENCES categories(id);

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE wishlist ADD CONSTRAINT wishlist_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

-- Step 8: Recreate indexes for performance
DROP INDEX IF EXISTS idx_products_brand_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_wishlist_product_id;

CREATE INDEX idx_products_brand_id ON products(brandID);
CREATE INDEX idx_products_category_id ON products(categoryID);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX idx_wishlist_user_product ON wishlist(user_id, product_id);

-- Step 9: Validation
DO $$
DECLARE
    invalid_uuid_count INTEGER;
    orphaned_fk_count INTEGER;
BEGIN
    -- Validate UUID format in all converted tables
    SELECT COUNT(*) INTO invalid_uuid_count FROM (
        SELECT id FROM products WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM categories WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM brands WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) invalid_uuids;
    
    IF invalid_uuid_count > 0 THEN
        RAISE EXCEPTION 'Found % records with invalid UUID format', invalid_uuid_count;
    END IF;
    
    -- Check foreign key integrity
    SELECT COUNT(*) INTO orphaned_fk_count FROM products p
    LEFT JOIN categories c ON p.categoryID = c.id
    WHERE c.id IS NULL;
    
    IF orphaned_fk_count > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid category references', orphaned_fk_count;
    END IF;
    
    SELECT COUNT(*) INTO orphaned_fk_count FROM products p
    LEFT JOIN brands b ON p.brandID = b.id
    WHERE p.brandID IS NOT NULL AND b.id IS NULL;
    
    IF orphaned_fk_count > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid brand references', orphaned_fk_count;
    END IF;
    
    SELECT COUNT(*) INTO orphaned_fk_count FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.product_id IS NOT NULL AND p.id IS NULL;
    
    IF orphaned_fk_count > 0 THEN
        RAISE EXCEPTION 'Found % order items with invalid product references', orphaned_fk_count;
    END IF;
    
    SELECT COUNT(*) INTO orphaned_fk_count FROM wishlist w
    LEFT JOIN products p ON w.product_id = p.id
    WHERE w.product_id IS NOT NULL AND p.id IS NULL;
    
    IF orphaned_fk_count > 0 THEN
        RAISE EXCEPTION 'Found % wishlist items with invalid product references', orphaned_fk_count;
    END IF;
    
    RAISE NOTICE 'UUID conversion validation passed - all IDs are valid UUIDs and foreign keys are intact';
END $$;

-- Step 10: Display conversion summary
SELECT 
    'UUID Conversion Summary' as status,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM brands) as brands_count,
    (SELECT COUNT(*) FROM order_items WHERE product_id IS NOT NULL) as order_items_with_products,
    (SELECT COUNT(*) FROM wishlist WHERE product_id IS NOT NULL) as wishlist_items_with_products;

-- Clean up temporary table
DROP TABLE id_conversion_map;

RAISE NOTICE 'Migration completed successfully - all numeric IDs converted to UUIDs';