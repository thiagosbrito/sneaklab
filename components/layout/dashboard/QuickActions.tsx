import Link from 'next/link'
import { Plus, Package, Users, BarChart3, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      title: 'New Order',
      description: 'Create a new customer order',
      href: '/admin/orders',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Products',
      description: 'Add or edit products',
      href: '/admin/products',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Customers',
      description: 'View customer list',
      href: '/admin/customers',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Analytics',
      description: 'Detailed reports',
      href: '/admin/dashboard',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Settings',
      description: 'App configuration',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
