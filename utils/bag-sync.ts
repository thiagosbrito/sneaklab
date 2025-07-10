// Future Supabase integration utilities for bag persistence
// This can be used later when implementing user authentication

import { Database } from "@/utils/supabase/database.types";

export type BagItem = {
    id: string;
    quantity: number;
    addedAt: string;
    [key: string]: any; // Allow for full product properties
};

// Function to sync local bag to Supabase (ONE bag per user)
export const syncBagToSupabase = async (
    supabase: any, 
    userId: string, 
    bagItems: any[]
) => {
    try {
        // Simply upsert the entire bag as a JSON array
        const { error } = await supabase
            .from('shopping_bags')
            .upsert(
                {
                    user_id: userId,
                    items: bagItems
                },
                { onConflict: 'user_id' }
            );

        if (error) throw error;
        
        console.log('Bag synced to Supabase successfully');
    } catch (error) {
        console.error('Error syncing bag to Supabase:', error);
    }
};

// Function to load bag from Supabase (ONE bag per user)
export const loadBagFromSupabase = async (
    supabase: any, 
    userId: string
) => {
    try {
        const { data, error } = await supabase
            .from('shopping_bags')
            .select('items')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No bag found, return empty array
                return [];
            }
            throw error;
        }
        
        return data?.items || [];
    } catch (error) {
        console.error('Error loading bag from Supabase:', error);
        return [];
    }
};
