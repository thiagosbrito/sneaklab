interface InboxItem {
  id: string
  title: string
  time: string
}

const inboxItems: InboxItem[] = [
  {
    id: '1',
    title: 'Waiting for order#12345',
    time: '4:39'
  },
  {
    id: '2', 
    title: 'Customer support id#22234',
    time: '11:07'
  }
]

export default function DashboardInbox() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inbox</h3>
          <p className="text-sm text-gray-500">Group: Support</p>
        </div>
        <button className="text-blue-500 text-sm hover:text-blue-600">
          View details
        </button>
      </div>

      <div className="space-y-3">
        {inboxItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">{item.title}</span>
            <span className="text-xs text-gray-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
