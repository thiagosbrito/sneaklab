'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Users, ShoppingCart, BarChart3, Settings, BadgePercent } from 'lucide-react'

import type { Database } from '@/utils/supabase/database.types';

type SidebarItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const sidebarItems: SidebarItem[] = [
  {
    href: '/admin/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
  },
  {
    href: '/admin/orders',
    icon: ShoppingCart,
    label: 'Order',
  },
  {
    href: '/admin/products',
    icon: Package,
    label: 'Products',
  },
  {
    href: '/admin/brands',
    icon: BadgePercent,
    label: 'Brands',
  },
  {
    href: '/admin/categories',
    icon: Package,
    label: 'Categories',
  },
  {
    href: '/admin/customers',
    icon: Users,
    label: 'Customers',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/svgs/logo.svg" 
            alt="Logo" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-900">SneakLab</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Customer Support */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Customer Support</div>
        <div className="text-xs text-gray-500 mb-3">
          We are always here for all your questions or important tasks. Our support team will contact 24/7 to you.
        </div>
        <button className="w-full bg-blue-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
          Connect Now
        </button>
        <div className="mt-3 text-xs text-gray-500">
          <div>Terms & Services</div>
          <div>Privacy Policy</div>
        </div>
      </div>
    </div>
  )
}
