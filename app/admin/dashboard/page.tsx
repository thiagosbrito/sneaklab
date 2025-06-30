'use client'

import StatsCard from '@/components/layout/dashboard/StatsCard'
import DashboardInbox from '@/components/layout/dashboard/DashboardInbox'
import RecentActivity from '@/components/layout/dashboard/RecentActivity'
import TrendsChart from '@/components/layout/dashboard/TrendsChart'
import RevenueInsights from '@/components/layout/dashboard/RevenueInsights'
import QuickActions from '@/components/layout/dashboard/QuickActions'
import PerformanceIndicators from '@/components/layout/dashboard/PerformanceIndicators'
import { formatCurrency } from '@/utils/dashboard-analytics'
import { formatCurrencyPortuguese, debugCurrencyFormatting } from '@/utils/currency-formatter'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function DashboardPage() {
    const { stats, loading, error } = useDashboardStats()

    // Debug logging
    console.log('🎛️ Dashboard stats:', stats)
    if (stats?.totalRevenue) {
        debugCurrencyFormatting(stats.totalRevenue)
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-32"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                        <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                        <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                        <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                <div className="text-center text-gray-500">
                    <p>Unable to load dashboard data. Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your sneaker business.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard 
                    title="Total Orders" 
                    value={stats?.totalOrders || 0} 
                    color="blue"
                    subtitle={`${stats?.pendingOrders || 0} pending`}
                />
                <StatsCard 
                    title="Revenue" 
                    value={stats?.totalRevenue ? formatCurrencyPortuguese(stats.totalRevenue) : '€0,00'} 
                    color="green"
                    subtitle="Total earnings"
                />
                <StatsCard 
                    title="Products" 
                    value={stats?.totalProducts || 0} 
                    color="purple"
                    subtitle="Available items"
                />
                <StatsCard 
                    title="Customers" 
                    value={stats?.totalCustomers || 0} 
                    color="orange"
                    subtitle="Registered users"
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <QuickActions />
            </div>

            {/* Main Content Grid */}
            <div className="space-y-6">
                {/* Performance and Revenue row - shared row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PerformanceIndicators recentOrders={stats?.recentOrders || []} />
                    <RevenueInsights recentOrders={stats?.recentOrders || []} />
                </div>
                
                {/* Sales Trends Chart - full width row */}
                <TrendsChart 
                    dailyStats={stats?.dailyOrderStats || []}
                    topProducts={stats?.topProducts || []}
                />
                
                {/* Bottom Section: Recent Orders (left) and Order Status (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders - takes 2/3 of the width */}
                    <div className="lg:col-span-2">
                        <DashboardInbox recentOrders={stats?.recentOrders || []} />
                    </div>
                    
                    {/* Order Status Breakdown - takes 1/3 of the width */}
                    <div className="lg:col-span-1">
                        <RecentActivity ordersByStatus={stats?.ordersByStatus || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}