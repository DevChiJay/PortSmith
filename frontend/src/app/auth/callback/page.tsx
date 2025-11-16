'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');
    
    if (error) {
      // Handle error - redirect to login with error message
      const errorMessages: { [key: string]: string } = {
        'google_auth_failed': 'Google authentication failed. Please try again.',
        'authentication_failed': 'Authentication failed. Please try again.',
      };
      
      const errorMessage = errorMessages[error] || 'An error occurred during authentication.';
      router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
      return;
    }
    
    if (accessToken && refreshToken) {
      // Store both tokens in localStorage (using consistent keys with auth-context)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else if (accessToken) {
      // Fallback: Store only access token if refresh token is missing
      localStorage.setItem('accessToken', accessToken);
      router.push('/dashboard');
    } else {
      // No tokens and no error - redirect to login
      router.push('/login?error=authentication_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
}
