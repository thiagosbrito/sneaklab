"use client";

import React, { createContext, useContext, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { useBagQuery, useSyncBag, useClearBag } from "@/hooks/queries/useBag";
import { Product } from "@/db/schema";
import { BagItem } from "@/lib/actions/bag-actions";

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
    
    // Debounced sync for rapid operations
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastBagStateRef = useRef<BagItem[]>([]);

    // Helper function to transform bag data - now properly typed
    const transformBagData = useCallback((data: BagItem[]): BagItemWithProduct[] => 
        data.map(item => ({ ...item } as BagItemWithProduct))
    , []);

    // Helper to convert BagItemWithProduct to BagItem for API calls
    const toBagItem = useCallback((item: BagItemWithProduct): BagItem => ({
        id: item.id,
        quantity: item.quantity,
        addedAt: item.addedAt,
        name: item.name,
        price: item.price ?? '0',
        imageURL: item.imageURL ?? [],
        isAvailable: item.isAvailable,
        categoryID: item.categoryID,
        brandID: item.brandID,
        description: item.description,
        promoPrice: item.promoPrice,
        createdAt: item.createdAt,
    }), []);

    // Memoized bag data transformation
    const bag: BagItemWithProduct[] = useMemo(() => transformBagData(bagData), [bagData, transformBagData]);

    // Event-driven mutation functions with optimistic updates
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
        
        // Convert to BagItem format for API
        const optimisticBagItems: BagItem[] = newBag.map(toBagItem);

        // Update cache immediately for instant UI response
        syncBagMutation.mutate(optimisticBagItems);
    }, [user, bagData, transformBagData, syncBagMutation, toBagItem]);

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
        
        // Convert to BagItem format for API
        const optimisticBagItems: BagItem[] = newBag.map(toBagItem);

        syncBagMutation.mutate(optimisticBagItems);
    }, [user, bagData, transformBagData, syncBagMutation, toBagItem]);

    const removeFromBag = useCallback((productId: string) => {
        if (!user) return;
        
        const currentBag = transformBagData(bagData);
        const newBag = currentBag.filter(item => item.id !== productId);
        
        // Convert to BagItem format for API
        const optimisticBagItems: BagItem[] = newBag.map(toBagItem);

        syncBagMutation.mutate(optimisticBagItems);
    }, [user, bagData, transformBagData, syncBagMutation, toBagItem]);

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

    // Optimized helper functions with memoized bag lookup
    const bagLookupMap = useMemo(() => {
        const map = new Map();
        bagData.forEach(item => {
            map.set(item.id, item);
        });
        return map;
    }, [bagData]);

    const getBagItemQuantity = useCallback((productId: string) => {
        const item = bagLookupMap.get(productId);
        return item ? item.quantity : 0;
    }, [bagLookupMap]);

    const isInBag = useCallback((productId: string) => {
        return bagLookupMap.has(productId);
    }, [bagLookupMap]);

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