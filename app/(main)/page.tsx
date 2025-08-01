"use client";

import Hero from "@/components/layout/Hero";
import BrandsSlider from "@/components/layout/BrandsSlider";
import BestSeller from "@/components/layout/BestSeller";
import SubscribeNewsletter from "@/components/layout/SubscribeNewsletter";
import Showcase from "@/components/layout/Showcase";
import { Suspense } from "react";

// Loading fallback components for better UX
function HeroSkeleton() {
  return (
    <div className="flex flex-col items-center gap-y-2 justify-center h-[850px] bg-gray-200 animate-pulse">
      <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
      <div className="w-64 h-6 bg-gray-300 rounded"></div>
    </div>
  );
}

function BestSellerSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

const HomePage = () => {
  return (
    <div className="w-screen bg-gradient-to-b from-background to-foreground text-foreground">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      
      <Suspense fallback={null}>
        <Showcase />
      </Suspense>
      
      <BrandsSlider />
      
      <Suspense fallback={<BestSellerSkeleton />}>
        <BestSeller />
      </Suspense>
      
      <SubscribeNewsletter />
    </div>
  );
};

export default HomePage;
