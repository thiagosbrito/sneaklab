-- Create orders table for custom sneaker business
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL, -- For hand delivery
  
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

-- Create order_items table for the products selected
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Custom product details
  quantity INTEGER DEFAULT 1,
  base_price DECIMAL(10,2) NOT NULL,
  customization_details JSONB, -- Size, colors, special requests, etc.
  customization_fee DECIMAL(10,2) DEFAULT 0,
  item_total DECIMAL(10,2) NOT NULL, -- base_price + customization_fee
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Create function to update timestamps automatically
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
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_order_timestamps_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamps();

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid()::text = customer_email OR auth.role() = 'admin');

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (auth.uid()::text = orders.customer_email OR auth.role() = 'admin')
    )
  );

-- Insert sample statuses for reference
COMMENT ON COLUMN orders.status IS 'Order workflow: pending -> reviewing -> confirmed (WhatsApp) -> in_progress -> ready (WhatsApp) -> delivered -> completed';
