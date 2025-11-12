'use client'

import { useCallback, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

interface UseApiClientReturn {
  request: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook for making API requests with automatic token refresh
 * Handles authentication tokens, retries on 401, and provides loading/error states
 */
export function useApiClient(): UseApiClientReturn {
  const { refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Refresh the access token using the refresh token
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        return data.accessToken
      }

      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }, [])

  /**
   * Make an authenticated API request
   */
  const request = useCallback(
    async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
      const { skipAuth = false, ...fetchOptions } = options
      
      setIsLoading(true)
      setError(null)

      try {
        // Prepare headers
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        }

        // Add authorization header if not skipping auth
        if (!skipAuth) {
          const accessToken = localStorage.getItem('accessToken')
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
          }
        }

        // Make the request
        let response = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          credentials: 'include',
          headers,
        })

        // If unauthorized, try to refresh token and retry
        if (response.status === 401 && !skipAuth) {
          const newAccessToken = await refreshAccessToken()
          
          if (newAccessToken) {
            // Retry the request with new token
            headers['Authorization'] = `Bearer ${newAccessToken}`
            
            response = await fetch(`${API_URL}${endpoint}`, {
              ...fetchOptions,
              credentials: 'include',
              headers,
            })
          } else {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            throw new Error('Session expired. Please login again.')
          }
        }

        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.message || `Request failed with status ${response.status}`
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        // Parse and return the response
        const data = await response.json()
        
        // Refresh user data after successful requests that might change auth state
        if (['POST', 'PUT', 'DELETE'].includes(fetchOptions.method || 'GET')) {
          await refreshUser()
        }
        
        return data as T
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [refreshAccessToken, refreshUser]
  )

  return {
    request,
    isLoading,
    error,
  }
}

/**
 * Utility function for making API requests outside of React components
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (!skipAuth) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  })

  if (response.status === 401 && !skipAuth) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken')
    
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json()
      localStorage.setItem('accessToken', refreshData.accessToken)
      
      // Retry original request
      headers['Authorization'] = `Bearer ${refreshData.accessToken}`
      
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        credentials: 'include',
        headers,
      })

      if (!retryResponse.ok) {
        throw new Error(`Request failed with status ${retryResponse.status}`)
      }

      return await retryResponse.json()
    } else {
      // Refresh failed
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Request failed with status ${response.status}`)
  }

  return await response.json()
}
