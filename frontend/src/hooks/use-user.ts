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
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      createdAt: user.createdAt,
    } : null,
    isLoading,
    isSignedIn: isAuthenticated,
  }
}
