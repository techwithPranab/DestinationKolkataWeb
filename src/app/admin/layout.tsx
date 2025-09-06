"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Hotel, 
  UtensilsCrossed, 
  MapPin, 
  Calendar, 
  Trophy, 
  Gift, 
  Users, 
  BarChart3, 
  Bell,
  Menu,
  X,
  LogOut,
  CheckCircle,
  MessageSquare,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Building2,
  MessageCircle,
  Cog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'

interface AdminLayoutProps {
  readonly children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Content Management',
    icon: Building2,
    children: [
      {
        name: 'Hotels',
        href: '/admin/hotels',
        icon: Hotel,
        description: 'Manage hotel listings'
      },
      {
        name: 'Restaurants',
        href: '/admin/restaurants',
        icon: UtensilsCrossed,
        description: 'Manage restaurant listings'
      },
      {
        name: 'Attractions',
        href: '/admin/visiting-places',
        icon: MapPin,
        description: 'Manage tourist attractions'
      },
      {
        name: 'Events',
        href: '/admin/events',
        icon: Calendar,
        description: 'Manage events and festivals'
      },
      {
        name: 'Sports',
        href: '/admin/sports',
        icon: Trophy,
        description: 'Manage sports facilities'
      },
      {
        name: 'Travel',
        href: '/admin/travel',
        icon: MapPin,
        description: 'Manage travel services'
      },
      {
        name: 'Promotions',
        href: '/admin/promotions',
        icon: Gift,
        description: 'Manage offers and deals'
      }
    ]
  },
  {
    name: 'User Management',
    icon: Users,
    children: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
        description: 'User management'
      },
      {
        name: 'Approvals',
        href: '/admin/approvals',
        icon: CheckCircle,
        description: 'Review and approve submissions'
      }
    ]
  },
  {
    name: 'Communication',
    icon: MessageCircle,
    children: [
      {
        name: 'Reviews',
        href: '/admin/reviews',
        icon: MessageSquare,
        description: 'Manage user reviews and ratings'
      },
      {
        name: 'Feedback',
        href: '/admin/feedback',
        icon: MessageSquare,
        description: 'Manage user feedback and reviews'
      },
      {
        name: 'Contact',
        href: '/admin/contact',
        icon: Mail,
        description: 'Manage contact form submissions'
      },
      {
        name: 'Report Issues',
        href: '/admin/report-issues',
        icon: AlertTriangle,
        description: 'Manage reported issues and bugs'
      }
    ]
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Site analytics and reports'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Cog,
    description: 'System settings'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Content Management']))
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuName)) {
        newSet.delete(menuName)
      } else {
        newSet.add(menuName)
      }
      return newSet
    })
  }

  // Don't show admin layout for login, forgot password, and reset password pages
  if (pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password') {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <button 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6 bg-orange-600">
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-orange-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedMenus.has(item.name)
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => {
                          const isActive = pathname === child.href
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                  ? 'bg-orange-100 text-orange-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <child.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                              {child.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              } else {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              }
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg shadow-gray-200/50">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Destination Kolkata</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    if (item.children) {
                      const isExpanded = expandedMenus.has(item.name)
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => toggleMenu(item.name)}
                            className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                          >
                            <item.icon className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-orange-600" />
                            <span className="flex-1 text-left">{item.name}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          {isExpanded && (
                            <ul className="ml-8 space-y-1">
                              {item.children.map((child) => {
                                const isActive = pathname === child.href
                                return (
                                  <li key={child.name}>
                                    <Link
                                      href={child.href}
                                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                                        isActive
                                          ? 'bg-orange-50 text-orange-600'
                                          : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                      }`}
                                    >
                                      <child.icon
                                        className={`h-4 w-4 shrink-0 ${
                                          isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600'
                                        }`}
                                      />
                                      <div>
                                        <div>{child.name}</div>
                                      </div>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    } else {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 shrink-0 ${
                                isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600'
                              }`}
                            />
                            <div>
                              <div>{item.name}</div>
                            </div>
                          </Link>
                        </li>
                      )
                    }
                  })}
                </ul>
              </li>
            </ul>
            
            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut
                  className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600"
                />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              <div className="flex items-center gap-x-3">
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@destinationkolkata.com'}</p>
                </div>
                <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  )
}
