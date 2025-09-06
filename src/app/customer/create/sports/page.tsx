"use client"

import React, { useState } from 'react'
import { Trophy, Users, Clock, MapPin, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'

export default function CreateSports() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportType: '',
    category: '',
    academyName: '',
    coachName: '',
    experience: '',
    address: '',
    city: 'Kolkata',
    facilities: '',
    ageGroup: '',
    classSize: '',
    duration: '',
    frequency: '',
    price: '',
    contactEmail: '',
    contactPhone: '',
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[]
  })

  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          // Send images as JSON string since they're already uploaded to Cloudinary
          submitData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      // Implement sports academy creation API
      console.log('Creating sports academy:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Redirect to dashboard or show success message
    } catch (error) {
      console.error('Error creating sports academy:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Sports Academy</h1>
        <p className="text-gray-600 mt-1">Add your sports academy or coaching center to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Academy Name *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter academy name"
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
                placeholder="Describe your sports academy"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sportType">Sport Type *</Label>
                <Select value={formData.sportType} onValueChange={(value) => handleSelectChange('sportType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academy">Sports Academy</SelectItem>
                    <SelectItem value="coaching">Coaching Center</SelectItem>
                    <SelectItem value="club">Sports Club</SelectItem>
                    <SelectItem value="school">School Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coach Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Coach & Staff Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coachName">Head Coach Name</Label>
              <Input
                id="coachName"
                name="coachName"
                value={formData.coachName}
                onChange={handleInputChange}
                placeholder="Enter head coach name"
              />
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Years of coaching experience"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location & Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter academy address"
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

            <div>
              <Label htmlFor="facilities">Facilities</Label>
              <Textarea
                id="facilities"
                name="facilities"
                value={formData.facilities}
                onChange={handleInputChange}
                placeholder="Describe available facilities (e.g., training ground, equipment, changing rooms)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ageGroup">Age Group</Label>
                <Input
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  placeholder="e.g., 5-12 years, Adults"
                />
              </div>

              <div>
                <Label htmlFor="classSize">Class Size</Label>
                <Input
                  id="classSize"
                  name="classSize"
                  type="number"
                  value={formData.classSize}
                  onChange={handleInputChange}
                  placeholder="Maximum students per class"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Session Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 1 hour, 2 hours"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleSelectChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="weekends">Weekends Only</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Monthly/Annual fee"
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
            <CardTitle>Sports Academy Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
              folder={getCloudinaryFolder('sports')}
              subfolder={formData.title ? generateSlug(formData.title) : 'unnamed-sports-academy'}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Academy...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Sports Academy
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
