import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/utils/supabase/database.types'

export type BestSellerProduct = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string[]
  brandID: string
  category: string
  isAvailable: boolean
  total_quantity_sold: number
  total_revenue: number
  rank: number
}

export async function getBestSellers(limit: number = 20): Promise<BestSellerProduct[]> {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    console.log('🔍 Fetching bestseller data...')
    
    // Get order items with full product details
    // Only include completed, delivered orders to count actual sales
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        item_total,
        orders!inner (
          status
        ),
        products!inner (
          id,
          name,
          description,
          price,
          imageUrl,
          brandID,
          category,
          isAvailable
        )
      `)
      .in('orders.status', ['completed', 'delivered']) // Only count actual sales
      .eq('products.isAvailable', true) // Only available products

    if (orderItemsError) {
      console.error('❌ Order items error:', orderItemsError)
      throw orderItemsError
    }
    
    console.log('✅ Order items fetched:', orderItems?.length || 0)

    // Aggregate sales data by product
    const productSalesMap = new Map<string, {
      product: any
      total_quantity_sold: number
      total_revenue: number
    }>()

    orderItems?.forEach((item: any) => {
      const productId = item.product_id.toString()
      const quantity = item.quantity || 0
      const revenue = item.item_total || 0
      
      if (productSalesMap.has(productId)) {
        const existing = productSalesMap.get(productId)!
        existing.total_quantity_sold += quantity
        existing.total_revenue += revenue
      } else {
        productSalesMap.set(productId, {
          product: item.products,
          total_quantity_sold: quantity,
          total_revenue: revenue
        })
      }
    })

    // Convert to array and sort by quantity sold (primary) and revenue (secondary)
    const bestSellers = Array.from(productSalesMap.values())
      .sort((a, b) => {
        // First sort by quantity sold (descending)
        if (b.total_quantity_sold !== a.total_quantity_sold) {
          return b.total_quantity_sold - a.total_quantity_sold
        }
        // If quantities are equal, sort by revenue (descending)
        return b.total_revenue - a.total_revenue
      })
      .slice(0, limit)
      .map((item, index): BestSellerProduct => ({
        id: item.product.id.toString(),
        name: item.product.name,
        description: item.product.description || '',
        price: item.product.price,
        imageUrl: item.product.imageUrl || [],
        brandID: item.product.brandID?.toString() || '',
        category: item.product.category || '',
        isAvailable: item.product.isAvailable,
        total_quantity_sold: item.total_quantity_sold,
        total_revenue: item.total_revenue,
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
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // This is the same function but can be used on server-side
  return getBestSellers(limit)
}