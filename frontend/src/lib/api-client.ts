"use client"

import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSession } from 'next-auth/react'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseURL: string
  private session: { user?: { email?: string | null; name?: string | null } } | null = null

  constructor() {
    // Use environment variable for backend URL, fallback to localhost for development
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  }

  setSession(session: { user?: { email?: string | null; name?: string | null } } | null) {
    this.session = session
  }

  private getAuthToken(): string | null {
    // Try different token storage locations
    const authToken = localStorage.getItem('authToken')
    const adminToken = localStorage.getItem('adminToken')
    const token = authToken || adminToken || null
    console.log('getAuthToken:', { authToken: !!authToken, adminToken: !!adminToken, hasToken: !!token })
    return token
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    // For NextAuth sessions, always consider valid if session exists
    if (this.session?.user) {
      return true
    }

    // For localStorage tokens
    const token = this.getAuthToken()
    if (!token) return false

    // Basic token validation - you could add more sophisticated validation here
    try {
      // For now, just check if token exists
      return !!token
    } catch {
      // Token is invalid, clear it
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return false
    }
  }

  async get<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = unknown>(url: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T = unknown>(url: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  private async request<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Ensure we have a valid token or session
      const hasValidAuth = await this.refreshTokenIfNeeded()
      if (!hasValidAuth) {
        return {
          error: 'No valid authentication found',
          status: 401
        }
      }

      const token = this.getAuthToken()
      const headers = new Headers(options.headers)

      // Set default headers
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json')
      }

      // Add authorization header for localStorage tokens
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      console.log(`API ${options.method || 'GET'}: ${url}`)
      console.log('Auth token present:', !!token)
      console.log('NextAuth session present:', !!this.session)

      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
      console.log('Full URL:', fullUrl)
      console.log('Request headers:', Object.fromEntries(headers.entries()))
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for NextAuth session
        mode: 'cors' // Explicitly set CORS mode
      })

      console.log(`Response status: ${response.status}`)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Handle authentication errors
      if (response.status === 401) {
        // For OAuth users, don't clear session - let NextAuth handle it
        if (!this.session) {
          // Clear invalid tokens only for localStorage auth
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }

        return {
          error: 'Authentication failed. Please log in again.',
          status: 401
        }
      }

      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status}`
        
        // Special handling for common errors
        if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. This might be a CORS issue.'
        } else if (response.status === 0 || response.type === 'opaque') {
          errorMessage = 'Network error or CORS issue. Check if the backend server is running.'
        }
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // If we can't parse the error response, use the default message
        }

        console.error('API Error:', errorMessage, { status: response.status, url: fullUrl })

        return {
          error: errorMessage,
          status: response.status
        }
      }

      // Parse successful response
      try {
        const data = await response.json()
        return {
          data,
          status: response.status
        }
      } catch {
        // If response is not JSON, return success with empty data
        return {
          data: {} as T,
          status: response.status
        }
      }

    } catch (error) {
      console.error('API request error:', error)
      
      let errorMessage = 'Network error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle specific CORS and network errors
        if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
          errorMessage = 'CORS error: Unable to connect to backend. Check if the backend server is running on the correct port.'
        } else if (error.message.includes('Load failed') || error.message.includes('fetch')) {
          errorMessage = 'Failed to connect to backend server. Please check if the server is running at ' + this.baseURL
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        }
      }
      
      return {
        error: errorMessage,
        status: 0
      }
    }
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// React hook for using the API client
export function useApi() {
  const { logout, user } = useAuth()
  const { data: session, status } = useSession()

  // Set the session in the API client
  if (session) {
    apiClient.setSession(session)
  }

  const handleApiError = useCallback((error: ApiResponse) => {
    if (error.status === 401) {
      // Only automatically log out for localStorage-based auth
      // For OAuth users, let NextAuth handle the session
      if (user || (!session && status !== 'loading')) {
        logout()
      }
    }
    return error
  }, [logout, user, session, status])

  return useMemo(() => ({
    get: <T = unknown>(url: string, options?: RequestInit) =>
      apiClient.get<T>(url, options).then(result => {
        if (result.error) return handleApiError(result)
        return result
      }),

    post: <T = unknown>(url: string, data?: unknown, options?: RequestInit) =>
      apiClient.post<T>(url, data, options).then(result => {
        if (result.error) return handleApiError(result)
        return result
      }),

    put: <T = unknown>(url: string, data?: unknown, options?: RequestInit) =>
      apiClient.put<T>(url, data, options).then(result => {
        if (result.error) return handleApiError(result)
        return result
      }),

    delete: <T = unknown>(url: string, options?: RequestInit) =>
      apiClient.delete<T>(url, options).then(result => {
        if (result.error) return handleApiError(result)
        return result
      })
  }), [handleApiError])
}
