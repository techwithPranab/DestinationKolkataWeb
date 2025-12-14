"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Megaphone, Tag, Calendar, Save, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'
import { useApi } from '@/lib/api-client'

export default function CreatePromotion() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: '',
    discountValue: '',
    originalPrice: '',
    discountedPrice: '',
    category: '',
    businessName: '',
    businessType: '',
    address: '',
    city: 'Kolkata',
    startDate: '',
    endDate: '',
    terms: '',
    contactEmail: '',
    contactPhone: '',
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[]
  })

  useEffect(() => {
    const id = searchParams.get('edit')
    if (id) {
      setIsEdit(true)
      setEditId(id)
      loadSubmissionForEdit(id)
    }
  }, [searchParams])

  const loadSubmissionForEdit = async (id: string) => {
    try {
      setLoading(true)
      const result = await api.get(`/api/customer/submissions/${id}`)
      
      if (result.error) {
        throw new Error(result.error)
      }

      interface SubmissionData {
        data?: Record<string, unknown>
        category?: string
      }
      
      const submission = result.data as SubmissionData
      if (submission) {
        // The form data is stored in the submission object
        // Check if data is nested or directly in the submission
        const data = submission.data?.data || submission
        
        // Verify this is a promotion submission
        if (submission.category && submission.category !== 'promotion') {
          setError(`This is a ${submission.category} submission, not a promotion. Please edit it from the correct form.`)
          return
        }
        
        // Pre-populate form with existing data
        const formData = data as Record<string, unknown>
        setFormData({
          title: (formData.title as string) || '',
          description: (formData.description as string) || '',
          discountType: (formData.discountType as string) || '',
          discountValue: (formData.discountValue as string) || '',
          originalPrice: (formData.originalPrice as string) || '',
          discountedPrice: (formData.discountedPrice as string) || '',
          category: (formData.category as string) || '',
          businessName: (formData.businessName as string) || '',
          businessType: (formData.businessType as string) || '',
          address: (formData.address as string) || '',
          city: (formData.city as string) || 'Kolkata',
          startDate: (formData.startDate as string) || '',
          endDate: (formData.endDate as string) || '',
          terms: (formData.terms as string) || '',
          contactEmail: (formData.contactEmail as string) || '',
          contactPhone: (formData.contactPhone as string) || '',
          images: (formData.images as { url: string; alt?: string; isPrimary?: boolean }[]) || []
        })
      }
    } catch (err) {
      console.error('Failed to load submission data:', err)
      setError('Failed to load submission data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Promotion title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.discountType) {
      setError('Discount type is required')
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, submitForApproval = false) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      let result
      if (isEdit && editId) {
        if (submitForApproval) {
          // Submit for admin approval
          result = await api.post(`/api/customer/submissions/${editId}/submit-for-approval`, {
            data: formData
          })
          
          if (result.error) {
            throw new Error(result.error || 'Failed to submit for approval')
          }
        } else {
          // Update existing submission
          result = await api.put(`/api/customer/submissions/${editId}`, {
            data: formData // Store form data in the data field
          })
          
          if (result.error) {
            throw new Error(result.error || 'Failed to update promotion')
          }
        }
      } else {
        // Create new submission
        result = await api.post('/api/customer/submissions/promotion', formData)
        
        if (result.error) {
          throw new Error(result.error || 'Failed to submit promotion')
        }
      }

      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to dashboard with success message
      let message = ''
      if (submitForApproval) {
        message = 'Promotion submitted for admin approval successfully!'
      } else if (isEdit) {
        message = 'Promotion updated successfully. If this was an approved listing, it is now pending admin re-review.'
      } else {
        message = 'Promotion submitted successfully and is pending approval'
      }
      
      router.push(`/customer/listings?message=${encodeURIComponent(message)}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit promotion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForApproval = (e: React.FormEvent) => {
    handleSubmit(e, true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update your promotional offer details' : 'Add a new promotional offer to attract customers'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Promotion Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter promotion title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your promotional offer"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select promotion category" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Discount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Pricing & Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select value={formData.discountType} onValueChange={(value) => handleSelectChange('discountType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                  <SelectItem value="buy-one-get-one">Buy One Get One</SelectItem>
                  <SelectItem value="free-item">Free Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.discountType === 'percentage' || formData.discountType === 'fixed') && (
              <div>
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'} *
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="Original price"
                />
              </div>
              <div>
                <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                <Input
                  id="discountedPrice"
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  placeholder="Final price after discount"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter business name"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                placeholder="e.g., Restaurant, Hotel, Store"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter business address"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Validity Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                placeholder="Enter terms and conditions for this promotion"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Contact phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
              folder={getCloudinaryFolder('general')}
              subfolder={formData.title ? generateSlug(formData.title) : 'unnamed-promotion'}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          {isEdit && (
            <Button
              type="button"
              onClick={handleSubmitForApproval}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting for Approval...
                </>
              ) : (
                <>
                  <Percent className="w-4 h-4 mr-2" />
                  Submit for Admin Approval
                </>
              )}
            </Button>
          )}
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Updating Promotion...' : 'Creating Promotion...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Save Changes' : 'Create Promotion'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
