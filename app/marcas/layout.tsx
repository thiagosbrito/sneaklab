import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getMenuCategories } from '@/utils/categories';
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const categories = await getMenuCategories();
  
    return (
      <div className="min-h-screen flex flex-col">
            <Navbar menuItems={categories} />
            {children}
            <Footer />
      </div>
    );
}
