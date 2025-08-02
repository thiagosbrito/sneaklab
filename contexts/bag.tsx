"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useBagQuery, useSyncBag, useClearBag } from "@/hooks/queries/useBag";
import { Product } from "@/db/schema";

interface BagItemWithProduct extends Product {
    quantity: number;
    addedAt: string;
}

interface BagContextType {
    bag: BagItemWithProduct[];
    addToBag: (product: Product, quantity?: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromBag: (productId: string) => void;
    clearBag: (isOrderCompletion?: boolean) => void;
    getBagItemQuantity: (productId: string) => number;
    isInBag: (productId: string) => boolean;
    isLoading: boolean;
    totalItems: number;
    totalPrice: number;
}

export const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    
    // React Query hooks
    const { data: bagData = [], isLoading } = useBagQuery(!!user);
    const syncBagMutation = useSyncBag();
    const clearBagMutation = useClearBag();

    // Helper function to transform bag data
    const transformBagData = useCallback((data: any[]): BagItemWithProduct[] => 
        data.map(item => ({
            ...item,
            // Add default product properties if missing
            name: item.name || 'Unknown Product',
            price: item.price || '0',
            description: item.description || '',
            imageURL: item.imageURL || [],
            isAvailable: item.isAvailable ?? true,
            categoryID: item.categoryID || '',
            brandID: item.brandID || '',
            promoPrice: item.promoPrice || null,
            createdAt: item.createdAt || new Date(),
        } as BagItemWithProduct))
    , []);

    // Memoized bag data transformation
    const bag: BagItemWithProduct[] = useMemo(() => transformBagData(bagData), [bagData, transformBagData]);

    // Event-driven mutation functions (never called during render)
    const addToBag = useCallback((product: Product, quantity = 1) => {
        if (!user) return;
        
        const currentBag = transformBagData(bagData);
        const existingItem = currentBag.find(item => item.id === product.id);
        
        let newBag: BagItemWithProduct[];
        if (existingItem) {
            newBag = currentBag.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            newBag = [...currentBag, { 
                ...product, 
                quantity, 
                addedAt: new Date().toISOString() 
            }];
        }
        
        // Transform to server format and sync
        const bagItems = newBag.map(item => ({
            id: item.id,
            quantity: item.quantity,
            addedAt: item.addedAt,
            name: item.name,
            price: item.price,
            imageURL: item.imageURL,
            isAvailable: item.isAvailable,
            categoryID: item.categoryID,
            brandID: item.brandID,
            description: item.description,
            promoPrice: item.promoPrice,
            createdAt: item.createdAt,
        }));

        syncBagMutation.mutate(bagItems);
    }, [user, bagData, transformBagData, syncBagMutation]);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (!user) return;
        
        const currentBag = transformBagData(bagData);
        
        let newBag: BagItemWithProduct[];
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            newBag = currentBag.filter(item => item.id !== productId);
        } else {
            // Update quantity
            newBag = currentBag.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        }
        
        // Transform to server format and sync
        const bagItems = newBag.map(item => ({
            id: item.id,
            quantity: item.quantity,
            addedAt: item.addedAt,
            name: item.name,
            price: item.price,
            imageURL: item.imageURL,
            isAvailable: item.isAvailable,
            categoryID: item.categoryID,
            brandID: item.brandID,
            description: item.description,
            promoPrice: item.promoPrice,
            createdAt: item.createdAt,
        }));

        syncBagMutation.mutate(bagItems);
    }, [user, bagData, transformBagData, syncBagMutation]);

    const removeFromBag = useCallback((productId: string) => {
        if (!user) return;
        
        const currentBag = transformBagData(bagData);
        const newBag = currentBag.filter(item => item.id !== productId);
        
        // Transform to server format and sync
        const bagItems = newBag.map(item => ({
            id: item.id,
            quantity: item.quantity,
            addedAt: item.addedAt,
            name: item.name,
            price: item.price,
            imageURL: item.imageURL,
            isAvailable: item.isAvailable,
            categoryID: item.categoryID,
            brandID: item.brandID,
            description: item.description,
            promoPrice: item.promoPrice,
            createdAt: item.createdAt,
        }));

        syncBagMutation.mutate(bagItems);
    }, [user, bagData, transformBagData, syncBagMutation]);

    const clearBag = useCallback((isOrderCompletion = false) => {
        if (!user) return;
        
        if (isOrderCompletion) {
            // Use the clear bag mutation for order completion
            clearBagMutation.mutate();
        } else {
            // Use sync with empty array for manual clear
            syncBagMutation.mutate([]);
        }
    }, [user, syncBagMutation, clearBagMutation]);

    // Memoized calculated values
    const parsedPrice = useCallback((item: string): number => {
        if (item === '') return 0;
        return parseFloat(item.replace(/[^0-9.-]+/g, ""));
    }, []);

    const totalItems = useMemo(() => 
        bag.reduce((total, item) => total + item.quantity, 0)
    , [bag]);
    
    const totalPrice = useMemo(() => 
        bag.reduce((total, item) => total + (parsedPrice(item.price ?? '') * item.quantity), 0)
    , [bag, parsedPrice]);

    // Helper functions
    const getBagItemQuantity = useCallback((productId: string) => {
        const item = bagData.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }, [bagData]);

    const isInBag = useCallback((productId: string) => {
        return bagData.some(item => item.id === productId);
    }, [bagData]);

    const contextValue = useMemo(() => ({
        bag, 
        addToBag, 
        updateQuantity, 
        removeFromBag, 
        clearBag, 
        getBagItemQuantity,
        isInBag,
        isLoading: isLoading || syncBagMutation.isPending || clearBagMutation.isPending,
        totalItems,
        totalPrice
    }), [
        bag, 
        addToBag, 
        updateQuantity, 
        removeFromBag, 
        clearBag, 
        getBagItemQuantity,
        isInBag,
        isLoading, 
        syncBagMutation.isPending, 
        clearBagMutation.isPending,
        totalItems,
        totalPrice
    ]);

    return (
        <BagContext.Provider value={contextValue}>
            {children}
        </BagContext.Provider>
    );
};

export const useBag = () => {
    const context = useContext(BagContext);
    if (context === undefined) {
        throw new Error('useBag must be used within a BagProvider');
    }
    return context;
};