"use client";

import React from "react";
import { Product } from "@/utils/models/products";
import { useBag } from "@/hooks/bag";
import { useAuth } from "@/contexts/auth";

interface AddToBagButtonProps {
    product: Product;
    quantity?: number;
    className?: string;
    showText?: boolean;
}

const AddToBagButton: React.FC<AddToBagButtonProps> = ({ 
    product, 
    quantity = 1, 
    className = "",
    showText = false 
}) => {
    const { addToBag, isInBag, getBagItemQuantity } = useBag();
    const { user } = useAuth();
    
    const itemInBag = isInBag(product.id);
    const bagQuantity = getBagItemQuantity(product.id);

    const handleAddToBag = () => {
        if (!user) {
            // Could show a toast notification here
            alert('Please sign in to add items to your bag');
            return;
        }
        addToBag(product, quantity);
    };

    if (showText) {
        return (
            <button 
                onClick={handleAddToBag}
                className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 ${className}`}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2" 
                    stroke="currentColor" 
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {user ? (
                    itemInBag ? `Add Another (${bagQuantity} in bag)` : 'Add to Bag'
                ) : (
                    'Sign in to Add'
                )}
            </button>
        );
    }

    return (
        <button 
            onClick={handleAddToBag}
            className={`flex items-center justify-center w-10 h-10 text-white rounded-full transition ${
                !user 
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : itemInBag 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-black hover:bg-gray-800'
            } ${className}`}
            title={
                !user 
                    ? 'Sign in to add to bag'
                    : itemInBag 
                        ? `Add another ${product.name}` 
                        : `Add ${product.name} to bag`
            }
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                className="w-6 h-6"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    );
};

export default AddToBagButton;
