"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import { NotificationProvider } from '@/contexts/NotificationContext'

interface CustomerLayoutProps {
  readonly children: React.ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, isLoading } = useAuth()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log('Customer Layout - Auth Check:', {
      status,
      isLoading,
      hasSession: !!session,
      hasUser: !!user,
      userRole: user?.role,
      authChecked
    })

    // Don't check authentication until both contexts are loaded
    if (status === 'loading' || isLoading) {
      console.log('Still loading auth contexts...')
      return
    }

    // Check if user is authenticated via NextAuth session (OAuth)
    if (session && status === 'authenticated') {
      console.log('Authenticated via NextAuth session')
      setAuthChecked(true)
      return
    }
    
    // Check if user is authenticated via AuthContext (form login)
    if (user && (user.role === 'customer' || user.role === 'user')) {
      console.log('Authenticated via AuthContext as customer/user')
      setAuthChecked(true)
      return
    }
    
    // Check localStorage as backup (important for post-login state)
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('authUser')
    
    console.log('LocalStorage check:', { hasToken: !!token, hasUserData: !!userData })
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData as string)
        console.log('Parsed user from localStorage:', parsedUser)
        if (parsedUser.role === 'customer' || parsedUser.role === 'user') {
          console.log('Valid customer/user found in localStorage')
          setAuthChecked(true)
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    }
    
    // Only redirect if we're sure there's no authentication
    // Add a delay to allow for state propagation after login
    const redirectTimeout = setTimeout(() => {
      // Re-check authentication state before performing the redirect to
      // avoid a race where the user just logged in and the timeout fires
      const latestToken = localStorage.getItem('authToken') || localStorage.getItem('adminToken')
      const latestUserData = localStorage.getItem('authUser') || localStorage.getItem('adminUser')
      if (session && status === 'authenticated') {
        console.log('Auth session appeared before redirect, cancelling redirect')
        setAuthChecked(true)
        return
      }
      if (user) {
        console.log('Local user appeared before redirect, cancelling redirect')
        setAuthChecked(true)
        return
      }
      if (latestToken && latestUserData) {
        try {
          const parsedUser = JSON.parse(latestUserData as string)
          console.log('LocalStorage user found before redirect:', parsedUser)
          if (parsedUser.role === 'customer' || parsedUser.role === 'user') {
            setAuthChecked(true)
            return
          }
        } catch (error) {
          console.error('Error parsing user data on redirect check:', error)
        }
      }
      console.log('No valid authentication found after delay, redirecting to login')
      setAuthChecked(true)
      router.push('/auth/login')
    }, 500) // Increased delay for better reliability

    return () => clearTimeout(redirectTimeout)
  }, [user, isLoading, session, status, router])

  // Show loading until authentication is checked
  if (status === 'loading' || isLoading || !authChecked) {
    console.log('Showing loading spinner...')
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
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <CustomerSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </NotificationProvider>
    )
  }

  // Allow access if authenticated via AuthContext (form login)
  if (user && (user.role === 'customer' || user.role === 'user')) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <CustomerSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </NotificationProvider>
    )
  }

  // Not authenticated
  console.log('Not authenticated - should redirect')
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
