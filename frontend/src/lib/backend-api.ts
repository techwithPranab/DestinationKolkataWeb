// Backend API utility functions

/**
 * Get the backend API base URL from environment variables
 */
export const getBackendURL = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
}

/**
 * Build a complete API URL with the backend base URL
 * @param path - API path (e.g., '/api/admin/login')
 */
export const buildApiURL = (path: string): string => {
  const baseURL = getBackendURL()
  // Remove leading slash if present since baseURL should not end with slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseURL}/${cleanPath}`
}

/**
 * Get authentication headers for API requests
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken')
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  return {
    'Content-Type': 'application/json'
  }
}

/**
 * Fetch with backend URL automatically applied
 * @param path - API path (e.g., '/api/admin/login')
 * @param options - Fetch options
 */
export const fetchAPI = (path: string, options?: RequestInit): Promise<Response> => {
  return fetch(buildApiURL(path), options)
}

/**
 * Fetch with authentication headers automatically applied
 * @param path - API path (e.g., '/api/admin/dashboard')
 * @param options - Fetch options (auth headers will be merged)
 */
export const fetchAuthenticatedAPI = (path: string, options?: RequestInit): Promise<Response> => {
  const authHeaders = getAuthHeaders()
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options?.headers
    }
  }
  return fetch(buildApiURL(path), mergedOptions)
}
