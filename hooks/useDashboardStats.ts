'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats, DashboardStats } from '@/utils/dashboard-analytics'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching fresh dashboard stats...')
      const dashboardStats = await getDashboardStats()
      console.log('📊 Fresh stats received:', dashboardStats)
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard stats')
      // Set empty stats on error
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: [],
        ordersByStatus: [],
        dailyOrderStats: [],
        topProducts: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
