import { getStatusColor } from '@/utils/dashboard-analytics'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface OrderStatus {
  status: string
  count: number
  percentage: number
}

interface RecentActivityProps {
  ordersByStatus: OrderStatus[]
}

export default function RecentActivity({ ordersByStatus }: RecentActivityProps) {
  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium capitalize">{data.status}</p>
          <p className="text-sm text-gray-600">{data.count} orders ({data.percentage}%)</p>
        </div>
      )
    }
    return null
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Orders by Status</h3>
        <button className="text-blue-500 text-sm hover:text-blue-600">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {ordersByStatus.length > 0 ? (
          <>
            {/* Pie Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Status List */}
            {ordersByStatus.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-700 capitalize">{item.status}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No orders data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
