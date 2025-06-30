"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Product } from "@/utils/models/products";

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

    // Load bag from localStorage on mount
    useEffect(() => {
        try {
            const savedBag = localStorage.getItem('sneaklab-shopping-bag');
            if (savedBag) {
                setBag(JSON.parse(savedBag));
            }
        } catch (error) {
            console.error('Error loading bag from localStorage:', error);
        }
    }, []);

    // Save bag to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('sneaklab-shopping-bag', JSON.stringify(bag));
        } catch (error) {
            console.error('Error saving bag to localStorage:', error);
        }
    }, [bag]);

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