"use client";

import { use } from "react";
import ProductCard from "@/components/layout/ProductCard";
import PageContainer from "@/components/ui/PageContainer";
import { useProducts } from "@/hooks/useProducts";
import { Loader2, AlertCircle } from "lucide-react";

const Page = ({ params }: { params: Promise<{ category: string }> }) => {
    const { category } = use(params);
    const { products, loading, error, pagination } = useProducts({ 
        category: category,
        limit: 24,
        sortBy: 'created_at',
        sortOrder: 'desc'
    });

    if (loading) {
        return (
            <PageContainer>
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading {category}...</h2>
                        <p className="text-gray-500">Fetching the latest products for you</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Products</h2>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (products.length === 0) {
        return (
            <PageContainer
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: category, current: true }
                ]}
                title={`No ${category} Found`}
                description="We don't have any products in this category yet. Check back soon for new arrivals!"
            >
                <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <p>Check back soon for new arrivals!</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: category, current: true }
            ]}
            title={products[0]?.categoryName || category}
            description={`Discover our collection of ${pagination.totalCount} amazing ${category} products`}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />   
                ))}
            </div>

            {pagination.totalPages > 1 && (
                <div className="text-center text-gray-500">
                    <p>Showing {products.length} of {pagination.totalCount} products</p>
                    <p className="text-sm mt-1">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                </div>
            )}
        </PageContainer>
    );
}

export default Page;

// 