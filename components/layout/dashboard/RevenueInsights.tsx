import { formatCurrencyPortuguese } from '@/utils/currency-formatter'
import { OrderWithUserDetails } from '@/utils/dashboard-analytics'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface RevenueInsightsProps {
  recentOrders: OrderWithUserDetails[]
}

export default function RevenueInsights({ recentOrders }: RevenueInsightsProps) {
  // Calculate revenue insights
  const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const avgOrderValue = recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0
  
  // Get current month and previous month orders
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const currentMonthOrders = recentOrders.filter(order => {
    if (!order.created_at) return false
    const orderDate = new Date(order.created_at)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  })
  
  const previousMonthOrders = recentOrders.filter(order => {
    if (!order.created_at) return false
    const orderDate = new Date(order.created_at)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear
  })
  
  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  
  const monthlyGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : currentMonthRevenue > 0 ? 100 : 0

  // Create daily revenue data for mini chart (last 7 days)
  const dailyRevenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayOrders = recentOrders.filter(order => {
      if (!order.created_at) return false
      const orderDate = new Date(order.created_at)
      return orderDate.toDateString() === date.toDateString()
    })
    return {
      day: date.getDate(),
      revenue: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Insights</h3>
        <div className="text-xs text-gray-500">This month vs last month</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {formatCurrencyPortuguese(currentMonthRevenue)}
          </div>
          <div className="text-sm text-blue-600 mb-2">This Month</div>
          <div className={`text-xs font-medium mb-2 ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% from last month
          </div>
          {/* Mini trend chart */}
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenueData}>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrencyPortuguese(avgOrderValue)}
          </div>
          <div className="text-sm text-green-600 mb-2">Avg Order Value</div>
          <div className="text-xs text-gray-500">
            Based on {recentOrders.length} orders
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {currentMonthOrders.length}
          </div>
          <div className="text-sm text-purple-600 mb-2">Orders This Month</div>
          <div className="text-xs text-gray-500">
            {previousMonthOrders.length} last month
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Status */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Revenue by Order Status</h4>
        <div className="space-y-2">
          {['completed', 'delivered', 'confirmed', 'pending'].map(status => {
            const statusOrders = recentOrders.filter(order => order.status === status)
            const statusRevenue = statusOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
            const percentage = totalRevenue > 0 ? (statusRevenue / totalRevenue) * 100 : 0
            
            if (statusOrders.length === 0) return null
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                  <span className="text-xs text-gray-500">({statusOrders.length} orders)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrencyPortuguese(statusRevenue)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
