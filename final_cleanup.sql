-- Final cleanup - ensure completely empty database
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS shopping_bags CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS hero_section CASCADE;
DROP TABLE IF EXISTS about_us_section CASCADE;
DROP TABLE IF EXISTS showcase_section CASCADE;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS hero_section_id_seq CASCADE;
DROP SEQUENCE IF EXISTS about_us_section_id_seq CASCADE; 
DROP SEQUENCE IF EXISTS showcase_section_id_seq CASCADE;

-- Drop enum
DROP TYPE IF EXISTS roles CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;