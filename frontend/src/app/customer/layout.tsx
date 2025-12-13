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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Real-time authentication check - runs whenever auth state changes
  useEffect(() => {
    console.log('Customer Layout - Auth Check:', {
      status,
      isLoading,
      hasSession: !!session,
      hasUser: !!user,
      userRole: user?.role,
      authChecked,
      isCheckingAuth
    })

    setIsCheckingAuth(true)

    // Immediate checks for authenticated state
    const isNextAuthAuthenticated = session && status === 'authenticated'
    const isUserAuthenticated = user && (user.role === 'customer' || user.role === 'user')
    
    // Check localStorage synchronously
    let isLocalStorageAuthenticated = false
    try {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('authUser')
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        isLocalStorageAuthenticated = parsedUser.role === 'customer' || parsedUser.role === 'user'
        console.log('LocalStorage auth check:', { hasToken: !!token, userRole: parsedUser.role, isValid: isLocalStorageAuthenticated })
      }
    } catch (error) {
      console.error('Error checking localStorage:', error)
      // Clear invalid data
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
    }

    // If any authentication method is valid, allow access immediately
    if (isNextAuthAuthenticated || isUserAuthenticated || isLocalStorageAuthenticated) {
      console.log('Authentication found:', {
        nextAuth: isNextAuthAuthenticated,
        userAuth: isUserAuthenticated, 
        localStorage: isLocalStorageAuthenticated
      })
      setAuthChecked(true)
      setIsCheckingAuth(false)
      return
    }

    // Only wait and redirect if still loading
    if (status === 'loading' || isLoading) {
      console.log('Still loading auth contexts, waiting...')
      setIsCheckingAuth(false)
      return
    }

    // If we reach here, no authentication found - redirect after a delay
    console.log('No authentication found, setting redirect timeout')
    const redirectTimeout = setTimeout(() => {
      console.log('Redirecting to login after timeout')
      setAuthChecked(true)
      setIsCheckingAuth(false)
      router.push('/auth/login')
    }, 500)

    return () => {
      clearTimeout(redirectTimeout)
      setIsCheckingAuth(false)
    }
  }, [user, isLoading, session, status, router])

  // Separate effect to handle initial auth state
  useEffect(() => {
    // Quick initial check on mount
    const quickAuthCheck = () => {
      try {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('authUser')
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser.role === 'customer' || parsedUser.role === 'user') {
            console.log('Quick auth check: Valid user found in localStorage')
            setAuthChecked(true)
            setIsCheckingAuth(false)
            return true
          }
        }
      } catch (error) {
        console.error('Quick auth check failed:', error)
      }
      return false
    }
    
    if (!authChecked && !quickAuthCheck()) {
      setIsCheckingAuth(true)
    }
  }, [])

  // Show loading until authentication is checked
  if ((status === 'loading' || isLoading || isCheckingAuth) && !authChecked) {
    console.log('Showing loading spinner...', { status, isLoading, isCheckingAuth, authChecked })
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

  // Final check - if we have valid localStorage data, allow access
  try {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('authUser')
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === 'customer' || parsedUser.role === 'user') {
        console.log('Allowing access based on localStorage data')
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
    }
  } catch (error) {
    console.error('Error in final localStorage check:', error)
  }

  // Not authenticated
  console.log('Not authenticated - showing redirect message')
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
