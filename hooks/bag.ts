"use client";

import { useContext } from "react";
import { BagContext } from "@/contexts/bag";

export const useBag = () => {
    const context = useContext(BagContext);
    if (!context) {
        throw new Error("useBag must be used within a BagProvider");
    }
    return context;
};
