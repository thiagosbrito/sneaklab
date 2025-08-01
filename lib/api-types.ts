/**
 * API response types using Drizzle schema types
 */
import type { 
  Product, 
  Category, 
  Brand,
  Order,
  OrderItem,
  WishlistItem,
  ShoppingBag,
  HeroSection,
  ShowcaseSection,
  AboutUsSection
} from '@/db/schema'

// Base API response wrapper
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Paginated response wrapper
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

// Product-related types
export interface ProductsResponse extends PaginatedResponse<Product> {}

export interface ProductWithRelations extends Product {
  brand?: Brand
  category?: Category
}

export interface ProductFilters {
  category?: string
  brand?: string
  available?: boolean
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface BestsellersResponse extends ApiResponse<BestsellerProduct[]> {}

export interface BestsellerProduct extends Product {
  rank: number
  total_quantity_sold: number
  total_revenue: number
}

// Category types
export interface CategoriesResponse extends ApiResponse<Category[]> {}

// Brand types  
export interface BrandsResponse extends ApiResponse<Brand[]> {}

// Wishlist types
export interface WishlistResponse extends ApiResponse<WishlistItem[]> {}
export interface WishlistCountResponse extends ApiResponse<{ count: number }> {}
export interface WishlistCheckResponse extends ApiResponse<{ inWishlist: boolean }> {}

// Shopping bag types
export interface ShoppingBagResponse extends ApiResponse<ShoppingBag[]> {}

// Order types
export interface OrdersResponse extends PaginatedResponse<Order> {}

export interface OrderWithItems extends Order {
  items?: OrderItem[]
}

export interface CreateOrderData {
  items: OrderItem[]
  notes?: string
}

export interface UpdateOrderStatusData {
  status: string
  notes?: string
}

// Content types
export interface HeroSectionResponse extends ApiResponse<HeroSection> {}
export interface ShowcaseSectionResponse extends ApiResponse<ShowcaseSection[]> {}
export interface AboutUsSectionResponse extends ApiResponse<AboutUsSection> {}

// Admin types
export interface AdminOrdersResponse extends PaginatedResponse<OrderWithItems> {}

export interface AdminOrderFilters {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Error types
export interface ApiErrorResponse {
  error: string
  message?: string
  details?: any
}

// Mutation response types
export interface MutationResponse<T = any> extends ApiResponse<T> {
  success: boolean
}