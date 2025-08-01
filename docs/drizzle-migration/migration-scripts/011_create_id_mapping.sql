-- Migration: 011_create_id_mapping.sql
-- Purpose: Create mapping tables to track old numeric IDs to new UUID mappings
-- This enables data recovery and rollback capabilities during the migration process

-- Create ID mapping table for tracking numeric to UUID conversions
CREATE TABLE IF NOT EXISTS id_mappings (
    table_name TEXT NOT NULL,
    old_id INTEGER NOT NULL,
    new_id TEXT NOT NULL,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (table_name, old_id)
);

-- Create index for reverse lookups (UUID to numeric)
CREATE INDEX idx_id_mappings_new_id ON id_mappings(table_name, new_id);

-- Populate mappings for products table
INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'products', id, id_new 
FROM products 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

-- Populate mappings for categories table  
INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'categories', id, id_new 
FROM categories 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

-- Populate mappings for brands table
INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'brands', id, id_new 
FROM brands 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

-- Populate mappings for content management tables
INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'about_us_section', id, id_new 
FROM about_us_section 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'hero_section', id, id_new 
FROM hero_section 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'showcase_section', id, id_new 
FROM showcase_section 
WHERE id_new IS NOT NULL
ON CONFLICT (table_name, old_id) DO UPDATE SET 
    new_id = EXCLUDED.new_id,
    mapped_at = NOW();

-- Create helper functions for ID conversion
CREATE OR REPLACE FUNCTION get_uuid_from_numeric(table_name TEXT, numeric_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    uuid_value TEXT;
BEGIN
    SELECT new_id INTO uuid_value 
    FROM id_mappings 
    WHERE id_mappings.table_name = get_uuid_from_numeric.table_name 
    AND old_id = numeric_id;
    
    RETURN uuid_value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_numeric_from_uuid(table_name TEXT, uuid_value TEXT)
RETURNS INTEGER AS $$
DECLARE
    numeric_id INTEGER;
BEGIN
    SELECT old_id INTO numeric_id 
    FROM id_mappings 
    WHERE id_mappings.table_name = get_numeric_from_uuid.table_name 
    AND new_id = uuid_value;
    
    RETURN numeric_id;
END;
$$ LANGUAGE plpgsql;

-- Validation: Ensure all records have mappings
DO $$
DECLARE
    products_count INTEGER;
    products_mapped INTEGER;
    categories_count INTEGER;
    categories_mapped INTEGER;
    brands_count INTEGER;
    brands_mapped INTEGER;
BEGIN
    -- Check products mapping completeness
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO products_mapped FROM id_mappings WHERE table_name = 'products';
    
    IF products_count != products_mapped THEN
        RAISE EXCEPTION 'Products mapping incomplete: % records, % mapped', products_count, products_mapped;
    END IF;
    
    -- Check categories mapping completeness
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO categories_mapped FROM id_mappings WHERE table_name = 'categories';
    
    IF categories_count != categories_mapped THEN
        RAISE EXCEPTION 'Categories mapping incomplete: % records, % mapped', categories_count, categories_mapped;
    END IF;
    
    -- Check brands mapping completeness
    SELECT COUNT(*) INTO brands_count FROM brands;
    SELECT COUNT(*) INTO brands_mapped FROM id_mappings WHERE table_name = 'brands';
    
    IF brands_count != brands_mapped THEN
        RAISE EXCEPTION 'Brands mapping incomplete: % records, % mapped', brands_count, brands_mapped;
    END IF;
    
    RAISE NOTICE 'ID mapping validation passed for all tables';
END $$;

-- Create view for easy mapping lookups
CREATE OR REPLACE VIEW id_mapping_summary AS
SELECT 
    table_name,
    COUNT(*) as mapping_count,
    MIN(mapped_at) as first_mapped,
    MAX(mapped_at) as last_mapped
FROM id_mappings 
GROUP BY table_name
ORDER BY table_name;

-- Test helper functions
DO $$
DECLARE
    test_uuid TEXT;
    test_numeric INTEGER;
BEGIN
    -- Test UUID lookup
    SELECT id_new INTO test_uuid FROM products LIMIT 1;
    SELECT id INTO test_numeric FROM products WHERE id_new = test_uuid;
    
    IF get_uuid_from_numeric('products', test_numeric) != test_uuid THEN
        RAISE EXCEPTION 'UUID lookup function test failed';
    END IF;
    
    IF get_numeric_from_uuid('products', test_uuid) != test_numeric THEN
        RAISE EXCEPTION 'Numeric lookup function test failed';
    END IF;
    
    RAISE NOTICE 'Helper function tests passed';
END $$;

-- Log migration completion
INSERT INTO migration_log (migration_name, completed_at, notes) 
VALUES ('011_create_id_mapping', NOW(), 'Created ID mapping tables and helper functions');

-- Display mapping summary
SELECT * FROM id_mapping_summary;