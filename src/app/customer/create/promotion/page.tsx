"use client"

import React, { useState } from 'react'
import { Megaphone, Tag, Calendar, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreatePromotion() {
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
    contactPhone: ''
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
      // Implement promotion creation API
      console.log('Creating promotion:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Redirect to dashboard or show success message
    } catch (error) {
      console.error('Error creating promotion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Promotion</h1>
        <p className="text-gray-600 mt-1">Add a new promotional offer to attract customers</p>
      </div>

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
                <SelectContent>
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
                <SelectContent>
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
                Creating Promotion...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Promotion
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
