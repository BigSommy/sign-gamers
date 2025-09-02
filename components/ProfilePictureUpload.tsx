'use client'

import React, { useState, useRef } from 'react'
import { FaCamera, FaUpload, FaTimes } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageChange?: (file: File) => void
  className?: string
  onSaved?: (url: string) => void
}

export default function ProfilePictureUpload({ 
  currentImageUrl, 
  onImageChange, 
  className = 'w-24 h-24',
  onSaved,
}: ProfilePictureUploadProps) {
  const { user, session } = useAuth()
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isHovered, setIsHovered] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onImageChange?.(file)

    if (!user) return

    try {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)

      const headers: Record<string, string> = {}
      const token = session?.access_token
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed')
      }
      onSaved?.(data.url)
    } catch (e: any) {
      alert(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <div
        className={`${className} relative rounded-full overflow-hidden transition-all duration-200 ${
          isHovered ? 'ring-4 ring-orange-400' : 'ring-2 ring-gray-600'
        } ${uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-orange-400/20 flex items-center justify-center">
            <FaCamera className="text-orange-400 text-2xl" />
          </div>
        )}

        {isHovered && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <FaUpload className="text-white text-xl" />
          </div>
        )}

        {previewUrl && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveImage()
            }}
            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400">
          {uploading ? 'Uploading...' : 'Click to upload image'}
        </p>
        <p className="text-xs text-gray-500">
          Max 5MB, JPG/PNG
        </p>
      </div>
    </div>
  )
}
