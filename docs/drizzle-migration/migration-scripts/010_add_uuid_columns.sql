-- Migration: 010_add_uuid_columns.sql
-- Purpose: Add new UUID columns alongside existing numeric ID columns
-- This allows for zero-downtime migration by maintaining both column types during transition

-- Add UUID columns to main tables
ALTER TABLE products ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();
ALTER TABLE categories ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();  
ALTER TABLE brands ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();

-- Add UUID columns to content management tables
ALTER TABLE about_us_section ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();
ALTER TABLE hero_section ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();
ALTER TABLE showcase_section ADD COLUMN id_new TEXT DEFAULT gen_random_uuid();

-- Ensure all new UUID columns have unique values
UPDATE products SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE categories SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE brands SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE about_us_section SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE hero_section SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE showcase_section SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- Add unique constraints on new UUID columns
ALTER TABLE products ADD CONSTRAINT products_id_new_unique UNIQUE (id_new);
ALTER TABLE categories ADD CONSTRAINT categories_id_new_unique UNIQUE (id_new);
ALTER TABLE brands ADD CONSTRAINT brands_id_new_unique UNIQUE (id_new);
ALTER TABLE about_us_section ADD CONSTRAINT about_us_section_id_new_unique UNIQUE (id_new);
ALTER TABLE hero_section ADD CONSTRAINT hero_section_id_new_unique UNIQUE (id_new);
ALTER TABLE showcase_section ADD CONSTRAINT showcase_section_id_new_unique UNIQUE (id_new);

-- Create indexes on new UUID columns for performance
CREATE INDEX CONCURRENTLY idx_products_id_new ON products(id_new);
CREATE INDEX CONCURRENTLY idx_categories_id_new ON categories(id_new);
CREATE INDEX CONCURRENTLY idx_brands_id_new ON brands(id_new);

-- Verify all records have valid UUIDs
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check products
    SELECT COUNT(*) INTO invalid_count FROM products 
    WHERE id_new IS NULL OR id_new !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid UUIDs in products table', invalid_count;
    END IF;
    
    -- Check categories  
    SELECT COUNT(*) INTO invalid_count FROM categories
    WHERE id_new IS NULL OR id_new !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid UUIDs in categories table', invalid_count;
    END IF;
    
    -- Check brands
    SELECT COUNT(*) INTO invalid_count FROM brands
    WHERE id_new IS NULL OR id_new !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid UUIDs in brands table', invalid_count;
    END IF;
    
    RAISE NOTICE 'UUID column validation passed for all tables';
END $$;

-- Log migration completion
INSERT INTO migration_log (migration_name, completed_at, notes) 
VALUES ('010_add_uuid_columns', NOW(), 'Added UUID columns to all main tables');

-- Display summary
SELECT 
    'Migration 010 Summary' as status,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM categories) as categories_count, 
    (SELECT COUNT(*) FROM brands) as brands_count,
    (SELECT COUNT(*) FROM products WHERE id_new IS NOT NULL) as products_with_uuid,
    (SELECT COUNT(*) FROM categories WHERE id_new IS NOT NULL) as categories_with_uuid,
    (SELECT COUNT(*) FROM brands WHERE id_new IS NOT NULL) as brands_with_uuid;