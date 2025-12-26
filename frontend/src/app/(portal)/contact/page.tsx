'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Mail, MessageSquare, User, FileText } from 'lucide-react'
import ScrollNavbar from '@/components/Landing/scroll-navbar'
import Footer from '@/components/Landing/Footer'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ContactPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Pre-populate form from URL parameters
  useEffect(() => {
    const requestType = searchParams.get('type')
    if (requestType === 'api') {
      setSubject('API Request')
      setMessage(`Hello PortSmith Team,\n\nI would like to request the following API to be added to your platform:\n\nAPI Name: [Enter API name here]\n\nAPI Description: [Brief description of what this API does]\n\nAPI Documentation URL (if available): [Enter URL here]\n\nUse Case: [Explain how you plan to use this API]\n\nThank you for considering my request!\n\nBest regards`)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    // Validation
    if (!name || !email || !message) {
      setError('Please fill in all required fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long')
      return
    }

    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/apis/contact`, {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || undefined,
        message: message.trim(),
        sendTo: sendTo.trim()
      })
      
      setSuccess(true)
      // Clear form
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      
      // Optionally redirect after success
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = isLoading || !name || !email || !message

  return (
    <>
      <ScrollNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-24">
        <div className="w-full max-w-2xl">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3 text-gray-800 dark:text-white">Get in Touch</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                      Message sent successfully! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || success}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || success}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Subject (Optional)
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isLoading || success}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading || success}
                    required
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum 10 characters
                  </p>
                </div>

                {/* Hidden sendTo field - can be made visible if needed */}
                <input
                  type="hidden"
                  id="sendTo"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitDisabled || success}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Need immediate help?{' '}
                  <Link
                    href="/docs"
                    className="text-primary hover:underline font-medium"
                  >
                    Check our documentation
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Additional Contact Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-muted-foreground">
                      support@portsmith.dev
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Visit our comprehensive docs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
