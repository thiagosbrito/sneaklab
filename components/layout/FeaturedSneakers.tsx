"use client";

import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/layout/ProductCard";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FeaturedSneakers() {
    const { products, loading, error } = useProducts({ 
        limit: 8,
        sortBy: 'created_at',
        sortOrder: 'desc',
        available: true
    });

    return (
        <div className="flex flex-col gap-y-6 py-20">
            <div className="flex flex-col">
                <h1 className="text-4xl font-bold text-center flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                    Lançamentos e Novidades
                </h1>
                <p className="mt-4 text-lg text-center">Confira os últimos lançamentos e novidades disponíveis na loja.</p>
            </div>
            <div className="divider"></div>
            
            <div className="container w-12/12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                            <p className="text-gray-600">Carregando novidades...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 mb-4">Erro ao carregar produtos: {error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 mb-4">Nenhum produto encontrado no momento.</p>
                        <p className="text-gray-500">Volte em breve para ver nossos lançamentos!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        
                        {/* View all products link */}
                        <div className="text-center mt-12">
                            <Link 
                                href="/products"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-lg font-medium"
                            >
                                Ver todos os produtos
                                <Sparkles className="w-5 h-5" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}