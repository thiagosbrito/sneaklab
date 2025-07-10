"use client";

import { Product } from "@/utils/models/products";
import { useBag } from "@/hooks/bag";
import { useAuth } from "@/contexts/auth";
import { useLoginDialog } from "@/contexts/loginDialog";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
    const { addToBag, getBagItemQuantity, isInBag } = useBag();
    const { user } = useAuth();
    const { openLoginDialog } = useLoginDialog();
    
    const itemQuantity = getBagItemQuantity(product.id);
    const itemInBag = isInBag(product.id);

    const handleAddToBag = () => {
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Login Necessário',
                text: 'Você precisa estar logado para adicionar items a sua bag',
                confirmButtonText: 'Fazer Login',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#000000',
                cancelButtonColor: '#6b7280',
            }).then((result) => {
                if (result.isConfirmed) {
                    openLoginDialog();
                }
            });
            return;
        }
        addToBag(product);
    };

    const productUrl = `/${product.category}/${product.id}`;

    return (
        <div className="relative flex flex-col rounded-xl shadow-lg bg-white dark:bg-gray-900 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            {/* Product Image - Clickable */}
            <Link href={productUrl} className="relative w-full h-64 block">
                <div className="relative w-full h-full">
                    {product.imageUrl && product.imageUrl.length > 0 ? (
                        <Image
                            src={product.imageUrl[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-t-xl">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}
                    
                    {/* Bag indicator */}
                    {itemInBag && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {itemQuantity} in bag
                        </div>
                    )}

                    {/* Brand indicator */}
                    {product.brandName && (
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                            {product.brandName}
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Details */}
            <div className="p-4 flex flex-col justify-between min-h-[150px]">
                {/* Product Name - Clickable */}
                <Link href={productUrl} className="block">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-purple-600 transition-colors">
                        {product.name}
                    </h2>
                </Link>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            €{product.price}
                        </span>
                        {product.promoPrice && product.promoPrice < product.price && (
                            <span className="text-sm text-gray-500 line-through">
                                €{product.promoPrice}
                            </span>
                        )}
                    </div>
                    
                    <button 
                        className={`flex items-center justify-center w-10 h-10 text-white rounded-full transition ${
                            !user 
                                ? 'bg-gray-500 hover:bg-gray-600'
                                : itemInBag 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-black hover:bg-gray-800'
                        }`}
                        onClick={handleAddToBag}
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
                </div>
            </div>
        </div>
    );
}