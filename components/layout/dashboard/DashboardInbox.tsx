import { OrderWithUserDetails, formatDate, getStatusColor, getStatusIcon } from '@/utils/dashboard-analytics'

interface DashboardInboxProps {
  recentOrders: OrderWithUserDetails[]
}

export default function DashboardInbox({ recentOrders }: DashboardInboxProps) {
  const limitedOrders = recentOrders.slice(0, 5)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500">{recentOrders.length} total orders</p>
        </div>
        <button className="text-blue-500 text-sm hover:text-blue-600">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {limitedOrders.length > 0 ? (
          limitedOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {order.customer_name || 'Unknown Customer'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || '')}`}>
                    {getStatusIcon(order.status || '')} {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Order #{order.id?.slice(0, 8)} • €{order.total_amount?.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {order.created_at ? formatDate(order.created_at) : 'N/A'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent orders</p>
          </div>
        )}
      </div>
    </div>
  )
}
