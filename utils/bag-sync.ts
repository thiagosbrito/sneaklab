// Future Supabase integration utilities for bag persistence
// This can be used later when implementing user authentication

import { Database } from "@/utils/supabase/database.types";

export type BagItem = {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
};

// SQL for creating the shopping_bags table in Supabase (run in SQL editor)
export const createBagTableSQL = `
-- Create shopping_bags table
CREATE TABLE IF NOT EXISTS shopping_bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
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
`;

// Future function to sync local bag to Supabase
export const syncBagToSupabase = async (
    supabase: any, 
    userId: string, 
    bagItems: { id: string; quantity: number }[]
) => {
    try {
        const supabaseBagItems = bagItems.map(item => ({
            user_id: userId,
            product_id: item.id,
            quantity: item.quantity
        }));

        const { error } = await supabase
            .from('shopping_bags')
            .upsert(supabaseBagItems, { onConflict: 'user_id,product_id' });

        if (error) throw error;
        
        console.log('Bag synced to Supabase successfully');
    } catch (error) {
        console.error('Error syncing bag to Supabase:', error);
    }
};

// Future function to load bag from Supabase
export const loadBagFromSupabase = async (
    supabase: any, 
    userId: string
) => {
    try {
        const { data, error } = await supabase
            .from('shopping_bags')
            .select('product_id, quantity')
            .eq('user_id', userId);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading bag from Supabase:', error);
        return [];
    }
};
