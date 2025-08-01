-- Migration: 012_add_new_foreign_keys.sql
-- Purpose: Add new UUID-based foreign key columns and populate them using ID mappings
-- This maintains referential integrity while transitioning to UUID-based relationships

-- Add new UUID foreign key columns to products table
ALTER TABLE products ADD COLUMN brandID_new TEXT;
ALTER TABLE products ADD COLUMN categoryID_new TEXT;

-- Add new UUID foreign key columns to order_items table  
ALTER TABLE order_items ADD COLUMN product_id_new TEXT;

-- Add new UUID foreign key columns to wishlist table
ALTER TABLE wishlist ADD COLUMN product_id_new TEXT;

-- Populate new foreign key columns using ID mappings

-- Update products.brandID_new using brands mapping
UPDATE products SET brandID_new = (
    SELECT new_id 
    FROM id_mappings 
    WHERE table_name = 'brands' 
    AND old_id = products.brandID
)
WHERE brandID IS NOT NULL;

-- Update products.categoryID_new using categories mapping  
UPDATE products SET categoryID_new = (
    SELECT new_id 
    FROM id_mappings 
    WHERE table_name = 'categories' 
    AND old_id = products.categoryID
);

-- Update order_items.product_id_new using products mapping
-- Note: order_items.product_id might be stored as TEXT but represents INTEGER
UPDATE order_items SET product_id_new = (
    SELECT new_id 
    FROM id_mappings 
    WHERE table_name = 'products' 
    AND old_id = CASE 
        WHEN product_id ~ '^[0-9]+$' THEN product_id::INTEGER
        ELSE NULL
    END
)
WHERE product_id IS NOT NULL;

-- Update wishlist.product_id_new using products mapping
UPDATE wishlist SET product_id_new = (
    SELECT new_id 
    FROM id_mappings 
    WHERE table_name = 'products' 
    AND old_id = wishlist.product_id
)
WHERE product_id IS NOT NULL;

-- Create indexes on new foreign key columns for performance
CREATE INDEX CONCURRENTLY idx_products_brand_id_new ON products(brandID_new);
CREATE INDEX CONCURRENTLY idx_products_category_id_new ON products(categoryID_new);
CREATE INDEX CONCURRENTLY idx_order_items_product_id_new ON order_items(product_id_new);
CREATE INDEX CONCURRENTLY idx_wishlist_product_id_new ON wishlist(product_id_new);

-- Add temporary foreign key constraints (will be recreated in final step)
-- These are added as NOT VALID initially to avoid blocking operations
ALTER TABLE products ADD CONSTRAINT products_brandID_new_fkey 
    FOREIGN KEY (brandID_new) REFERENCES brands(id_new) NOT VALID;

ALTER TABLE products ADD CONSTRAINT products_categoryID_new_fkey 
    FOREIGN KEY (categoryID_new) REFERENCES categories(id_new) NOT VALID;

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_new_fkey 
    FOREIGN KEY (product_id_new) REFERENCES products(id_new) NOT VALID;

ALTER TABLE wishlist ADD CONSTRAINT wishlist_product_id_new_fkey 
    FOREIGN KEY (product_id_new) REFERENCES products(id_new) NOT VALID;

-- Validate the constraints (this will fail if there are any integrity issues)
ALTER TABLE products VALIDATE CONSTRAINT products_brandID_new_fkey;
ALTER TABLE products VALIDATE CONSTRAINT products_categoryID_new_fkey;  
ALTER TABLE order_items VALIDATE CONSTRAINT order_items_product_id_new_fkey;
ALTER TABLE wishlist VALIDATE CONSTRAINT wishlist_product_id_new_fkey;

-- Validation: Check foreign key population completeness
DO $$
DECLARE
    products_with_brand_old INTEGER;
    products_with_brand_new INTEGER;
    products_with_category_old INTEGER;
    products_with_category_new INTEGER;
    order_items_with_product_old INTEGER;
    order_items_with_product_new INTEGER;
    wishlist_with_product_old INTEGER;
    wishlist_with_product_new INTEGER;
