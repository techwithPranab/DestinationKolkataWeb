"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface User {
  _id?: string
  id?: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'moderator' | 'customer' | 'user'
  phone?: string
  businessName?: string
  businessType?: string
  city?: string
  membershipType?: 'free' | 'premium' | 'business'
  membershipExpiry?: string
}

interface AuthContextType {
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Primary effect: Check localStorage for user session (form-based login)
  useEffect(() => {
    console.log('AuthProvider initializing auth check')
    
    // Always check localStorage first - this is our primary auth mechanism
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken')
    const userData = localStorage.getItem('authUser') || localStorage.getItem('adminUser')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('User loaded from localStorage:', parsedUser.email)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    }

    // Only mark loading as complete after a brief delay to allow NextAuth to settle
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization complete')
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  // Secondary effect: Handle NextAuth session if available
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      console.log('NextAuth session detected')
      // Only use NextAuth session if we don't already have localStorage user
      const hasLocalToken = !!(localStorage.getItem('authToken') || localStorage.getItem('adminToken'))

      if (!hasLocalToken) {
        // Exchange the NextAuth session for a backend JWT and upsert user
        ;(async () => {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
            const resp = await fetch(`${backendUrl}/api/auth/next-auth`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                email: session.user?.email,
                name: session.user?.name || session.user?.email?.split('@')[0],
                provider: 'nextauth'
              })
            })

            const json = await resp.json()
            if (json && json.success && json.data?.token) {
              const { token, user: backendUser } = json.data
              // Persist token locally so ApiClient can use Authorization header
              localStorage.setItem('authToken', token)
              // Update AuthContext user state
              setUser(backendUser)
              console.log('Synced NextAuth session with backend; token stored')
            } else {
              console.warn('NextAuth sync failed:', json?.message || json)
            }
          } catch (err) {
            console.error('Failed to sync NextAuth session with backend', err)
          } finally {
            setIsLoading(false)
          }
        })()
      } else {
        setIsLoading(false)
      }
    }
  }, [status, session, user])

  const login = (user: User, token: string) => {
    console.log('AuthContext login called with:', { user, token: !!token })
    
    // Store authentication data first
    if (user.role === 'admin' || user.role === 'moderator') {
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      console.log('Stored admin credentials')
    } else {
      localStorage.setItem('authToken', token)
      localStorage.setItem('authUser', JSON.stringify(user))
      console.log('Stored customer credentials')
    }

    // Update state immediately
    setUser(user)
    setIsLoading(false) // Ensure loading is complete
    console.log('User state updated in AuthContext:', { user: user.email, role: user.role })
    
    // Small delay to ensure state propagation before navigation
    setTimeout(() => {
      const targetPath = (user.role === 'admin' || user.role === 'moderator') ? '/admin' : '/customer/dashboard'
      console.log('Navigating to:', targetPath)
      router.replace(targetPath)
    }, 100)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    
    // Sign out from NextAuth as well
    signOut({ callbackUrl: window.location.pathname.startsWith('/admin') ? '/admin/login' : '/auth/login' })
  }

  const value: AuthContextType = useMemo(() => {
    const isAuth = !!user || (status === 'authenticated' && !!session)
    return {
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: isAuth
    }
  }, [user, isLoading, status, session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
