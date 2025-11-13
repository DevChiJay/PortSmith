'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface AvatarUploadProps {
  currentAvatar?: string
  fullName: string
  onAvatarChange: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AvatarUpload({ currentAvatar, fullName, onAvatarChange, size = 'xl' }: AvatarUploadProps) {
  const { axiosInstance } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await axiosInstance.post('/api/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        onAvatarChange(response.data.avatar_url)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload avatar')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    setError('')
    setIsUploading(true)

    try {
      const response = await axiosInstance.delete('/api/auth/avatar')

      if (response.data.success) {
        setPreviewUrl(null)
        onAvatarChange('')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const displayAvatar = previewUrl || currentAvatar

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayAvatar} alt={fullName} />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className={`${iconSizes[size]} animate-spin text-white`} />
          </div>
        )}

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
        </Button>

        {displayAvatar && !isUploading && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-0 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveAvatar}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click the camera icon to upload a new photo
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          JPG, PNG, GIF or WebP. Max size 5MB
        </p>
      </div>
    </div>
  )
}
