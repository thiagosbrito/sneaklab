"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/utils/models/products';
import Image from 'next/image';

interface BestSellerProps {
  products?: Product[];
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_001_225x225.jpeg'],
    brandID: 'brand1',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  },
  {
    id: '2',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_002_140x960.jpeg'],
    brandID: 'brand2',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  },
  {
    id: '3',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_003_1200x1101.jpeg'],
    brandID: 'brand3',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  },
  {
    id: '4',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_001_225x225.jpeg'],
    brandID: 'brand4',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  },
  {
    id: '5',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_002_140x960.jpeg'],
    brandID: 'brand5',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  },
  {
    id: '6',
    name: 'Product name',
    description: 'Variant',
    imageUrl: ['/public/brands/samples/shoes_003_1200x1101.jpeg'],
    brandID: 'brand6',
    category: 'sneakers',
    isAvailable: true,
    price: 55
  }
];

export default function BestSeller({ products = mockProducts }: BestSellerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const itemsPerView = 4; // Number of items visible at once
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / products.length;
    
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

  const totalDots = Math.ceil(products.length / itemsPerView);
  const currentDot = Math.floor(currentIndex / itemsPerView);

  return (
    <section className="bg-purple-900 px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Best Sellers</h2>
            <p className="text-purple-200">Stay updated on the latest streetwear trends.</p>
          </div>
          <button className="px-6 py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors">
            View all
          </button>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-none w-72"
              >
                <div className="bg-gray-200 rounded-2xl p-6 h-80 flex items-center justify-center mb-4">
                  {/* Placeholder for product image */}
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
                </div>
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-purple-200 text-sm mb-2">{product.description}</p>
                  <p className="text-white font-bold text-lg">${product.price}</p>
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
                    const container = scrollContainerRef.current;
                    const itemWidth = container.scrollWidth / products.length;
                    container.scrollTo({
                      left: newIndex * itemWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="p-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex >= maxIndex}
              className="p-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}