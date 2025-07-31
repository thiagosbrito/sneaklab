"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Product } from "@/utils/models/products";
import { useAuth } from "@/contexts/auth";
import useSupabaseBrowser from "@/utils/supabase/client";
import { syncBagToSupabase, loadBagFromSupabase } from "@/utils/bag-sync";

interface BagItem extends Product {
    quantity: number;
    addedAt: string;
}

interface BagContextType {
    bag: BagItem[];
    addToBag: (product: Product, quantity?: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromBag: (productId: string) => void;
    clearBag: () => void;
    isLoading: boolean;
    totalItems: number;
    totalPrice: number;
}

export const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bag, setBag] = useState<BagItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const { user } = useAuth();
    const supabase = useSupabaseBrowser();

    // Reset initialization when user changes (login/logout/switch users)
    useEffect(() => {
        setIsInitialized(false);
    }, [user?.id]);

    // Load bag from localStorage on mount, then sync with Supabase if authenticated
    useEffect(() => {
        const loadInitialBag = async () => {
            setIsLoading(true);
            try {
                if (user) {
                    // For authenticated users, use user-specific localStorage key
                    const userBagKey = `sneaklab-shopping-bag-${user.id}`;
                    const savedBag = localStorage.getItem(userBagKey);
                    const localBag = savedBag ? JSON.parse(savedBag) : [];
                    setBag(localBag);

                    try {
                        const supabaseBag = await loadBagFromSupabase(supabase, user.id);
                        
                        if (supabaseBag.length > 0 && localBag.length === 0) {
                            // User has a bag in Supabase but not locally, use Supabase data
                            setBag(supabaseBag);
                            localStorage.setItem(userBagKey, JSON.stringify(supabaseBag));
                        } else if (localBag.length > 0) {
                            // User has local bag, sync it to Supabase
                            await syncBagToSupabase(supabase, user.id, localBag);
                        }
                    } catch (supabaseError) {
                        console.log('Supabase sync failed, continuing with localStorage:', supabaseError);
                        // Continue with localStorage data, Supabase is just backup
                    }
                } else {
                    // For unauthenticated users, use anonymous bag (clear it when they log out)
                    setBag([]);
                }
            } catch (error) {
                console.error('Error loading bag:', error);
                setBag([]);
            }
            setIsLoading(false);
            setIsInitialized(true);
        };

        if (!isInitialized) {
            loadInitialBag();
        }
    }, [user, supabase, isInitialized]);

    // Save bag to localStorage and sync to Supabase whenever it changes (but not during initial load)
    useEffect(() => {
        if (!isInitialized) return; // Don't sync during initial load
        
        try {
            if (user) {
                // Save to user-specific localStorage key
                const userBagKey = `sneaklab-shopping-bag-${user.id}`;
                localStorage.setItem(userBagKey, JSON.stringify(bag));
                
                // Sync to Supabase if user is authenticated
                syncBagToSupabase(supabase, user.id, bag);
            }
            // Don't save anonymous bags to localStorage
        } catch (error) {
            console.error('Error saving bag:', error);
        }
    }, [bag, user, supabase, isInitialized]);

    const addToBag = (product: Product, quantity = 1) => {
        setBag((prevBag) => {
            const existingItem = prevBag.find(item => item.id === product.id);
            
            if (existingItem) {
                return prevBag.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            
            return [...prevBag, { 
                ...product, 
                quantity, 
                addedAt: new Date().toISOString() 
            }];
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromBag(productId);
            return;
        }
        
        setBag(prevBag =>
            prevBag.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromBag = (productId: string) => {
        setBag(prevBag => prevBag.filter(item => item.id !== productId));
    };

    const clearBag = () => {
        setBag([]);
    };

    const totalItems = bag.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = bag.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <BagContext.Provider value={{ 
            bag, 
            addToBag, 
            updateQuantity, 
            removeFromBag, 
            clearBag, 
            isLoading,
            totalItems,
            totalPrice
        }}>
            {children}
        </BagContext.Provider>
    );
};