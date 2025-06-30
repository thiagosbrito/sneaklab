'use client'

import { usePathname } from 'next/navigation'
import { Search, MessageSquare, Bell, User } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrencyPortuguese } from '@/utils/currency-formatter'

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  
  if (pathname === '/admin/dashboard') return 'Dashboard'
  
  const titleMap: Record<string, string> = {
    'categories': 'Categories',
    'customers': 'Customers', 
    'orders': 'Orders',
    'products': 'Products',
    'settings': 'Settings'
  }
  
  return titleMap[lastSegment] || 'Admin'
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin/dashboard'
  const pageTitle = getPageTitle(pathname)
  const { stats, loading } = useDashboardStats()

  // Calculate revenue changes (simple example - you can enhance this)
  const currentRevenue = stats?.totalRevenue || 0
  const previousRevenue = currentRevenue * 0.85 // Mock previous period (85% of current)
  const revenueChange = currentRevenue - previousRevenue
  const isPositiveChange = revenueChange >= 0

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        {/* Dynamic Content - Revenue for Dashboard, Title for other pages */}
        <div className="ml-0">
          {isDashboard ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Total Revenue</h1>
              <div className="flex items-center space-x-4 mt-1">
                {loading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrencyPortuguese(currentRevenue)}
                    </span>
                    <span className={`text-sm ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositiveChange ? '▲' : '▼'} {formatCurrencyPortuguese(Math.abs(revenueChange))}
                    </span>
                  </>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message Icon */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Notification Icon */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
