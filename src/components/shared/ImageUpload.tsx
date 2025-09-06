"use client"

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
  maxImages = 10,
  folder = 'general',
  subfolder
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Validate files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`)
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(`${file.name} is too large. Maximum size is 5MB`)
        return
      }
    }

    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        // Construct full folder path with subfolder if provided
        const fullFolder = subfolder ? `${folder}/${subfolder}` : folder
        formData.append('folder', fullFolder)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result: UploadedImage = await response.json()
        return {
          url: result.url,
          alt: file.name,
          isPrimary: images.length === 0 && fileArray.indexOf(file) === 0 // First image is primary by default
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      onImagesChange([...images, ...uploadedImages])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

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

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    // If the image has a public_id, delete from Cloudinary
    if (imageToRemove.url.includes('cloudinary')) {
      try {
        const publicId = imageToRemove.url.split('/').pop()?.split('.')[0]
        if (publicId) {
          await fetch(`/api/upload?public_id=${publicId}`, {
            method: 'DELETE',
          })
        }
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <label htmlFor="file-upload" className="cursor-pointer block">
              <button
                type="button"
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full ${
                  dragActive
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-600">Uploading images...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, WebP up to 5MB each
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={images.length >= maxImages}
                      onClick={(e) => e.preventDefault()}
                    >
                      Select Images
                    </Button>
                  </div>
                )}
              </button>
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={`${image.url}-${index}`} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover rounded"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={image.isPrimary ? "default" : "outline"}
                    onClick={() => setPrimaryImage(index)}
                    className="text-xs"
                  >
                    {image.isPrimary ? 'Primary' : 'Set Primary'}
                  </Button>
                  <span className="text-xs text-gray-500">
                    {index + 1}/{images.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-600">
        {images.length} of {maxImages} images uploaded
      </div>
    </div>
  )
}
