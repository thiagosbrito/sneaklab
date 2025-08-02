"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBag } from "@/contexts/bag";
import { useAuth } from "@/contexts/auth";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useCreateOrder } from "@/hooks/queries/useOrders";
import { CreateOrderData } from "@/utils/orders";

interface BagSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const BagSidebar: React.FC<BagSidebarProps> = ({ isOpen, onClose }) => {
    const { bag, updateQuantity, removeFromBag, clearBag, totalItems, totalPrice } = useBag();
    const { user } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    
    // React Query mutation for creating orders
    const createOrderMutation = useCreateOrder();

    const handleCreateOrder = () => {
        if (!user || bag.length === 0 || createOrderMutation.isPending) return;

        // Transform bag items to order format
        const orderData: CreateOrderData = {
            items: bag.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                base_price: parseFloat(item.price?.replace(/[^0-9.-]+/g, "") || "0"),
                customization_details: {
                    notes: "Standard order from bag",
                    special_instructions: ""
                },
                customization_fee: 0
            })),
            notes: `Order created from shopping bag with ${totalItems} items`
        };

        // Use React Query mutation
        createOrderMutation.mutate(orderData);
    };

    // Handle successful order creation
    useEffect(() => {
        if (createOrderMutation.isSuccess) {
            // Clear the bag and show success message
            clearBag(true); // isOrderCompletion = true
            setShowSuccess(true);
            
            // Auto close after 3 seconds
            const timer = setTimeout(() => {
                setShowSuccess(false);
                onClose();
                createOrderMutation.reset(); // Reset mutation state
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [createOrderMutation.isSuccess]);

    // Handle error
    useEffect(() => {
        if (createOrderMutation.isError) {
            console.error('Error creating order:', createOrderMutation.error);
            alert('Erro ao criar pedido. Tente novamente.');
        }
    }, [createOrderMutation.isError]);

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
                            Shopping Bag ({totalItems} ite{totalItems > 1 ? 'ns' : 'm'})
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
                                            src={item.imageURL?.[0] ?? ''}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                R$ {item.price}
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
                            {showSuccess ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                                        Pedido Criado!
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Seu pedido foi criado com sucesso. Nossa equipe entrará em contato via WhatsApp.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Total: R$ {totalPrice.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => clearBag()}
                                            className="text-sm text-red-500 hover:text-red-700"
                                            disabled={createOrderMutation.isPending}
                                        >
                                            Limpar Bag
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={handleCreateOrder}
                                        disabled={createOrderMutation.isPending || bag.length === 0}
                                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {createOrderMutation.isPending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Criando Pedido...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                Fechar Pedido
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BagSidebar;
