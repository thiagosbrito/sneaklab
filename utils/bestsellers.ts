import { Product } from '@/db/schema'
import { getProductsFromDB } from '@/db/queries/products'

export type BestSellerProduct = Product & {
  total_quantity_sold: number
  total_revenue: number
  rank: number
}

export async function getBestSellers(limit: number = 20): Promise<BestSellerProduct[]> {
  try {
    console.log('🔍 Fetching bestseller data...')
    
    // Use database query instead of HTTP call to avoid circular dependency
    // TODO: Implement proper bestseller aggregation from order data
    const result = await getProductsFromDB({
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc',
      isAvailable: true
    })
    
    // Convert products to bestseller format with mock sales data
    // In a real implementation, this would come from actual order data aggregation
    const bestSellers: BestSellerProduct[] = result.products.map((product, index: number) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageURL: product.imageURL,
      brandID: product.brandID,
      categoryID: product.categoryID,
      isAvailable: product.isAvailable,
      price: product.price,
      promoPrice: product.promoPrice,
      createdAt: product.createdAt,
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