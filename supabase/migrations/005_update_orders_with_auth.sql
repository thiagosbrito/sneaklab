-- Create user profiles table to extend Supabase auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address JSONB, -- {street, city, state, zip, country}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated orders table using user_id instead of customer details
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Order details
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT, -- Special instructions from customer
  
  -- Custom product workflow status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',        -- Just created, waiting for feasibility check
    'reviewing',      -- Team is checking feasibility
    'confirmed',      -- Feasible, work can start (triggers WhatsApp)
    'rejected',       -- Not feasible
    'in_progress',    -- Work has started
    'ready',          -- Product is ready (triggers WhatsApp notification)
    'delivered',      -- Hand delivered
    'completed'       -- Payment collected, order complete
  )),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Team notes (internal)
  feasibility_notes TEXT,
  production_notes TEXT
);

-- Order items table (unchanged)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  
  -- Custom product details
  quantity INTEGER DEFAULT 1,
  base_price DECIMAL(10,2) NOT NULL,
  customization_details JSONB, -- Size, colors, special requests, etc.
  customization_fee DECIMAL(10,2) DEFAULT 0,
  item_total DECIMAL(10,2) NOT NULL, -- base_price + customization_fee
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile automatically
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp based on status change
  CASE NEW.status
    WHEN 'confirmed' THEN
      NEW.confirmed_at = NOW();
    WHEN 'ready' THEN
      NEW.ready_at = NOW();
    WHEN 'delivered' THEN
      NEW.delivered_at = NOW();
    WHEN 'completed' THEN
      NEW.completed_at = NOW();
    ELSE
      -- Do nothing for other statuses
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_order_timestamps_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamps();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for order_items
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- Create a view for orders with user details for WhatsApp function
CREATE VIEW orders_with_user_details AS
SELECT 
  o.*,
  p.full_name as customer_name,
  p.phone as customer_phone,
  p.address as customer_address,
  u.email as customer_email
FROM orders o
JOIN profiles p ON o.user_id = p.id
JOIN auth.users u ON o.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON orders_with_user_details TO service_role;

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with contact information for WhatsApp notifications';
COMMENT ON TABLE orders IS 'Orders table linked to authenticated users';
COMMENT ON VIEW orders_with_user_details IS 'Orders with user contact details for WhatsApp notifications';
COMMENT ON COLUMN orders.status IS 'Order workflow: pending -> reviewing -> confirmed (WhatsApp) -> in_progress -> ready (WhatsApp) -> delivered -> completed';
