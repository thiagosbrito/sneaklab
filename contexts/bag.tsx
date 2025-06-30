"use client";

import React, { createContext, useState, useContext } from "react";
import { Product } from "@/utils/models/products";

interface BagContextType {
    bag: Product[];
    addToBag: (product: Product) => void;
}

export const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bag, setBag] = useState<Product[]>([]);

    const addToBag = (product: Product) => {
        setBag((prevBag) => [...prevBag, product]);
    };

    return (
        <BagContext.Provider value={{ bag, addToBag }}>
            {children}
        </BagContext.Provider>
    );
};