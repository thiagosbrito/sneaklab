-- Rollback Script: rollback_010_convert_ids_to_uuid.sql
-- Purpose: Rollback UUID conversion and restore original numeric IDs
-- WARNING: This rollback is complex and should only be used in emergency situations
-- It's recommended to restore from a database backup instead of using this rollback

-- IMPORTANT: This rollback script cannot restore the exact same numeric IDs
-- as the original ones, but it will restore the same relationships and data integrity

BEGIN;

-- Step 1: Create backup of current UUID data before rollback
CREATE TABLE uuid_backup_products AS SELECT * FROM products;
CREATE TABLE uuid_backup_categories AS SELECT * FROM categories;
CREATE TABLE uuid_backup_brands AS SELECT * FROM brands;
CREATE TABLE uuid_backup_order_items AS SELECT * FROM order_items;
CREATE TABLE uuid_backup_wishlist AS SELECT * FROM wishlist;

-- Step 2: Drop foreign key constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brandID_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_categoryID_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_product_id_fkey;

-- Step 3: Create temporary mapping for UUID to new numeric IDs
CREATE TEMP TABLE rollback_id_map (
    table_name TEXT,
    uuid_id TEXT,
    new_numeric_id SERIAL
);

-- Generate new numeric IDs for each table
INSERT INTO rollback_id_map (table_name, uuid_id)
SELECT 'categories', id FROM categories ORDER BY created_at;

INSERT INTO rollback_id_map (table_name, uuid_id)  
SELECT 'brands', id FROM brands ORDER BY created_at;

INSERT INTO rollback_id_map (table_name, uuid_id)
SELECT 'products', id FROM products ORDER BY created_at;

INSERT INTO rollback_id_map (table_name, uuid_id)
SELECT 'about_us_section', id FROM about_us_section ORDER BY created_at;

INSERT INTO rollback_id_map (table_name, uuid_id)
SELECT 'hero_section', id FROM hero_section ORDER BY created_at;

INSERT INTO rollback_id_map (table_name, uuid_id)
SELECT 'showcase_section', id FROM showcase_section ORDER BY created_at;

-- Step 4: Convert back to numeric IDs

-- Categories first (no dependencies)
ALTER TABLE categories ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'categories' AND uuid_id = categories.id
);

-- Brands second (no dependencies)
ALTER TABLE brands ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'brands' AND uuid_id = brands.id
);

-- Products - convert foreign keys first
ALTER TABLE products ALTER COLUMN categoryID TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'categories' AND uuid_id = products.categoryID
);

ALTER TABLE products ALTER COLUMN brandID TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'brands' AND uuid_id = products.brandID
);

-- Products - convert primary key
ALTER TABLE products ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'products' AND uuid_id = products.id
);

-- Content management tables
ALTER TABLE about_us_section ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'about_us_section' AND uuid_id = about_us_section.id
);

ALTER TABLE hero_section ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'hero_section' AND uuid_id = hero_section.id
);

ALTER TABLE showcase_section ALTER COLUMN id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'showcase_section' AND uuid_id = showcase_section.id
);

-- Step 5: Convert foreign key references back to numeric

-- Update order_items.product_id
ALTER TABLE order_items ALTER COLUMN product_id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'products' AND uuid_id = order_items.product_id
);

-- Update wishlist.product_id  
ALTER TABLE wishlist ALTER COLUMN product_id TYPE INTEGER USING (
    SELECT new_numeric_id FROM rollback_id_map 
    WHERE table_name = 'products' AND uuid_id = wishlist.product_id
);

-- Step 6: Reset SERIAL sequences to appropriate values
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('about_us_section_id_seq', (SELECT MAX(id) FROM about_us_section));
SELECT setval('hero_section_id_seq', (SELECT MAX(id) FROM hero_section));
SELECT setval('showcase_section_id_seq', (SELECT MAX(id) FROM showcase_section));

-- Step 7: Recreate foreign key constraints
ALTER TABLE products ADD CONSTRAINT products_brandID_fkey 
    FOREIGN KEY (brandID) REFERENCES brands(id);

ALTER TABLE products ADD CONSTRAINT products_categoryID_fkey 
    FOREIGN KEY (categoryID) REFERENCES categories(id);

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE wishlist ADD CONSTRAINT wishlist_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

-- Step 8: Recreate indexes
CREATE INDEX idx_products_brand_id ON products(brandID);
CREATE INDEX idx_products_category_id ON products(categoryID);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

-- Step 9: Validation
DO $$
DECLARE
    products_count INTEGER;
    categories_count INTEGER;
    brands_count INTEGER;
    fk_errors INTEGER := 0;
BEGIN
    -- Check record counts match
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO brands_count FROM brands;
    
    IF products_count != (SELECT COUNT(*) FROM uuid_backup_products) THEN
        RAISE EXCEPTION 'Products count mismatch after rollback';
    END IF;
    
    IF categories_count != (SELECT COUNT(*) FROM uuid_backup_categories) THEN
        RAISE EXCEPTION 'Categories count mismatch after rollback';
    END IF;
    
    IF brands_count != (SELECT COUNT(*) FROM uuid_backup_brands) THEN
        RAISE EXCEPTION 'Brands count mismatch after rollback';
    END IF;
    
    -- Check foreign key integrity
    SELECT COUNT(*) INTO fk_errors FROM products p
    LEFT JOIN categories c ON p.categoryID = c.id
    WHERE c.id IS NULL;
    
    IF fk_errors > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid category references after rollback', fk_errors;
    END IF;
    
    SELECT COUNT(*) INTO fk_errors FROM products p
    LEFT JOIN brands b ON p.brandID = b.id
    WHERE p.brandID IS NOT NULL AND b.id IS NULL;
    
    IF fk_errors > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid brand references after rollback', fk_errors;
    END IF;
    
    RAISE NOTICE 'Rollback validation passed - all data integrity checks successful';
END $$;

-- Step 10: Clean up backup tables (optional - you may want to keep these)
-- DROP TABLE uuid_backup_products;
-- DROP TABLE uuid_backup_categories;
-- DROP TABLE uuid_backup_brands;
-- DROP TABLE uuid_backup_order_items;
-- DROP TABLE uuid_backup_wishlist;

COMMIT;

-- Display rollback results
SELECT 
    'Rollback Summary' as status,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM brands) as brands_count,
    'Numeric IDs restored' as id_type;

RAISE NOTICE 'UUID to numeric ID rollback completed successfully';
RAISE NOTICE 'WARNING: Original numeric ID values were not preserved - new sequential IDs were generated';
RAISE NOTICE 'All relationships and data integrity have been maintained';