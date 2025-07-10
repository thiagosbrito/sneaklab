import { Database } from '@/utils/supabase/database.types';

// Base database product type
export type DatabaseProduct = Database['public']['Tables']['products']['Row'];
export type DatabaseBrand = Database['public']['Tables']['brands']['Row'];
export type DatabaseCategory = Database['public']['Tables']['categories']['Row'];

// Enhanced product type with joined data
export type Product = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string[]; // Mapped from imageURL
    brandID: string;
    brandName?: string; // From joined brands table
    brandLogo?: string; // From joined brands table
    category: string; // Category slug for routing
    categoryID: number;
    categoryName?: string; // From joined categories table
    isAvailable: boolean;
    price: number;
    promoPrice?: number | null;
    created_at: string;
};

// Product with full relational data
export type ProductWithDetails = DatabaseProduct & {
    brands?: DatabaseBrand | null;
    categories: DatabaseCategory;
};

// Helper function to convert database product to frontend Product type
export function mapDatabaseProductToProduct(dbProduct: ProductWithDetails): Product {
    return {
        id: dbProduct.id.toString(),
        name: dbProduct.name,
        description: dbProduct.description,
        imageUrl: dbProduct.imageURL || [],
        brandID: dbProduct.brandID?.toString() || '',
        brandName: dbProduct.brands?.name,
        brandLogo: dbProduct.brands?.logo,
        category: dbProduct.categories.slug,
        categoryID: dbProduct.categoryID,
        categoryName: dbProduct.categories.name,
        isAvailable: dbProduct.isAvailable,
        price: dbProduct.price || 0,
        promoPrice: dbProduct.promoPrice,
        created_at: dbProduct.created_at,
    };
}
