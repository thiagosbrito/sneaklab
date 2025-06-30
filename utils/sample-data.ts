/**
 * This script creates sample data for testing the dashboard.
 * Run this in your Supabase SQL editor to populate your database with test data.
 */

export const SAMPLE_DATA_SQL = `
-- Sample profiles (customers)
INSERT INTO profiles (id, full_name, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'João Silva', '+351912345678', '{"street": "Rua das Flores, 123", "city": "Lisboa", "zip": "1000-100", "country": "Portugal"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', '+351987654321', '{"street": "Avenida da Liberdade, 456", "city": "Porto", "zip": "4000-200", "country": "Portugal"}'),
('550e8400-e29b-41d4-a716-446655440003', 'Pedro Costa', '+351911222333', '{"street": "Rua do Comércio, 789", "city": "Braga", "zip": "4700-300", "country": "Portugal"}'),
('550e8400-e29b-41d4-a716-446655440004', 'Ana Ferreira', '+351933444555', '{"street": "Praça da República, 101", "city": "Coimbra", "zip": "3000-400", "country": "Portugal"}'),
('550e8400-e29b-41d4-a716-446655440005', 'Carlos Oliveira', '+351966777888', '{"street": "Rua de Santa Catarina, 222", "city": "Porto", "zip": "4000-500", "country": "Portugal"}')
ON CONFLICT (id) DO NOTHING;

-- Sample orders with various statuses and dates
INSERT INTO orders (id, user_id, total_amount, notes, status, created_at, confirmed_at, ready_at, delivered_at, completed_at) VALUES
-- Recent orders (last 7 days)
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 89.99, 'Custom Nike Air Force 1 with red details', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 129.50, 'Adidas Superstar with custom embroidery', 'delivered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', NULL),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 149.99, 'Jordan 1 retro custom colorway', 'ready', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours', NULL, NULL),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 79.99, 'Vans Old Skool with patches', 'in_progress', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NULL, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 199.99, 'Premium leather custom sneakers', 'confirmed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 99.50, 'Converse Chuck Taylor with art', 'reviewing', NOW() - INTERVAL '6 days', NULL, NULL, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 169.99, 'New Balance 990 custom', 'pending', NOW() - INTERVAL '7 days', NULL, NULL, NULL, NULL),

-- Older orders (this month)
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 119.99, 'Custom Puma RS-X', 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 89.99, 'Reebok Classic with logos', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 139.50, 'ASICS Gel-Lyte custom', 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),

-- Last month orders
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 159.99, 'Designer collaboration piece', 'completed', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '32 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 99.99, 'Vintage style custom', 'completed', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '37 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days')

ON CONFLICT (id) DO NOTHING;

-- Sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, base_price, customization_details, customization_fee, item_total) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 1, 69.99, '{"size": "42", "color": "red", "material": "leather"}', 20.00, 89.99),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 2, 1, 99.50, '{"size": "40", "embroidery": "custom text", "thread_color": "gold"}', 30.00, 129.50),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 3, 1, 119.99, '{"size": "44", "colorway": "bred", "sole": "gum"}', 30.00, 149.99),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 4, 1, 59.99, '{"size": "41", "patches": ["skull", "roses"], "laces": "black"}', 20.00, 79.99),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 5, 1, 149.99, '{"size": "43", "leather": "premium", "stitching": "contrast"}', 50.00, 199.99),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', 6, 1, 79.50, '{"size": "39", "artwork": "custom design", "colors": ["blue", "white"]}', 20.00, 99.50),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440007', 7, 1, 139.99, '{"size": "42", "material": "suede", "reflective": true}', 30.00, 169.99),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440008', 8, 1, 89.99, '{"size": "41", "colorway": "sunset", "midsole": "gradient"}', 30.00, 119.99),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440009', 9, 1, 69.99, '{"size": "40", "logo": "vintage", "tongue": "padded"}', 20.00, 89.99),
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440010', 10, 1, 109.50, '{"size": "43", "gel": "visible", "upper": "mesh"}', 30.00, 139.50),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440011', 1, 1, 109.99, '{"size": "42", "collaboration": "artist", "packaging": "special"}', 50.00, 159.99),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', 2, 1, 79.99, '{"size": "38", "vintage": "80s", "distressing": "light"}', 20.00, 99.99)

ON CONFLICT (id) DO NOTHING;

-- Update products table with some sample products (if they don't exist)
INSERT INTO products (id, name, description, price, imageURL, isAvailable, categoryID) VALUES
(1, 'Nike Air Force 1 Custom', 'Classic white sneaker ready for customization', 69.99, ARRAY['https://example.com/af1.jpg'], true, 1),
(2, 'Adidas Superstar Custom', 'Iconic shell-toe sneaker with custom options', 99.50, ARRAY['https://example.com/superstar.jpg'], true, 1),
(3, 'Jordan 1 Retro Custom', 'High-top basketball shoe with unlimited creativity', 119.99, ARRAY['https://example.com/jordan1.jpg'], true, 1),
(4, 'Vans Old Skool Custom', 'Skate shoe with custom patch and design options', 59.99, ARRAY['https://example.com/oldskool.jpg'], true, 1),
(5, 'Premium Custom Sneaker', 'High-end custom sneaker with premium materials', 149.99, ARRAY['https://example.com/premium.jpg'], true, 1),
(6, 'Converse Chuck Taylor Custom', 'Canvas sneaker with artwork possibilities', 79.50, ARRAY['https://example.com/chuck.jpg'], true, 1),
(7, 'New Balance 990 Custom', 'Made in USA sneaker with custom options', 139.99, ARRAY['https://example.com/nb990.jpg'], true, 1),
(8, 'Puma RS-X Custom', 'Chunky retro sneaker with color combinations', 89.99, ARRAY['https://example.com/rsx.jpg'], true, 1),
(9, 'Reebok Classic Custom', 'Simple leather sneaker for minimalist customs', 69.99, ARRAY['https://example.com/classic.jpg'], true, 1),
(10, 'ASICS Gel-Lyte Custom', 'Technical runner with performance custom options', 109.50, ARRAY['https://example.com/gellyte.jpg'], true, 1)
ON CONFLICT (id) DO NOTHING;

-- Create a category if it doesn't exist
INSERT INTO categories (id, name, slug, description, showInMenu) VALUES
(1, 'Custom Sneakers', 'custom-sneakers', 'Hand-crafted custom sneakers made to order', true)
ON CONFLICT (id) DO NOTHING;
`;

export function createSampleDataInstructions() {
  return `
To populate your database with sample data for testing the dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL commands from the SAMPLE_DATA_SQL export
4. Execute the query

This will create:
- 5 sample customer profiles
- 12 sample orders with various statuses and dates
- 12 corresponding order items
- 10 sample products
- 1 sample category

The sample data includes:
- Orders from the last 7 days, this month, and last month
- Various order statuses (pending, confirmed, in_progress, ready, delivered, completed)
- Different price points and customization options
- Realistic Portuguese customer data

After running this, your dashboard will display meaningful data and charts.
`;
}
