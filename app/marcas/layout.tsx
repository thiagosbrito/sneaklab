import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getCategories } from '@/queries/get-categories';
import { createClient } from '@/utils/supabase/server';
import React from 'react'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createClient();
    const categories = await getCategories(supabase);
  
    return (
      <div className="min-h-screen flex flex-col">
            <Navbar menuItems={categories} />
            {children}
            <Footer />
      </div>
    );
}
