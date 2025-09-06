"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CustomerSidebar from '@/components/customer/CustomerSidebar'

interface CustomerLayoutProps {
  readonly children: React.ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, isLoading } = useAuth()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Don't check authentication until both contexts are loaded
    if (status === 'loading' || isLoading) {
      return
    }

    // Mark that we've checked authentication
    setAuthChecked(true)
    
    // Check if user is authenticated via NextAuth session (OAuth)
    if (session && status === 'authenticated') {
      return
    }
    
    // Check if user is authenticated via AuthContext (form login)
    if (user?.role === 'customer') {
      return
    }
    
    // Check localStorage as backup
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('authUser')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role === 'customer') {
          return // Valid customer in localStorage
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    // No valid authentication found
    router.push('/auth/login')
  }, [user, isLoading, session, status, router])

  // Show loading until authentication is checked
  if (status === 'loading' || isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow access if authenticated via NextAuth session (OAuth)
  if (session && status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <CustomerSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Allow access if authenticated via AuthContext (form login)
  if (user && user.role === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <CustomerSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Not authenticated
  return null
}
