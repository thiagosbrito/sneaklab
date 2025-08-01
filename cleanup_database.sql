-- Complete database cleanup - Drop ALL tables and policies
-- This will allow drizzle to create everything from scratch

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Drop any remaining tables that might exist
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any sequences that might be left over
DROP SEQUENCE IF EXISTS brands_id_seq CASCADE;
DROP SEQUENCE IF EXISTS categories_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS about_us_section_id_seq CASCADE;
DROP SEQUENCE IF EXISTS hero_section_id_seq CASCADE;
DROP SEQUENCE IF EXISTS showcase_section_id_seq CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop enum if it exists
DROP TYPE IF EXISTS roles CASCADE;