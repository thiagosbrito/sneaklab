"use client";

import React from "react";
import { useBag } from "@/hooks/bag";
import { useAuth } from "@/contexts/auth";
import { X, Plus, Minus, Trash2 } from "lucide-react";

interface BagSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const BagSidebar: React.FC<BagSidebarProps> = ({ isOpen, onClose }) => {
    const { bag, updateQuantity, removeFromBag, clearBag, totalItems, totalPrice } = useBag();
    const { user } = useAuth();

    if (!isOpen) return null;

    // If user is not authenticated, don't show the bag sidebar
    if (!user) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Sidebar */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Shopping Bag ({totalItems} items)
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Bag Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {bag.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                                <p>Your bag is empty</p>
                                <p className="text-sm mt-2">Add some sneakers to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bag.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex gap-4 p-3 border dark:border-gray-700 rounded-lg"
                                    >
                                        <img
                                            src={item.imageUrl[0]}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ${item.price}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    onClick={() => removeFromBag(item.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {bag.length > 0 && (
                        <div className="border-t dark:border-gray-700 p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Total: ${totalPrice.toFixed(2)}
                                </span>
                                <button
                                    onClick={clearBag}
                                    className="text-sm text-red-500 hover:text-red-700"
                                >
                                    Clear All
                                </button>
                            </div>
                            
                            <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
                                Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BagSidebar;
