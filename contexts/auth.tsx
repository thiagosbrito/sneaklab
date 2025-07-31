"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import useSupabaseBrowser from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle logout redirect
        if (event === 'SIGNED_OUT') {
          // If user was on admin pages, redirect to admin sign-in
          if (pathname?.startsWith('/admin')) {
            router.push('/admin/(auth)/sign-in');
          } else {
            // Otherwise redirect to home page
            router.push('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router, pathname]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
