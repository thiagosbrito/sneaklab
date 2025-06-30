"use client";

import { Product } from "@/utils/models/products";
import { useBag } from "@/hooks/bag";

export default function ProductCard({ product }: { product: Product }) {
    const { addToBag } = useBag();

    return (
        <div className="relative flex flex-col rounded-xl shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
            <div className="relative w-full h-64">
                <img 
                    src={product.imageUrl[0]} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover rounded-t-xl" 
                />
            </div>
            <div className="p-4 flex flex-col justify-between min-h-[150px]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                    <button 
                        className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        onClick={() => addToBag(product)}
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
                </div>
            </div>
        </div>
    );
}