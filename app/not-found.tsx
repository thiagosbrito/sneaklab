"use client";

import Link from 'next/link';
import { Home, ShoppingBag, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 with Sneaker */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text animate-pulse">
            404
          </div>
          
          {/* Sneaker floating animation */}
          <div className="absolute -top-4 -right-8 text-4xl animate-bounce">
            👟
          </div>
          
          {/* Sparkles */}
          <div className="absolute top-0 left-0 text-yellow-400 animate-ping">✨</div>
          <div className="absolute bottom-0 right-0 text-yellow-400 animate-ping delay-75">✨</div>
          <div className="absolute top-1/2 left-8 text-yellow-400 animate-ping delay-150">✨</div>
        </div>

        {/* Funny Messages */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Oops! This Page Ran Away! 🏃‍♂️
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Looks like this page is as elusive as limited edition sneakers...
          </p>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
              Don't worry, even the best sneakerheads take wrong turns sometimes! 
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p>🔍 <strong>What happened?</strong> This page doesn't exist (or it's hiding better than Off-White drops)</p>
              <p>🎯 <strong>What to do?</strong> Let's get you back to the good stuff!</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sneakers"
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Sneakers
            </Link>
            
            <Link 
              href="/marcas"
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Explore Brands
            </Link>
          </div>
        </div>

        {/* Fun Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            "Every step counts, even the wrong ones!" - SneakLab Philosophy 🤘
          </p>
          
          <div className="mt-4 flex justify-center space-x-2 text-2xl">
            <span className="animate-bounce">👟</span>
            <span className="animate-bounce delay-75">🔥</span>
            <span className="animate-bounce delay-150">✨</span>
            <span className="animate-bounce delay-225">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
}