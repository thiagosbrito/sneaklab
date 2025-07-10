"use client";

import { useState, use, useEffect } from "react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Badge, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import AddToBagButton from "@/components/ui/AddToBagButton";
import ProductImageCarousel from "@/components/ui/ProductImageCarousel";
import SizeSelector from "@/components/ui/SizeSelector";
import QuantitySelector from "@/components/ui/QuantitySelector";
import ProductCard from "@/components/layout/ProductCard";

export default function ProductPage({ params }: { params: Promise<{ slug: string, category: string }> }) {
    const { slug, category } = use(params);
    const { product, loading, error } = useProduct(slug);
    const { toggleWishlist, checkIsInWishlist } = useWishlist();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    
    // Fetch related products
    const { products: relatedProducts } = useProducts({
        category: category,
        limit: 4,
        sortBy: 'created_at',
        sortOrder: 'desc'
    });

    // Check if product is in wishlist when product loads
    useEffect(() => {
        if (product) {
            checkIsInWishlist(product.id).then(setIsWishlisted);
        }
    }, [product, checkIsInWishlist]);

    if (loading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Product...</h2>
                    <p className="text-gray-500">Getting the latest details for you</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">
                        {error || "The product you're looking for doesn't exist or is no longer available."}
                    </p>
                    <Link 
                        href={`/${category}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {category}
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToBag = () => {
        // Custom add to bag handler with quantity and size
        console.log('Adding to bag:', { product, quantity, selectedSize });
    };

    const handleToggleWishlist = async () => {
        if (!product) return;
        
        setWishlistLoading(true);
        const success = await toggleWishlist(product.id);
        
        if (success) {
            setIsWishlisted(!isWishlisted);
        }
        
        setWishlistLoading(false);
    };

    const shareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description || '',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={`/${category}`} className="hover:text-gray-700 capitalize transition-colors">{category}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </div>
                </nav>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                        {/* Product Images - Takes up 7/12 columns for more space */}
                        <div className="lg:col-span-7 p-6 lg:p-8">
                            <ProductImageCarousel 
                                images={product.imageUrl || []} 
                                productName={product.name}
                            />
                        </div>

                        {/* Product Details - Takes up 5/12 columns for focused content */}
                        <div className="lg:col-span-5 p-6 lg:p-8 bg-gray-50/50">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        {product.brandName && (
                                            <p className="text-purple-600 font-medium text-sm uppercase tracking-wide mb-2">
                                                {product.brandName}
                                            </p>
                                        )}
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                            {product.name}
                                        </h1>
                                        {product.categoryName && (
                                            <p className="text-gray-600 text-sm">
                                                {product.categoryName}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleToggleWishlist}
                                            disabled={wishlistLoading}
                                            className={`p-3 rounded-full transition-all ${
                                                isWishlisted 
                                                    ? 'bg-red-100 text-red-600' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={isWishlisted ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
                                        >
                                            {wishlistLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                            )}
                                        </button>
                                        <button
                                            onClick={shareProduct}
                                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-6">
                                    <span className="text-4xl font-bold text-gray-900">€{product.price}</span>
                                    {product.promoPrice && product.promoPrice < product.price && (
                                        <>
                                            <span className="text-2xl text-gray-500 line-through">€{product.promoPrice}</span>
                                            <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                                                Save €{(product.price - product.promoPrice).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2 mb-6">
                                    {product.isAvailable ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="text-green-700 font-medium">In Stock</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <span className="text-red-700 font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <SizeSelector 
                                    selectedSize={selectedSize}
                                    onSizeChange={setSelectedSize}
                                />
                            </div>

                            {/* Quantity Selection */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantidade</h3>
                                <QuantitySelector 
                                    value={quantity}
                                    onChange={setQuantity}
                                    max={10}
                                />
                            </div>

                            {/* Add to Bag */}
                            <div className="mb-8">
                                <AddToBagButton 
                                    product={{...product, quantity}}
                                    showText={true}
                                    className="w-full justify-center py-4 text-lg font-semibold"
                                />
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Truck className="w-5 h-5 text-green-600" />
                                    <span>Entrega grátis em pedidos acima de €100</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <RotateCcw className="w-5 h-5 text-blue-600" />
                                    <span>Política de devolução de 30 dias</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                    <span>Produtos autênticos garantidos</span>
                                </div>
                            </div>

                            {/* Product Description */}
                            {product.description && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                            Produtos Relacionados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts
                                .filter(p => p.id !== product.id)
                                .slice(0, 4)
                                .map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to category */}
                <div className="mt-12 pt-8 border-t">
                    <Link 
                        href={`/${category}`}
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para {category}
                    </Link>
                </div>
            </div>
        </div>
    );
}