BEGIN
    -- Check products.brandID migration
    SELECT COUNT(*) INTO products_with_brand_old FROM products WHERE brandID IS NOT NULL;
    SELECT COUNT(*) INTO products_with_brand_new FROM products WHERE brandID_new IS NOT NULL;
    
    IF products_with_brand_old != products_with_brand_new THEN
        RAISE EXCEPTION 'Brand FK migration incomplete: % old, % new', products_with_brand_old, products_with_brand_new;
    END IF;
    
    -- Check products.categoryID migration
    SELECT COUNT(*) INTO products_with_category_old FROM products WHERE categoryID IS NOT NULL;
    SELECT COUNT(*) INTO products_with_category_new FROM products WHERE categoryID_new IS NOT NULL;
    
    IF products_with_category_old != products_with_category_new THEN
        RAISE EXCEPTION 'Category FK migration incomplete: % old, % new', products_with_category_old, products_with_category_new;
    END IF;
    
    -- Check order_items.product_id migration
    SELECT COUNT(*) INTO order_items_with_product_old FROM order_items WHERE product_id IS NOT NULL;
    SELECT COUNT(*) INTO order_items_with_product_new FROM order_items WHERE product_id_new IS NOT NULL;
    
    IF order_items_with_product_old != order_items_with_product_new THEN
        RAISE EXCEPTION 'Order items product FK migration incomplete: % old, % new', order_items_with_product_old, order_items_with_product_new;
    END IF;
    
    -- Check wishlist.product_id migration
    SELECT COUNT(*) INTO wishlist_with_product_old FROM wishlist WHERE product_id IS NOT NULL;
    SELECT COUNT(*) INTO wishlist_with_product_new FROM wishlist WHERE product_id_new IS NOT NULL;
    
    IF wishlist_with_product_old != wishlist_with_product_new THEN
        RAISE EXCEPTION 'Wishlist product FK migration incomplete: % old, % new', wishlist_with_product_old, wishlist_with_product_new;
    END IF;
    
    RAISE NOTICE 'Foreign key migration validation passed for all tables';
END $$;

-- Additional validation: Check for orphaned records
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Check for products with invalid brand references
    SELECT COUNT(*) INTO orphaned_count 
    FROM products p 
    LEFT JOIN brands b ON p.brandID_new = b.id_new 
    WHERE p.brandID_new IS NOT NULL AND b.id_new IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid brand references', orphaned_count;
    END IF;
    
    -- Check for products with invalid category references
    SELECT COUNT(*) INTO orphaned_count 
    FROM products p 
    LEFT JOIN categories c ON p.categoryID_new = c.id_new 
    WHERE c.id_new IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Found % products with invalid category references', orphaned_count;
    END IF;
    
    -- Check for order_items with invalid product references
    SELECT COUNT(*) INTO orphaned_count 
    FROM order_items oi 
    LEFT JOIN products p ON oi.product_id_new = p.id_new 
    WHERE oi.product_id_new IS NOT NULL AND p.id_new IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Found % order items with invalid product references', orphaned_count;
    END IF;
    
    -- Check for wishlist items with invalid product references
    SELECT COUNT(*) INTO orphaned_count 
    FROM wishlist w 
    LEFT JOIN products p ON w.product_id_new = p.id_new 
    WHERE w.product_id_new IS NOT NULL AND p.id_new IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Found % wishlist items with invalid product references', orphaned_count;
    END IF;
    
    RAISE NOTICE 'Orphaned record validation passed for all tables';
END $$;

-- Create view for monitoring foreign key migration progress
CREATE OR REPLACE VIEW foreign_key_migration_status AS
SELECT 
    'products_brand' as relationship,
    (SELECT COUNT(*) FROM products WHERE brandID IS NOT NULL) as old_count,
    (SELECT COUNT(*) FROM products WHERE brandID_new IS NOT NULL) as new_count,
    (SELECT COUNT(*) FROM products WHERE brandID IS NOT NULL AND brandID_new IS NOT NULL) as both_count
UNION ALL
SELECT 
    'products_category',
    (SELECT COUNT(*) FROM products WHERE categoryID IS NOT NULL),
    (SELECT COUNT(*) FROM products WHERE categoryID_new IS NOT NULL),
    (SELECT COUNT(*) FROM products WHERE categoryID IS NOT NULL AND categoryID_new IS NOT NULL)
UNION ALL
SELECT 
    'order_items_product',
    (SELECT COUNT(*) FROM order_items WHERE product_id IS NOT NULL),
    (SELECT COUNT(*) FROM order_items WHERE product_id_new IS NOT NULL),
    (SELECT COUNT(*) FROM order_items WHERE product_id IS NOT NULL AND product_id_new IS NOT NULL)
UNION ALL
SELECT 
    'wishlist_product',
    (SELECT COUNT(*) FROM wishlist WHERE product_id IS NOT NULL),
    (SELECT COUNT(*) FROM wishlist WHERE product_id_new IS NOT NULL),
    (SELECT COUNT(*) FROM wishlist WHERE product_id IS NOT NULL AND product_id_new IS NOT NULL);

-- Log migration completion
INSERT INTO migration_log (migration_name, completed_at, notes) 
VALUES ('012_add_new_foreign_keys', NOW(), 'Added and populated UUID-based foreign key columns');

-- Display migration status
SELECT * FROM foreign_key_migration_status;