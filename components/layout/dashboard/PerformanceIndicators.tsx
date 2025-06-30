import { formatCurrency, OrderWithUserDetails } from '@/utils/dashboard-analytics'

interface PerformanceIndicatorsProps {
  recentOrders: OrderWithUserDetails[]
}

export default function PerformanceIndicators({ recentOrders }: PerformanceIndicatorsProps) {
  // Calculate today's performance
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const todayOrders = recentOrders.filter(order => 
    order.created_at && order.created_at.split('T')[0] === todayStr
  )
  
  // Calculate this week's performance
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  
  const thisWeekOrders = recentOrders.filter(order => {
    if (!order.created_at) return false
    const orderDate = new Date(order.created_at)
    return orderDate >= weekStart
  })
  
  // Calculate yesterday and last week for comparison
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  const yesterdayOrders = recentOrders.filter(order => 
    order.created_at && order.created_at.split('T')[0] === yesterdayStr
  )
  
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(weekStart)
  
  const lastWeekOrders = recentOrders.filter(order => {
    if (!order.created_at) return false
    const orderDate = new Date(order.created_at)
    return orderDate >= lastWeekStart && orderDate < lastWeekEnd
  })

  // Performance metrics
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

  const dailyGrowth = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : todayRevenue > 0 ? 100 : 0

  const weeklyGrowth = lastWeekRevenue > 0 
    ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
    : thisWeekRevenue > 0 ? 100 : 0

  const indicators = [
    {
      label: 'Today',
      value: formatCurrency(todayRevenue),
      count: todayOrders.length,
      growth: dailyGrowth,
      comparison: 'vs yesterday'
    },
    {
      label: 'This Week',
      value: formatCurrency(thisWeekRevenue),
      count: thisWeekOrders.length,
      growth: weeklyGrowth,
      comparison: 'vs last week'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
        <div className="text-xs text-gray-500">Real-time metrics</div>
      </div>

      <div className="space-y-6">
        {indicators.map((indicator, index) => (
          <div key={indicator.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{indicator.label}</span>
                <span className="text-xs text-gray-500">{indicator.count} orders</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {indicator.value}
                </span>
                
                <div className="flex items-center space-x-1">
                  <span className={`text-xs font-medium ${
                    indicator.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {indicator.growth >= 0 ? '+' : ''}{indicator.growth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">{indicator.comparison}</span>
                </div>
              </div>
              
              {/* Growth indicator bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      indicator.growth >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(Math.abs(indicator.growth), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {recentOrders.filter(order => order.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500">Pending Orders</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {recentOrders.filter(order => order.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
