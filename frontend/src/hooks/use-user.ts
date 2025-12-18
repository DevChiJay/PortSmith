'use client'

import { useAuth } from '@/lib/auth-context'

/**
 * Custom hook for accessing user information
 * Replaces Clerk's useUser hook with JWT-based authentication
 * 
 * @returns Object containing user data, loading state, and authentication status
 */
export function useUser() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    } : null,
    isLoading,
    isSignedIn: isAuthenticated,
  }
}
