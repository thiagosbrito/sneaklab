interface ActivityItem {
  id: string
  title: string
  status: 'urgent' | 'new' | 'default'
}

const activityItems: ActivityItem[] = [
  {
    id: '1',
    title: 'Confirm order update',
    status: 'urgent'
  },
  {
    id: '2',
    title: 'Finish shipping update',
    status: 'urgent'
  },
  {
    id: '3',
    title: 'Create new order',
    status: 'new'
  },
  {
    id: '4',
    title: 'Update payment report',
    status: 'default'
  }
]

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-blue-500 text-sm hover:text-blue-600">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activityItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                item.status === 'urgent' ? 'bg-red-500' :
                item.status === 'new' ? 'bg-green-500' :
                'bg-blue-500'
              }`}></div>
              <span className="text-sm text-gray-700">{item.title}</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              item.status === 'urgent' ? 'bg-orange-100 text-orange-600' :
              item.status === 'new' ? 'bg-green-100 text-green-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {item.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
