import { useState, useEffect } from 'react';
import useSupabaseBrowser from '@/utils/supabase/client';
import { Tables } from '@/utils/supabase/database.types';

type Category = Tables<'categories'>;

export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseBrowser();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  return { categories, loading };
}
