import { TypedSupabaseClient } from "@/utils/models/supabase-client";

export function getCategories(client: TypedSupabaseClient) {
  return client
    .from("categories")
    .select()
    .order("name", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }
      return data || [];
    });
}