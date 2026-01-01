'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }

      try {
        const response = await axios.post(`${API_URL}/api/auth/verify-email`, { token })
        setStatus('success')
        setMessage(response.data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo.png"
              alt="PortSmith Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Email Verification</h1>
          <p className="text-gray-600 dark:text-gray-300">Verifying your email address</p>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              {status === 'loading' && (
                <div className="bg-blue-100 dark:bg-blue-900 w-full h-full rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100 dark:bg-green-900 w-full h-full rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-100 dark:bg-red-900 w-full h-full rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-center text-2xl">
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Verification Successful!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>

            {status === 'success' && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>You will be redirected to the login page in a few seconds...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Your verification link may have expired or is invalid.</p>
                <p>Please request a new verification email from the login page.</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            {status === 'success' && (
              <Button asChild className="w-full">
                <Link href="/login">
                  Go to Login
                </Link>
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button asChild className="w-full">
                  <Link href="/signup">
                    Sign Up Again
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    Go to Login
                  </Link>
                </Button>
              </>
            )}

            {status === 'loading' && (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}