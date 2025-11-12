'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios, { AxiosInstance } from 'axios'

// Types
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  axiosInstance: AxiosInstance
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance with default config
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
  })

  return instance
}

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [axiosInstance] = useState(() => createAxiosInstance())

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor - add token to requests
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle token refresh
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
              throw new Error('No refresh token')
            }

            // Try to refresh the token
            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              { refreshToken },
              { withCredentials: true }
            )

            const { accessToken } = response.data
            localStorage.setItem('accessToken', accessToken)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return axiosInstance(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout user
            setUser(null)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            router.push('/login')
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    // Cleanup interceptors on unmount
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }, [axiosInstance, router])

  // Fetch current user from backend
  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [axiosInstance])

  // Initialize auth state on mount - only if we have tokens
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken) {
      // We have a token, try to fetch user data
      refreshUser()
    } else {
      // No token, just mark as not loading
      setIsLoading(false)
    }
  }, [refreshUser])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      })

      const { user: userData, accessToken, refreshToken } = response.data
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser(userData)
      
      // Force a hard redirect to dashboard to ensure middleware runs
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [axiosInstance])

  // Register function
  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
      })

      const { user: userData, accessToken, refreshToken } = response.data
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser(userData)
      
      // Force a hard redirect to dashboard to ensure middleware runs
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [axiosInstance])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API success
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.push('/login')
    }
  }, [router, axiosInstance])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    axiosInstance,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
