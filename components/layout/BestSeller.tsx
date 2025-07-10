"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { Product } from '@/utils/models/products';
import { useBestsellers } from '@/hooks/useBestsellers';
import { useBag } from '@/hooks/bag';
import Image from 'next/image';
import AddToBagButton from '@/components/ui/AddToBagButton';

interface BestSellerProps {
  limit?: number;
}

export default function BestSeller({ limit = 20 }: BestSellerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { bestsellers, loading, error, refetch } = useBestsellers(limit);
  
  const itemsPerView = 4; // Number of items visible at once
  const maxIndex = Math.max(0, bestsellers.length - itemsPerView);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || bestsellers.length === 0) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / bestsellers.length;
    
    if (direction === 'left' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      container.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    } else if (direction === 'right' && currentIndex < maxIndex) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      container.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const totalDots = Math.ceil(bestsellers.length / itemsPerView);
  const currentDot = Math.floor(currentIndex / itemsPerView);

  // Show loading state
  if (loading) {
    return (
      <section className="bg-purple-900 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                Best Sellers
              </h2>
              <p className="text-purple-200">Loading the most popular items...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="bg-purple-900 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                Best Sellers
              </h2>
              <p className="text-purple-200">Unable to load bestsellers at the moment.</p>
            </div>
            <button 
              onClick={refetch}
              className="px-6 py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors"
            >
              Try Again
            </button>
          </div>
          <div className="text-center py-20">
            <p className="text-white/70 mb-4">Error: {error}</p>
            <button 
              onClick={refetch}
              className="px-6 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Don't render anything if no bestsellers (better UX)
  if (bestsellers.length === 0) {
    return null;
  }

  return (
    <section className="bg-purple-900 px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Best Sellers
            </h2>
            <p className="text-purple-200">Our top {bestsellers.length} most popular items based on sales.</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm mb-2">{bestsellers.length} products</p>
            <button className="px-6 py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors">
              View All
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestsellers.map((product) => (
              <div 
                key={product.id} 
                className="flex-none w-72 relative"
              >
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-purple-900 font-bold text-sm px-2 py-1 rounded-full">
                  #{product.rank}
                </div>
                
                {/* Sales Badge */}
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white font-bold text-xs px-2 py-1 rounded-full">
                  {product.total_quantity_sold} sold
                </div>

                <div className="bg-gray-200 rounded-2xl p-6 h-80 flex items-center justify-center mb-4 relative overflow-hidden">
                  {product.imageUrl && product.imageUrl.length > 0 ? (
                    <Image
                      src={product.imageUrl[0]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-400 rounded flex items-center justify-center">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className="text-gray-600"
                      >
                        <path 
                          d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                        <path 
                          d="M21 15L16 10L5 21" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-purple-200 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-lg">€{product.price}</p>
                    <p className="text-green-400 text-sm">€{product.total_revenue.toFixed(0)} total</p>
                  </div>
                  
                  {/* Add to Bag Button */}
                  <div className="flex justify-center">
                    <AddToBagButton 
                      product={{
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        brandID: product.brandID,
                        category: product.category,
                        isAvailable: product.isAvailable,
                        price: product.price,
                        categoryID: product.categoryID,
                        created_at: product.created_at
                      }}
                      showText={true}
                      className="w-full justify-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation and Pagination */}
        <div className="flex justify-between items-center mt-8">
          {/* Pagination Dots */}
          <div className="flex gap-2">
            {Array.from({ length: totalDots }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentDot 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
                onClick={() => {
                  const newIndex = index * itemsPerView;
                  setCurrentIndex(Math.min(newIndex, maxIndex));
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: newIndex * (scrollContainerRef.current.scrollWidth / bestsellers.length),
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => scroll('left')}
              className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}