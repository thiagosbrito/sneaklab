-- Create shopping_bags table (ONE bag per user with items as JSON array)
CREATE TABLE IF NOT EXISTS shopping_bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE shopping_bags ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own bag items
CREATE POLICY "Users can manage their own bag items" ON shopping_bags
    FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_bags_updated_at BEFORE UPDATE
    ON shopping_bags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();