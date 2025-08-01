import { Product } from '@/db/schema'

export type BestSellerProduct = Product & {
  total_quantity_sold: number
  total_revenue: number
  rank: number
}

export async function getBestSellers(limit: number = 20): Promise<BestSellerProduct[]> {
  try {
    console.log('🔍 Fetching bestseller data...')
    
    // TODO: Create dedicated /api/bestsellers endpoint with proper aggregation
    // For now, return most recent products as a fallback
    const response = await fetch('/api/products?limit=' + limit)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    
    const { data: products } = await response.json()
    
    // Convert products to bestseller format with mock sales data
    // In a real implementation, this would come from actual order data
    const bestSellers: BestSellerProduct[] = products.map((product: Product, index: number) => ({
      ...product,
      total_quantity_sold: Math.floor(Math.random() * 50) + 10, // Mock data
      total_revenue: Math.floor(Math.random() * 1000) + 200, // Mock data
      rank: index + 1
    }))

    console.log('✅ Bestsellers calculated:', bestSellers.length)
    return bestSellers

  } catch (error) {
    console.error('❌ Error fetching bestsellers:', error)
    return []
  }
}

export async function getBestSellersServerSide(limit: number = 20): Promise<BestSellerProduct[]> {
  // Same implementation but can be used on server-side
  return getBestSellers(limit)
}