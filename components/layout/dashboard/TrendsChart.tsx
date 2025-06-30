'use client'

import { formatCurrencyPortuguese } from '@/utils/currency-formatter'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DailyStats {
  date: string
  orders: number
  revenue: number
}

interface TopProduct {
  product_name: string
  total_quantity: number
  total_revenue: number
}

interface TrendsChartProps {
  dailyStats: DailyStats[]
  topProducts: TopProduct[]
}

export default function TrendsChart({ dailyStats, topProducts }: TrendsChartProps) {
  // Get last 7 days for display
  const recentStats = dailyStats.slice(-7).map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' })
  }))

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'orders' ? 'Orders' : 'Revenue'}: {' '}
              {entry.dataKey === 'revenue' 
                ? formatCurrencyPortuguese(entry.value) 
                : entry.value
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Trends</h3>
          <p className="text-sm text-gray-500">Last 7 days performance</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Revenue</span>
          </div>
        </div>
      </div>

      {recentStats.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {recentStats.reduce((sum, stat) => sum + stat.orders, 0)}
                </div>
                <div className="text-sm text-blue-600">Total Orders</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyPortuguese(recentStats.reduce((sum, stat) => sum + stat.revenue, 0))}
                </div>
                <div className="text-sm text-green-600">Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Products</h4>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.product_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.total_quantity} sold
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrencyPortuguese(product.total_revenue)}
                    </div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">Start taking orders to see trends here</p>
          </div>
        </div>
      )}
    </div>
  )
}
