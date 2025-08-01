// Bag persistence utilities using API routes (client-safe)
import { Product } from '@/db/schema';

export interface BagItem extends Product {
    quantity: number;
    addedAt: string;
}

// Function to sync local bag to database via API (client-safe)
export const syncBagToDatabase = async (
    userId: string, 
    bagItems: BagItem[]
) => {
    try {
        const response = await fetch('/api/shopping-bags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                items: bagItems
            })
        });

        if (!response.ok) {
            throw new Error('Failed to sync bag');
        }
        
        console.log('Bag synced to database successfully');
        return await response.json();
    } catch (error) {
        console.error('Error syncing bag to database:', error);
        throw error;
    }
};

// Function to load bag from database via API (client-safe)
export const loadBagFromDatabase = async (
    userId: string
): Promise<BagItem[]> => {
    try {
        const response = await fetch(`/api/shopping-bags?userId=${userId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // No bag found, return empty array
                return [];
            }
            throw new Error('Failed to load bag');
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error loading bag from database:', error);
        return [];
    }
};

// Function to clear bag from database via API (client-safe)
export const clearBagFromDatabase = async (userId: string) => {
    try {
        const response = await fetch('/api/shopping-bags', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Failed to clear bag');
        }
        
        console.log('Bag cleared from database successfully');
        return await response.json();
    } catch (error) {
        console.error('Error clearing bag from database:', error);
        throw error;
    }
};
