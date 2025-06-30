import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/utils/supabase/database.types'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderWithUserDetails = Database['public']['Views']['orders_with_user_details']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

interface DailyStatsRecord {
  orders: number
  revenue: number
}

interface ProductStatsRecord {
  total_quantity: number
  total_revenue: number
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  recentOrders: OrderWithUserDetails[]
  ordersByStatus: { status: string; count: number; percentage: number }[]
  dailyOrderStats: { date: string; orders: number; revenue: number }[]
  topProducts: { product_name: string; total_quantity: number; total_revenue: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    console.log('🔍 Fetching dashboard stats...')
    
    // Get all orders with user details
    const { data: orders, error: ordersError } = await supabase
      .from('orders_with_user_details')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Orders error:', ordersError)
      throw ordersError
    }
    console.log('✅ Orders fetched:', orders?.length || 0)

    // Get products count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('isAvailable', true)

    if (productsError) {
      console.error('❌ Products error:', productsError)
      throw productsError
    }
    console.log('✅ Products count:', productsCount)

    // Get unique customers count
    const { count: customersCount, error: customersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (customersError) {
      console.error('❌ Customers error:', customersError)
      throw customersError
    }
    console.log('✅ Customers count:', customersCount)

    // Get order items for product analysis
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products (name)
      `)

    if (orderItemsError) {
      console.error('❌ Order items error:', orderItemsError)
      throw orderItemsError
    }
    console.log('✅ Order items fetched:', orderItems?.length || 0)

    // Process the data
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'pending' || order.status === 'reviewing'
    ).length || 0
    const completedOrders = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'completed'
    ).length || 0

    // Enhanced revenue calculations
    // Total revenue from all orders (regardless of status)
    const totalRevenueAllOrders = orders?.reduce((sum: number, order: OrderWithUserDetails) => 
      sum + (order.total_amount || 0), 0
    ) || 0

    // Revenue from completed orders only
    const completedRevenue = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'completed'
    ).reduce((sum: number, order: OrderWithUserDetails) => 
      sum + (order.total_amount || 0), 0
    ) || 0

    // Revenue from delivered and completed orders
    const confirmedRevenue = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'completed' || order.status === 'delivered'
    ).reduce((sum: number, order: OrderWithUserDetails) => 
      sum + (order.total_amount || 0), 0
    ) || 0

    // Use total revenue from all orders as the main metric
    const totalRevenue = totalRevenueAllOrders

    const totalProducts = productsCount || 0
    const totalCustomers = customersCount || 0

    console.log('� Calculated stats:', {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      totalCustomers
    })

    // Recent orders (last 10)
    const recentOrders = orders?.slice(0, 10) || []

    // Orders by status
    const statusCounts = orders?.reduce((acc: Record<string, number>, order: OrderWithUserDetails) => {
      const status = order.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
      percentage: Math.round((count as number / totalOrders) * 100)
    }))

    // Daily order stats (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrdersData = orders?.filter((order: OrderWithUserDetails) => 
      order.created_at && new Date(order.created_at) >= thirtyDaysAgo
    ) || []

    const dailyStats = recentOrdersData.reduce((acc: Record<string, { orders: number; revenue: number }>, order: OrderWithUserDetails) => {
      if (!order.created_at) return acc
      
      const date = new Date(order.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { orders: 0, revenue: 0 }
      }
      acc[date].orders += 1
      acc[date].revenue += order.total_amount || 0
      return acc
    }, {} as Record<string, { orders: number; revenue: number }>)

    const dailyOrderStats = Object.entries(dailyStats)
      .map(([date, stats]) => ({ 
        date, 
        orders: (stats as DailyStatsRecord).orders, 
        revenue: (stats as DailyStatsRecord).revenue 
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top products
    const productStats = orderItems?.reduce((acc: Record<string, { total_quantity: number; total_revenue: number }>, item: any) => {
      const productName = item.products?.name || 'Unknown Product'
      if (!acc[productName]) {
        acc[productName] = { total_quantity: 0, total_revenue: 0 }
      }
      acc[productName].total_quantity += item.quantity || 0
      acc[productName].total_revenue += item.item_total || 0
      return acc
    }, {} as Record<string, { total_quantity: number; total_revenue: number }>) || {}

    const topProducts = Object.entries(productStats)
      .map(([product_name, stats]) => ({ 
        product_name, 
        total_quantity: (stats as ProductStatsRecord).total_quantity, 
        total_revenue: (stats as ProductStatsRecord).total_revenue 
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5)

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders,
      ordersByStatus,
      dailyOrderStats,
      topProducts
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return empty stats if there's an error
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalCustomers: 0,
      recentOrders: [],
      ordersByStatus: [],
      dailyOrderStats: [],
      topProducts: []
    }
  }
}

export function formatCurrency(amount: number): string {
  console.log('💰 Formatting currency:', amount)
  
  // Ensure we have a valid number
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  
  try {
    const formatted = new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount)
    
    console.log('💰 Formatted result:', formatted)
    return formatted
  } catch (error) {
    console.error('❌ Currency formatting error:', error)
    // Fallback to simple Euro format
    return `€${validAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
    ready: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-gray-100 text-gray-800',
    completed: 'bg-emerald-100 text-emerald-800'
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusIcon(status: string): string {
  const statusIcons: Record<string, string> = {
    pending: '⏳',
    reviewing: '🔍',
    confirmed: '✅',
    rejected: '❌',
    in_progress: '🔨',
    ready: '📦',
    delivered: '🚚',
    completed: '🎉'
  }
  return statusIcons[status] || '📋'
}
