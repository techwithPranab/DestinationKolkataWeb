"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Building, Save, Upload, Link2, Bell, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

interface ProfileData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  businessName?: string
  businessType?: string
  city?: string
  profile?: {
    bio?: string
    avatar?: string
    website?: string
    socialMedia?: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
    preferences?: {
      language?: string
      currency?: string
      timezone?: string
      newsletter?: boolean
      marketingEmails?: boolean
      bookingReminders?: boolean
      reviewNotifications?: boolean
    }
    privacy?: {
      profileVisibility?: 'public' | 'private'
      showEmail?: boolean
      showPhone?: boolean
    }
  }
}

export default function CustomerProfile() {
  const { user } = useAuth()
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    city: '',
    bio: '',
    website: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    newsletter: true,
    marketingEmails: false,
    bookingReminders: true,
    reviewNotifications: true,
    profileVisibility: 'public' as 'public' | 'private',
    showEmail: false,
    showPhone: false
  })

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile data...')

      const response = await api.get('/api/customer/profile')

      if (response.data) {
        console.log('Profile data received:', response.data)
        const profile = (response.data as { profile: ProfileData }).profile

        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          businessName: profile.businessName || '',
          businessType: profile.businessType || '',
          city: profile.city || '',
          bio: profile.profile?.bio || '',
          website: profile.profile?.website || '',
          facebook: profile.profile?.socialMedia?.facebook || '',
          twitter: profile.profile?.socialMedia?.twitter || '',
          instagram: profile.profile?.socialMedia?.instagram || '',
          linkedin: profile.profile?.socialMedia?.linkedin || '',
          language: profile.profile?.preferences?.language || 'en',
          currency: profile.profile?.preferences?.currency || 'INR',
          timezone: profile.profile?.preferences?.timezone || 'Asia/Kolkata',
          newsletter: profile.profile?.preferences?.newsletter ?? true,
          marketingEmails: profile.profile?.preferences?.marketingEmails ?? false,
          bookingReminders: profile.profile?.preferences?.bookingReminders ?? true,
          reviewNotifications: profile.profile?.preferences?.reviewNotifications ?? true,
          profileVisibility: (profile.profile?.privacy?.profileVisibility as 'public' | 'private') || 'public',
          showEmail: profile.profile?.privacy?.showEmail ?? false,
          showPhone: profile.profile?.privacy?.showPhone ?? false
        })
      } else {
        console.error('Failed to load profile data:', response.error)
        alert(`Failed to load profile: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      alert(`Error loading profile: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Updating profile...')

      const response = await api.put('/api/customer/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        city: formData.city,
        profile: {
          bio: formData.bio,
          website: formData.website,
          socialMedia: {
            facebook: formData.facebook,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin
          },
          preferences: {
            language: formData.language,
            currency: formData.currency,
            timezone: formData.timezone,
            newsletter: formData.newsletter,
            marketingEmails: formData.marketingEmails,
            bookingReminders: formData.bookingReminders,
            reviewNotifications: formData.reviewNotifications
          },
          privacy: {
            profileVisibility: formData.profileVisibility,
            showEmail: formData.showEmail,
            showPhone: formData.showPhone
          },
          updatedAt: new Date().toISOString()
        }
      })

      if (response.data) {
        console.log('Profile updated successfully:', response.data)
        alert('Profile updated successfully!')
      } else {
        console.error('Failed to update profile:', response.error)
        alert(`Failed to update profile: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Error updating profile: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.city,
      formData.bio,
      formData.businessName
    ]
    const filledFields = fields.filter(field => field && field.trim().length > 0).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const completeness = calculateCompleteness()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Completeness */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Profile Completeness</h3>
              <p className="text-sm text-gray-600">Complete your profile to get better recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{completeness}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="social">Social & Web</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your city"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    placeholder="e.g., Hotel, Restaurant, Event Management"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social & Web Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website & Social Media</CardTitle>
                <p className="text-sm text-gray-600">Connect your online presence</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="Facebook profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="Instagram profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="Asia/Mumbai">Asia/Mumbai</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-gray-600">Choose what notifications you&apos;d like to receive</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Newsletter</Label>
                    <p className="text-sm text-gray-600">Receive our monthly newsletter</p>
                  </div>
                  <Switch
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Special offers and promotions</p>
                  </div>
                  <Switch
                    checked={formData.marketingEmails}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-gray-600">Reminders about upcoming bookings</p>
                  </div>
                  <Switch
                    checked={formData.bookingReminders}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookingReminders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Review Notifications</Label>
                    <p className="text-sm text-gray-600">Notifications about your reviews</p>
                  </div>
                  <Switch
                    checked={formData.reviewNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reviewNotifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <p className="text-sm text-gray-600">Control who can see your information</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={formData.profileVisibility} 
                    onValueChange={(value: 'public' | 'private') => setFormData(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                      <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-gray-600">Allow others to see your email</p>
                  </div>
                  <Switch
                    checked={formData.showEmail}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-gray-600">Allow others to see your phone</p>
                  </div>
                  <Switch
                    checked={formData.showPhone}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPhone: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Account Type</Label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Customer Account
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Membership Status</Label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {user?.membershipType || 'Free'} Plan
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button - appears on all tabs */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
