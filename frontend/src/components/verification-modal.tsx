'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export function VerificationModal({ isOpen, onClose, email }: VerificationModalProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage(null)

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-verification`, { email })
      setResendMessage({
        type: 'success',
        text: response.data.message || 'Verification email has been resent!'
      })
    } catch (error: any) {
      setResendMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to resend email. Please try again.'
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center text-2xl">Check Your Email</DialogTitle>
          <DialogDescription className="text-center pt-2">
            We've sent a verification link to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">{email}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <p>Click the verification link in the email to activate your account</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <p>The link will expire in 24 hours</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <p>Check your spam folder if you don't see the email</p>
            </div>
          </div>

          {resendMessage && (
            <Alert variant={resendMessage.type === 'error' ? 'destructive' : 'default'}>
              {resendMessage.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{resendMessage.text}</AlertDescription>
            </Alert>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
