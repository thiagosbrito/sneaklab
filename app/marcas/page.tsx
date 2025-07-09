import BestSeller from '@/components/layout/BestSeller';

import Showcase from '@/components/layout/Showcase';
import SubscribeNewsletter from '@/components/layout/SubscribeNewsletter';
import React from 'react'

export default function MarcasPage() {
    
  
    return (
        <div className="w-screen bg-gradient-to-b from-background to-foreground text-foreground">
            <div className="w-full h-96 bg-gradient-to-b from-background to-foreground flex items-center justify-center mt-24">
                <div className="container">
                    <h1>Brands</h1>
                </div>
            </div>
            <Showcase />
            <BestSeller />
            <SubscribeNewsletter />
      </div>
        
    );
}
