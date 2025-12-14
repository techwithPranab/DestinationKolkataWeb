"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Save, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'
import { useApi } from '@/lib/api-client'

export default function CreateEvent() {
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
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    address: '',
    city: 'Kolkata',
    capacity: '',
    price: '',
    organizer: '',
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
        const data = submission.data || {}
        
        // Verify this is an event submission
        if (submission.category && submission.category !== 'event') {
          setError(`This is a ${submission.category} submission, not an event. Please edit it from the correct form.`)
          return
        }
        
        // Pre-populate form with existing data
        setFormData({
          title: data.title as string || '',
          description: data.description as string || '',
          category: data.category as string || '',
          startDate: data.startDate as string || '',
          startTime: data.startTime as string || '',
          endDate: data.endDate as string || '',
          endTime: data.endTime as string || '',
          venue: data.venue as string || '',
          address: data.address as string || '',
          city: data.city as string || 'Kolkata',
          capacity: data.capacity as string || '',
          price: data.price as string || '',
          organizer: data.organizer as string || '',
          contactEmail: data.contactEmail as string || '',
          contactPhone: data.contactPhone as string || '',
          images: data.images as { url: string; alt?: string; isPrimary?: boolean }[] || []
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
      setError('Event title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Event description is required')
      return false
    }
    if (!formData.startDate) {
      setError('Start date is required')
      return false
    }
    if (!formData.startTime) {
      setError('Start time is required')
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
            throw new Error(result.error || 'Failed to update event')
          }
        }
      } else {
        // Create new submission
        result = await api.post('/api/customer/submissions/event', formData)
        
        if (result.error) {
          throw new Error(result.error || 'Failed to submit event')
        }
      }

      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to dashboard with success message
      let message = ''
      if (submitForApproval) {
        message = 'Event submitted for admin approval successfully!'
      } else if (isEdit) {
        message = 'Event updated successfully. If this was an approved listing, it is now pending admin re-review.'
      } else {
        message = 'Event submitted successfully and is pending approval'
      }
      
      router.push(`/customer/listings?message=${encodeURIComponent(message)}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit event')
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
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update your event details' : 'Add a new event to the Destination Kolkata platform'}
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
              <Calendar className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
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
                placeholder="Describe your event"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="sports">Sports Event</SelectItem>
                  <SelectItem value="exhibition">Exhibition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Date & Time
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
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venue & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Venue & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="venue">Venue Name *</Label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
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

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum attendees"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0 for free events"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organizer">Organizer Name</Label>
              <Input
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Event organizer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <CardTitle>Event Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
              folder={getCloudinaryFolder('events')}
              subfolder={formData.title ? generateSlug(formData.title) : 'unnamed-event'}
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
                  <PartyPopper className="w-4 h-4 mr-2" />
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
                {isEdit ? 'Updating Event...' : 'Creating Event...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Save Changes' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
