"use client"
import { fetchAPI } from '@/lib/backend-api'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ImageUploadProps {
  readonly images: ReadonlyArray<{ url: string; alt?: string; isPrimary?: boolean }>
  readonly onImagesChange: (images: Array<{ url: string; alt?: string; isPrimary?: boolean }>) => void
  readonly maxImages?: number
  readonly folder?: string
  readonly subfolder?: string
}

interface UploadedImage {
  url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  folder = 'general',
  subfolder
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)

    // Validate files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        alert(file.name + ' is not a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(file.name + ' is too large. Maximum size is 5MB')
        return
      }
    }

    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      alert('You can only upload up to ' + maxImages + ' images')
      return
    }

    setUploading(true)

    try {
      for (const file of fileArray) {
        const formData = new FormData()
        formData.append('file', file)

        // Construct full folder path with subfolder if provided
        const fullFolder = subfolder ? folder + '/' + subfolder : folder
        formData.append('folder', fullFolder)

        const response = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') + '/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload ' + file.name)
        }

        const result: UploadedImage = await response.json()
        onImagesChange([
          ...images,
          {
            url: result.url,
            alt: file.name,
            isPrimary: images.length === 0 && fileArray.indexOf(file) === 0 // First image is primary by default
          }
        ])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageToRemove: { url: string; alt?: string }) => {
    // If image is from Cloudinary, delete from Cloudinary first
    if (imageToRemove.url.includes('cloudinary')) {
      try {
        const publicId = imageToRemove.url.split('/').pop()?.split('.')[0]
        if (publicId) {
          await fetchAPI('/api/upload?public_id=' + publicId, {
            method: 'DELETE',
          })
        }
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
      }
    }

    // Remove from local state
    onImagesChange(images.filter(img => img.url !== imageToRemove.url))
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <button
          type="button"
          className={'border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full ' + (
            dragActive
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
        >
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB each ({images.length}/{maxImages} uploaded)
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.url + '-' + index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt || 'Image ' + (index + 1)}
                    fill
                    className="object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {image.isPrimary && (
                    <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
