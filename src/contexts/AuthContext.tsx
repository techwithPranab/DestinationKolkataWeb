"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken')
    const userData = localStorage.getItem('authUser') || localStorage.getItem('adminUser')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Invalid user data, clear storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    }

    setIsLoading(false)
  }, [])

  const login = (user: User, token: string) => {
    // Store authentication data
    if (user.role === 'admin' || user.role === 'moderator') {
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
    } else {
      localStorage.setItem('authToken', token)
      localStorage.setItem('authUser', JSON.stringify(user))
    }

    setUser(user)

    // Redirect after login
    if (user.role === 'admin' || user.role === 'moderator') {
      router.push('/admin')
    } else {
      router.push('/customer')
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    
    // Redirect based on current location
    if (window.location.pathname.startsWith('/admin')) {
      router.push('/admin/login')
    } else {
      router.push('/auth/login')
    }
  }

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }), [user, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
