import { Order, Product, OrderItem, Profile } from '@/db/schema'

export type OrderWithUserDetails = Order & {
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_address: any
}

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
  try {
    console.log('🔍 Fetching dashboard stats...')
    
    // Get all orders with user details from API
    const response = await fetch('/api/admin/orders')
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }
    const orders: OrderWithUserDetails[] = await response.json()
    console.log('✅ Orders fetched:', orders?.length || 0)

    // Get products count from API
    const productsResponse = await fetch('/api/products')
    const productsData = await productsResponse.json()
    const productsCount = productsData?.data?.length || 0
    console.log('✅ Products count:', productsCount)

    // Get unique customers count (simplified - using unique user_ids from orders)
    const uniqueCustomers = new Set(orders?.map(order => order.userId).filter(Boolean))
    const customersCount = uniqueCustomers.size
    console.log('✅ Customers count:', customersCount)

    // For order items analysis, we'll use simplified data from orders
    console.log('✅ Using simplified order analysis')

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
      sum + (parseFloat(order.totalAmount || '0')), 0
    ) || 0

    // Revenue from completed orders only
    const completedRevenue = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'completed'
    ).reduce((sum: number, order: OrderWithUserDetails) => 
      sum + (parseFloat(order.totalAmount || '0')), 0
    ) || 0

    // Revenue from delivered and completed orders
    const confirmedRevenue = orders?.filter((order: OrderWithUserDetails) => 
      order.status === 'completed' || order.status === 'delivered'
    ).reduce((sum: number, order: OrderWithUserDetails) => 
      sum + (parseFloat(order.totalAmount || '0')), 0
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
      order.createdAt && new Date(order.createdAt) >= thirtyDaysAgo
    ) || []

    const dailyStats = recentOrdersData.reduce((acc: Record<string, { orders: number; revenue: number }>, order: OrderWithUserDetails) => {
      if (!order.createdAt) return acc
      
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { orders: 0, revenue: 0 }
      }
      acc[date].orders += 1
      acc[date].revenue += parseFloat(order.totalAmount || '0')
      return acc
    }, {} as Record<string, { orders: number; revenue: number }>)

    const dailyOrderStats = Object.entries(dailyStats)
      .map(([date, stats]) => ({ 
        date, 
        orders: (stats as DailyStatsRecord).orders, 
        revenue: (stats as DailyStatsRecord).revenue 
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top products (simplified - using empty data for now)
    // TODO: Implement proper product stats with order items API
    const productStats = {} as Record<string, { total_quantity: number; total_revenue: number }>

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
