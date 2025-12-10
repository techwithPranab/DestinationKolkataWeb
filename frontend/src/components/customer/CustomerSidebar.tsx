"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Plus,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Megaphone,
  Trophy,
  User,
  Heart,
  MessageSquare,
  HelpCircle,
  Activity,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationDropdown } from '@/components/shared/NotificationDropdown'

interface CustomerSidebarProps {
  readonly className?: string
}

export default function CustomerSidebar({ className = '' }: CustomerSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { data: session } = useSession()

  // Get user info from either AuthContext (form login) or NextAuth session (OAuth)
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || session?.user?.name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || session?.user?.email || 'user@example.com'

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/customer/dashboard'
    },
    {
      name: 'Create Listing',
      href: '#',
      icon: Plus,
      current: false,
      children: [
        { name: 'Hotel', href: '/customer/create/hotel', icon: Hotel },
        { name: 'Restaurant', href: '/customer/create/restaurant', icon: UtensilsCrossed },
        { name: 'Event', href: '/customer/create/event', icon: Calendar },
        { name: 'Promotion', href: '/customer/create/promotion', icon: Megaphone },
        { name: 'Sports', href: '/customer/create/sports', icon: Trophy }
      ]
    },
    {
      name: 'My Listings',
      href: '/customer/listings',
      icon: FileText,
      current: pathname === '/customer/listings'
    },
    {
      name: 'Favorites',
      href: '/customer/favorites',
      icon: Heart,
      current: pathname === '/customer/favorites'
    },
    {
      name: 'Reviews',
      href: '/customer/reviews',
      icon: MessageSquare,
      current: pathname === '/customer/reviews'
    },
    {
      name: 'Activity Feed',
      href: '/customer/activity',
      icon: Activity,
      current: pathname === '/customer/activity'
    },
    {
      name: 'Analytics',
      href: '/customer/analytics',
      icon: BarChart3,
      current: pathname === '/customer/analytics'
    },
    {
      name: 'Help & Support',
      href: '/customer/help',
      icon: HelpCircle,
      current: pathname === '/customer/help'
    },
    {
      name: 'Membership',
      href: '/customer/membership',
      icon: CreditCard,
      current: pathname === '/customer/membership'
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
      current: pathname === '/customer/profile'
    },
    {
      name: 'Settings',
      href: '/customer/settings',
      icon: Settings,
      current: pathname === '/customer/settings'
    },
    {
      name: 'Logout',
      href: '#',
      icon: LogOut,
      current: false,
      isLogout: true
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-orange-600">Destination Kolkata</h1>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
          </div>
          <NotificationDropdown />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
                <div className="ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === child.href
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <child.icon className="w-4 h-4 mr-3" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          }

          if (item.isLogout) {
            return (
              <Button
                key={item.name}
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
