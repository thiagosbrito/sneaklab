"use client";

import { useContext } from "react";
import { BagContext } from "@/contexts/bag";

export const useBag = () => {
    const context = useContext(BagContext);
    if (!context) {
        throw new Error("useBag must be used within a BagProvider");
    }
    
    const getBagItemQuantity = (productId: string) => {
        const item = context.bag.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const isInBag = (productId: string) => {
        return context.bag.some(item => item.id === productId);
    };

    return {
        ...context,
        getBagItemQuantity,
        isInBag
    };
};
