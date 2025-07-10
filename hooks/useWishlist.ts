"use client";

import { useState, useEffect, useCallback } from 'react';
import useSupabaseBrowser from '@/utils/supabase/client';
import { useAuth } from '@/contexts/auth';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getUserWishlist, 
  isInWishlist,
  getWishlistCount,
  WishlistItem 
} from '@/utils/wishlist';
import Swal from 'sweetalert2';

export function useWishlist() {
  const supabase = useSupabaseBrowser();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    const { wishlist: userWishlist, error: wishlistError } = await getUserWishlist(supabase, user.id);
    const { count, error: countError } = await getWishlistCount(supabase, user.id);

    if (wishlistError || countError) {
      setError(wishlistError || countError || 'Failed to fetch wishlist');
    } else {
      setWishlist(userWishlist);
      setWishlistCount(count);
    }

    setLoading(false);
  }, [supabase, user]);

  // Add product to wishlist
  const addToWishlistHandler = useCallback(async (productId: number) => {
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Login Necessário',
        text: 'Você precisa estar logado para adicionar items à sua wishlist',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed',
      });
      return false;
    }

    const { success, error } = await addToWishlist(supabase, user.id, productId);

    if (success) {
      await fetchWishlist(); // Refresh wishlist
      Swal.fire({
        icon: 'success',
        title: 'Adicionado à Wishlist!',
        text: 'O produto foi adicionado à sua lista de desejos',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      return true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error || 'Não foi possível adicionar à wishlist',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed',
      });
      return false;
    }
  }, [supabase, user, fetchWishlist]);

  // Remove product from wishlist
  const removeFromWishlistHandler = useCallback(async (productId: number) => {
    if (!user) return false;

    const { success, error } = await removeFromWishlist(supabase, user.id, productId);

    if (success) {
      await fetchWishlist(); // Refresh wishlist
      Swal.fire({
        icon: 'success',
        title: 'Removido da Wishlist',
        text: 'O produto foi removido da sua lista de desejos',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      return true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error || 'Não foi possível remover da wishlist',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed',
      });
      return false;
    }
  }, [supabase, user, fetchWishlist]);

  // Check if product is in wishlist
  const checkIsInWishlist = useCallback(async (productId: number): Promise<boolean> => {
    if (!user) return false;

    const { isInWishlist: inWishlist } = await isInWishlist(supabase, user.id, productId);
    return inWishlist;
  }, [supabase, user]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId: number): Promise<boolean> => {
    const inWishlist = await checkIsInWishlist(productId);
    
    if (inWishlist) {
      return await removeFromWishlistHandler(productId);
    } else {
      return await addToWishlistHandler(productId);
    }
  }, [checkIsInWishlist, addToWishlistHandler, removeFromWishlistHandler]);

  // Load wishlist on mount and when user changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    wishlistCount,
    loading,
    error,
    addToWishlist: addToWishlistHandler,
    removeFromWishlist: removeFromWishlistHandler,
    toggleWishlist,
    checkIsInWishlist,
    refreshWishlist: fetchWishlist,
  };
}