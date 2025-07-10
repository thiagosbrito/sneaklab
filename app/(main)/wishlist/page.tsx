"use client";

import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/auth';
import { useLoginDialog } from '@/contexts/loginDialog';
import ProductCard from '@/components/layout/ProductCard';
import PageContainer from '@/components/ui/PageContainer';
import { Loader2, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { user } = useAuth();
  const { openLoginDialog } = useLoginDialog();
  const { wishlist, loading, error, wishlistCount } = useWishlist();

  useEffect(() => {
    if (!user) {
      openLoginDialog();
    }
  }, [user, openLoginDialog]);

  if (!user) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist', current: true }
        ]}
        title="My Wishlist"
        description="Access required to view your wishlist"
      >
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Acesso Necessário</h2>
            <p className="text-gray-500 mb-6">
              Você precisa estar logado para ver sua lista de desejos
            </p>
            <button
              onClick={openLoginDialog}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist', current: true }
        ]}
        title="My Wishlist"
        description="Loading your favorite products..."
      >
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando Wishlist...</h2>
            <p className="text-gray-500">Buscando seus produtos favoritos</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist', current: true }
        ]}
        title="My Wishlist"
        description="Error loading your wishlist"
      >
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Erro ao Carregar</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Wishlist', current: true }
      ]}
      title="Minha Lista de Desejos"
      description={
        wishlistCount === 0 
          ? 'Sua lista de desejos está vazia' 
          : `${wishlistCount} ${wishlistCount === 1 ? 'produto' : 'produtos'} na sua lista de desejos`
      }
    >

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Sua wishlist está vazia</h2>
            <p className="text-gray-500 mb-6">
              Adicione produtos que você gosta à sua lista de desejos para encontrá-los facilmente mais tarde
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Continuar Comprando
            </Link>
          </div>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            item.product && (
              <div key={item.id} className="relative">
                <ProductCard product={item.product} />
                {/* Optional: Add remove from wishlist overlay button */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Continue Shopping */}
      {wishlist.length > 0 && (
        <div className="mt-12 pt-8 border-t text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            Continuar Comprando
          </Link>
        </div>
      )}
    </PageContainer>
  );
}