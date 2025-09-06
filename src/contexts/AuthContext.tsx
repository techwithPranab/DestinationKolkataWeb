"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'moderator' | 'customer'
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

  useEffect(() => {
    // If NextAuth session is still loading, keep loading state
    if (status === 'loading') {
      return
    }

    // For OAuth logins, let NextAuth handle the session
    if (status === 'authenticated' && session?.user) {
      // Don't set user in AuthContext for OAuth - let NextAuth handle it
      setIsLoading(false)
      return
    }

    // Check if user is already logged in via localStorage (for form login)
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken')
    const userData = localStorage.getItem('authUser') || localStorage.getItem('adminUser')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoading(false)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Invalid user data, clear storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsLoading(false)
      }
    } else {
      // No authentication found
      setIsLoading(false)
    }
  }, [session, status])

  const login = (user: User, token: string) => {
    // Store authentication data first
    if (user.role === 'admin' || user.role === 'moderator') {
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
    } else {
      localStorage.setItem('authToken', token)
      localStorage.setItem('authUser', JSON.stringify(user))
    }

    // Update state
    setUser(user)
    
    // Navigate after a brief delay to ensure state propagation
    const targetPath = (user.role === 'admin' || user.role === 'moderator') ? '/admin' : '/customer/dashboard'
    
    setTimeout(() => {
      router.push(targetPath)
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

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user || (status === 'authenticated' && !!session)
  }), [user, isLoading, status, session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
