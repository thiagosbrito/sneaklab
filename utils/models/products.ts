import { Product as DrizzleProduct, Brand, Category } from '@/db/schema';

// Use Drizzle types directly - no duplication needed
export type Product = DrizzleProduct & {
    // Optional joined data for enhanced displays
    brandName?: string;
    brandLogo?: string | null;
    category?: string; // Category slug for routing
    categoryName?: string;
    // Legacy compatibility - map imageURL to imageUrl for existing components
    imageUrl?: string[];
};

// Product with full relational data from joins
export type ProductWithDetails = Product & {
    brands?: Brand | null;
    categories?: Category | null;
};

// Helper function to add legacy compatibility fields
export function addLegacyFields(product: DrizzleProduct, brand?: Brand, category?: Category): Product {
    return {
        ...product,
        brandName: brand?.name,
        brandLogo: brand?.logo,
        category: category?.slug,
        categoryName: category?.name,
        imageUrl: product.imageURL || [], // Legacy compatibility
    };
}
