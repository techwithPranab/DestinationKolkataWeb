"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Check, 
  X, 
  ArrowLeft,
  Clock,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Megaphone,
  Trophy,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports' | 'attraction'
  title: string
  description: string
  status: 'pending' | 'pending_approval' | 'approved' | 'rejected'
  createdAt: string
  submittedBy?: {
    name: string
    email: string
    phone: string
  }
  submissionData: Record<string, unknown>
  adminNotes?: string
}

interface ContactInfo {
  phone?: string | string[];
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

interface LocationInfo {
  address?: string;
  coordinates?: [number, number];
}

interface AddressInfo {
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

interface SubmissionData {
  name?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  contact?: ContactInfo;
  location?: LocationInfo;
  address?: AddressInfo;
  checkInTime?: string;
  checkOutTime?: string;
  cuisine?: string;
  priceRange?: string | {
    min: number;
    max: number;
    currency: string;
  };
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  entryFee?: string;
  amenities?: string[];
  featured?: boolean;
  promoted?: boolean;
  cancellationPolicy?: string;
  policies?: string[];
  features?: string[];
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  // Promotion fields
  type?: string;
  promoCode?: string;
  discountType?: string;
  discountValue?: number;
  minimumPurchase?: number;
  validFrom?: string;
  validUntil?: string;
  termsAndConditions?: string;
  // Sports fields
  capacity?: number;
  facilities?: string[];
  bestTimeToVisit?: string;
  duration?: string;
}

export default function EditSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const submissionId = params.id as string
  
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState('')
  const [editData, setEditData] = useState<Record<string, unknown>>({})

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions/${submissionId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSubmission(data.submission)
        setAdminNotes(data.submission.adminNotes || '')
        setEditData(data.submission.submissionData || {})
      } else {
        setError('Failed to load submission details')
      }
    } catch (error) {
      console.error('Error fetching submission:', error)
      setError('Failed to load submission details')
    } finally {
      setLoading(false)
    }
  }, [submissionId])

  useEffect(() => {
    if (submissionId) {
      fetchSubmission()
    }
  }, [submissionId, fetchSubmission])

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!submission) return
    
    setActionLoading(action)
    
    try {
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions/${submission.id}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes
        })
      })

      if (response.ok) {
        // Navigate back to approvals page with success message
        router.push('/admin/approvals?success=' + action)
      } else {
        setError(`Failed to ${action} submission`)
      }
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error)
      setError(`Failed to ${action} submission`)
    } finally {
      setActionLoading(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      case 'promotion':
        return <Megaphone className="w-5 h-5" />
      case 'sports':
        return <Trophy className="w-5 h-5" />
      case 'attraction':
        return <MapPin className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const updateEditData = (key: string, value: unknown) => {
    setEditData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderHotelEditForm = () => {
    const data = editData as SubmissionData
    
    return (
      <div className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hotel-name">Hotel Name</Label>
            <Input
              id="hotel-name"
              value={data.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-category">Category</Label>
            <Select value={data.category || ''} onValueChange={(value) => updateEditData('category', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="budget">Budget Hotel</SelectItem>
                <SelectItem value="mid-range">Mid-range Hotel</SelectItem>
                <SelectItem value="luxury">Luxury Hotel</SelectItem>
                <SelectItem value="business">Business Hotel</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hotel-description">Description</Label>
          <Textarea
            id="hotel-description"
            value={data.description || ''}
            onChange={(e) => updateEditData('description', e.target.value)}
            rows={4}
            className="bg-white"
          />
        </div>

        <div>
          <Label htmlFor="hotel-short-description">Short Description</Label>
          <Textarea
            id="hotel-short-description"
            value={data.shortDescription || ''}
            onChange={(e) => updateEditData('shortDescription', e.target.value)}
            rows={2}
            className="bg-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hotel-phone">Phone</Label>
            <Input
              id="hotel-phone"
              value={Array.isArray(data.contact?.phone) ? data.contact.phone[0] || '' : data.contact?.phone || ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, phone: [e.target.value] })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-email">Email</Label>
            <Input
              id="hotel-email"
              type="email"
              value={data.contact?.email || ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, email: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hotel-website">Website (Optional)</Label>
          <Input
            id="hotel-website"
            type="url"
            value={data.contact?.website || ''}
            onChange={(e) => updateEditData('contact', { ...data.contact, website: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hotel-facebook">Facebook</Label>
            <Input
              id="hotel-facebook"
              value={data.contact?.socialMedia?.facebook || ''}
              onChange={(e) => updateEditData('contact', { 
                ...data.contact, 
                socialMedia: { ...data.contact?.socialMedia, facebook: e.target.value } 
              })}
              placeholder="Facebook URL"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-instagram">Instagram</Label>
            <Input
              id="hotel-instagram"
              value={data.contact?.socialMedia?.instagram || ''}
              onChange={(e) => updateEditData('contact', { 
                ...data.contact, 
                socialMedia: { ...data.contact?.socialMedia, instagram: e.target.value } 
              })}
              placeholder="Instagram URL"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-twitter">Twitter</Label>
            <Input
              id="hotel-twitter"
              value={data.contact?.socialMedia?.twitter || ''}
              onChange={(e) => updateEditData('contact', { 
                ...data.contact, 
                socialMedia: { ...data.contact?.socialMedia, twitter: e.target.value } 
              })}
              placeholder="Twitter URL"
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hotel-street">Street</Label>
            <Input
              id="hotel-street"
              value={data.address?.street || ''}
              onChange={(e) => updateEditData('address', { ...data.address, street: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-area">Area</Label>
            <Input
              id="hotel-area"
              value={data.address?.area || ''}
              onChange={(e) => updateEditData('address', { ...data.address, area: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hotel-city">City</Label>
            <Input
              id="hotel-city"
              value={data.address?.city || 'Kolkata'}
              onChange={(e) => updateEditData('address', { ...data.address, city: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-state">State</Label>
            <Input
              id="hotel-state"
              value={data.address?.state || 'West Bengal'}
              onChange={(e) => updateEditData('address', { ...data.address, state: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-pincode">Pincode</Label>
            <Input
              id="hotel-pincode"
              value={data.address?.pincode || ''}
              onChange={(e) => updateEditData('address', { ...data.address, pincode: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hotel-landmark">Landmark</Label>
          <Input
            id="hotel-landmark"
            value={data.address?.landmark || ''}
            onChange={(e) => updateEditData('address', { ...data.address, landmark: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hotel-price-min">Price Range (Min)</Label>
            <Input
              id="hotel-price-min"
              type="number"
              min="0"
              value={typeof data.priceRange === 'object' && data.priceRange ? data.priceRange.min || 0 : 0}
              onChange={(e) => {
                const currentPriceRange = typeof data.priceRange === 'object' && data.priceRange ? data.priceRange : { min: 0, max: 0, currency: 'INR' };
                updateEditData('priceRange', {
                  ...currentPriceRange,
                  min: parseInt(e.target.value) || 0
                });
              }}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-price-max">Price Range (Max)</Label>
            <Input
              id="hotel-price-max"
              type="number"
              min="0"
              value={typeof data.priceRange === 'object' && data.priceRange ? data.priceRange.max || 0 : 0}
              onChange={(e) => {
                const currentPriceRange = typeof data.priceRange === 'object' && data.priceRange ? data.priceRange : { min: 0, max: 0, currency: 'INR' };
                updateEditData('priceRange', {
                  ...currentPriceRange,
                  max: parseInt(e.target.value) || 0
                });
              }}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hotel-checkin">Check-in Time</Label>
            <Input
              id="hotel-checkin"
              type="time"
              value={data.checkInTime || ''}
              onChange={(e) => updateEditData('checkInTime', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="hotel-checkout">Check-out Time</Label>
            <Input
              id="hotel-checkout"
              type="time"
              value={data.checkOutTime || ''}
              onChange={(e) => updateEditData('checkOutTime', e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hotel-cancellation-policy">Cancellation Policy</Label>
          <Textarea
            id="hotel-cancellation-policy"
            value={data.cancellationPolicy || ''}
            onChange={(e) => updateEditData('cancellationPolicy', e.target.value)}
            rows={3}
            placeholder="Hotel's cancellation policy"
            className="bg-white"
          />
        </div>

        <div>
          <Label>Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {[
              'WiFi', 'Parking', 'AC', 'Swimming Pool', 'Gym', 'Restaurant',
              'Room Service', 'Laundry', 'Conference Room', 'Bar', 'Spa',
              'Airport Shuttle', 'Pet Friendly', 'Business Center'
            ].map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`hotel-${amenity}`}
                  checked={data.amenities?.includes(amenity) || false}
                  onChange={(e) => {
                    const currentAmenities = data.amenities || [];
                    if (e.target.checked) {
                      updateEditData('amenities', [...currentAmenities, amenity]);
                    } else {
                      updateEditData('amenities', currentAmenities.filter(a => a !== amenity));
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`hotel-${amenity}`} className="text-sm">{amenity}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hotel-featured"
              checked={data.featured || false}
              onChange={(e) => updateEditData('featured', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="hotel-featured">Featured Hotel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hotel-promoted"
              checked={data.promoted || false}
              onChange={(e) => updateEditData('promoted', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="hotel-promoted">Promoted Hotel</Label>
          </div>
        </div>
      </div>
    )
  }

  const renderRestaurantEditForm = () => {
    const data = editData as SubmissionData
    
    return (
      <div className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input
              id="restaurant-name"
              value={data.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="restaurant-cuisine">Cuisine Type</Label>
            <Select value={data.cuisine || ''} onValueChange={(value) => updateEditData('cuisine', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="bengali">Bengali</SelectItem>
                <SelectItem value="north-indian">North Indian</SelectItem>
                <SelectItem value="south-indian">South Indian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="continental">Continental</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="thai">Thai</SelectItem>
                <SelectItem value="fast-food">Fast Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="restaurant-description">Description</Label>
          <Textarea
            id="restaurant-description"
            value={data.description || ''}
            onChange={(e) => updateEditData('description', e.target.value)}
            rows={4}
            className="bg-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restaurant-phone">Phone</Label>
            <Input
              id="restaurant-phone"
              value={typeof data.contact?.phone === 'string' ? data.contact.phone : ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, phone: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="restaurant-email">Email</Label>
            <Input
              id="restaurant-email"
              type="email"
              value={data.contact?.email || ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, email: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="restaurant-website">Website (Optional)</Label>
          <Input
            id="restaurant-website"
            type="url"
            value={data.contact?.website || ''}
            onChange={(e) => updateEditData('contact', { ...data.contact, website: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restaurant-price">Price Range</Label>
            <Select value={typeof data.priceRange === 'string' ? data.priceRange : ''} onValueChange={(value) => updateEditData('priceRange', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="budget">₹ - Budget (Under ₹500)</SelectItem>
                <SelectItem value="moderate">₹₹ - Moderate (₹500-₹1500)</SelectItem>
                <SelectItem value="expensive">₹₹₹ - Expensive (₹1500+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="restaurant-address">Address</Label>
            <Input
              id="restaurant-address"
              value={data.location?.address || ''}
              onChange={(e) => updateEditData('location', { ...data.location, address: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restaurant-open-time">Opening Time</Label>
            <Input
              id="restaurant-open-time"
              type="time"
              value={data.openingHours?.monday?.open || data.openingHours?.tuesday?.open || ''}
              onChange={(e) => {
                const openingHours = data.openingHours || {};
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const updatedHours = { ...openingHours };
                days.forEach(day => {
                  updatedHours[day] = {
                    ...updatedHours[day],
                    open: e.target.value,
                    close: updatedHours[day]?.close || '22:00',
                    closed: updatedHours[day]?.closed || false
                  };
                });
                updateEditData('openingHours', updatedHours);
              }}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="restaurant-close-time">Closing Time</Label>
            <Input
              id="restaurant-close-time"
              type="time"
              value={data.openingHours?.monday?.close || data.openingHours?.tuesday?.close || ''}
              onChange={(e) => {
                const openingHours = data.openingHours || {};
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const updatedHours = { ...openingHours };
                days.forEach(day => {
                  updatedHours[day] = {
                    ...updatedHours[day],
                    open: updatedHours[day]?.open || '10:00',
                    close: e.target.value,
                    closed: updatedHours[day]?.closed || false
                  };
                });
                updateEditData('openingHours', updatedHours);
              }}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label>Features</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {[
              'WiFi', 'AC', 'Parking', 'Home Delivery', 'Takeaway', 'Live Music',
              'Outdoor Seating', 'Bar', 'Family Friendly', 'Pet Friendly', 'Vegetarian Only'
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`restaurant-${feature}`}
                  checked={data.features?.includes(feature) || false}
                  onChange={(e) => {
                    const currentFeatures = data.features || [];
                    if (e.target.checked) {
                      updateEditData('features', [...currentFeatures, feature]);
                    } else {
                      updateEditData('features', currentFeatures.filter(f => f !== feature));
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`restaurant-${feature}`} className="text-sm">{feature}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderEventEditForm = () => {
    const data = editData as SubmissionData
    
    return (
      <div className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              value={data.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="event-category">Category</Label>
            <Select value={data.category || ''} onValueChange={(value) => updateEditData('category', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={data.description || ''}
            onChange={(e) => updateEditData('description', e.target.value)}
            rows={4}
            className="bg-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event-date">Event Date</Label>
            <Input
              id="event-date"
              type="date"
              value={data.eventDate || ''}
              onChange={(e) => updateEditData('eventDate', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="event-time">Event Time</Label>
            <Input
              id="event-time"
              type="time"
              value={data.eventTime || ''}
              onChange={(e) => updateEditData('eventTime', e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="event-venue">Venue</Label>
          <Input
            id="event-venue"
            value={data.venue || ''}
            onChange={(e) => updateEditData('venue', e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event-contact">Contact</Label>
            <Input
              id="event-contact"
              value={typeof data.contact?.phone === 'string' ? data.contact.phone : ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, phone: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="event-price">Entry Fee</Label>
            <Input
              id="event-price"
              value={data.entryFee || ''}
              onChange={(e) => updateEditData('entryFee', e.target.value)}
              placeholder="Free or amount"
              className="bg-white"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderPromotionEditForm = () => {
    const data = editData as SubmissionData
    
    return (
      <div className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="promo-name">Promotion Name</Label>
            <Input
              id="promo-name"
              value={data.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="promo-type">Promotion Type</Label>
            <Select value={data.type || ''} onValueChange={(value) => updateEditData('type', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="flash_sale">Flash Sale</SelectItem>
                <SelectItem value="seasonal">Seasonal Offer</SelectItem>
                <SelectItem value="loyalty">Loyalty Reward</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="promo-code">Promo Code</Label>
            <Input
              id="promo-code"
              value={(data as Record<string, unknown>).promoCode as string || ''}
              onChange={(e) => updateEditData('promoCode', e.target.value)}
              className="bg-white"
              placeholder="e.g., SAVE20"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="promo-description">Description</Label>
          <Textarea
            id="promo-description"
            value={data.description || ''}
            onChange={(e) => updateEditData('description', e.target.value)}
            placeholder="Promotion details and description..."
            rows={3}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discount-type">Discount Type</Label>
            <Select value={(data as Record<string, unknown>).discountType as string || ''} onValueChange={(value) => updateEditData('discountType', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                <SelectItem value="free_item">Free Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discount-value">Discount Value</Label>
            <Input
              id="discount-value"
              type="number"
              value={(data as Record<string, unknown>).discountValue as string || ''}
              onChange={(e) => updateEditData('discountValue', parseFloat(e.target.value))}
              placeholder="Value"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="min-purchase">Minimum Purchase</Label>
            <Input
              id="min-purchase"
              type="number"
              value={(data as Record<string, unknown>).minimumPurchase as string || ''}
              onChange={(e) => updateEditData('minimumPurchase', parseFloat(e.target.value))}
              placeholder="Minimum purchase amount"
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="valid-from">Valid From</Label>
            <Input
              id="valid-from"
              type="date"
              value={(data as Record<string, unknown>).validFrom as string || ''}
              onChange={(e) => updateEditData('validFrom', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="valid-until">Valid Until</Label>
            <Input
              id="valid-until"
              type="date"
              value={(data as Record<string, unknown>).validUntil as string || ''}
              onChange={(e) => updateEditData('validUntil', e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            value={(data as Record<string, unknown>).termsAndConditions as string || ''}
            onChange={(e) => updateEditData('termsAndConditions', e.target.value)}
            placeholder="Terms and conditions..."
            rows={3}
            className="bg-white"
          />
        </div>
      </div>
    )
  }

  const renderSportsEditForm = () => {
    const data = editData as SubmissionData
    
    return (
      <div className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sports-name">Sports Facility Name</Label>
            <Input
              id="sports-name"
              value={data.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sports-type">Sport Type</Label>
            <Select value={data.category || ''} onValueChange={(value) => updateEditData('category', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="martial_arts">Martial Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sports-capacity">Capacity</Label>
            <Input
              id="sports-capacity"
              type="number"
              value={(data as Record<string, unknown>).capacity as string || ''}
              onChange={(e) => updateEditData('capacity', parseInt(e.target.value))}
              placeholder="Number of people"
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sports-description">Description</Label>
          <Textarea
            id="sports-description"
            value={data.description || ''}
            onChange={(e) => updateEditData('description', e.target.value)}
            placeholder="Sports facility details..."
            rows={3}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sports-street">Street</Label>
            <Input
              id="sports-street"
              value={data.address?.street || ''}
              onChange={(e) => updateEditData('address', { ...data.address, street: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sports-area">Area</Label>
            <Input
              id="sports-area"
              value={data.address?.area || ''}
              onChange={(e) => updateEditData('address', { ...data.address, area: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sports-city">City</Label>
            <Input
              id="sports-city"
              value={data.address?.city || 'Kolkata'}
              onChange={(e) => updateEditData('address', { ...data.address, city: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sports-phone">Phone</Label>
            <Input
              id="sports-phone"
              value={typeof data.contact?.phone === 'string' ? data.contact.phone : (data.contact?.phone?.[0] || '')}
              onChange={(e) => updateEditData('contact', { ...data.contact, phone: [e.target.value] })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sports-email">Email</Label>
            <Input
              id="sports-email"
              value={data.contact?.email || ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, email: e.target.value })}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sports-website">Website</Label>
            <Input
              id="sports-website"
              value={data.contact?.website || ''}
              onChange={(e) => updateEditData('contact', { ...data.contact, website: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label>Facilities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {['Changing Rooms', 'Showers', 'Lockers', 'Parking', 'Equipment', 'Cafeteria', 'First Aid', 'Professional Trainers'].map((facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`sports-${facility}`}
                  checked={(Array.isArray((data as Record<string, unknown>).facilities) ? ((data as Record<string, unknown>).facilities as string[]) : []).includes(facility)}
                  onChange={(e) => {
                    const currentFacilities = (Array.isArray((data as Record<string, unknown>).facilities) ? ((data as Record<string, unknown>).facilities as string[]) : []);
                    if (e.target.checked) {
                      updateEditData('facilities', [...currentFacilities, facility]);
                    } else {
                      updateEditData('facilities', currentFacilities.filter((f: string) => f !== facility));
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`sports-${facility}`} className="text-sm">{facility}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="best-time">Best Time to Visit</Label>
            <Input
              id="best-time"
              value={(data as Record<string, unknown>).bestTimeToVisit as string || ''}
              onChange={(e) => updateEditData('bestTimeToVisit', e.target.value)}
              placeholder="e.g., Morning, Evening"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={(data as Record<string, unknown>).duration as string || ''}
              onChange={(e) => updateEditData('duration', e.target.value)}
              placeholder="e.g., 1-2 hours"
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sports-featured"
              checked={data.featured || false}
              onChange={(e) => updateEditData('featured', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="sports-featured">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sports-promoted"
              checked={data.promoted || false}
              onChange={(e) => updateEditData('promoted', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="sports-promoted">Promoted</Label>
          </div>
        </div>
      </div>
    )
  }

  const renderEditForm = () => {
    if (!submission) return null
    
    switch (submission.type) {
      case 'hotel':
        return renderHotelEditForm()
      case 'restaurant':
        return renderRestaurantEditForm()
      case 'event':
        return renderEventEditForm()
      case 'promotion':
        return renderPromotionEditForm()
      case 'sports':
        return renderSportsEditForm()
      default:
        return (
          <div className="space-y-3 bg-white">
            <p className="text-gray-600">Edit form for {submission.type} is not yet implemented.</p>
            <div className="space-y-3">
              {Object.entries(editData).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <Input
                    id={key}
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    onChange={(e) => updateEditData(key, e.target.value)}
                    className="bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission details...</p>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Submission</h2>
          <p className="text-gray-600 mb-4">{error || 'Submission not found'}</p>
          <Button onClick={() => router.push('/admin/approvals')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/approvals')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getTypeIcon(submission.type)}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{submission.title}</h1>
                <p className="text-gray-600 mt-1">
                  {getTypeLabel(submission.type)} • Submitted on {new Date(submission.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{submission.description}</p>
              </CardContent>
            </Card>

            {/* Submission Data - Editable Form */}
            <Card>
              <CardHeader>
                <CardTitle>Edit {getTypeLabel(submission.type)} Details</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEditForm()}
              </CardContent>
            </Card>

            {/* Save Changes Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Handle save changes
                    console.log('Save changes:', editData)
                  }}
                  disabled={actionLoading !== null}
                >
                  Save Changes to Submission
                </Button>
              </CardContent>
            </Card>

            {/* Admin Notes Section */}
            {submission.status === 'pending_approval' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Review Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-notes">Add notes for approval/rejection decision</Label>
                      <Textarea
                        id="admin-notes"
                        placeholder="Enter notes about your decision, feedback, or required changes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="mt-2 bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Admin Notes */}
            {submission.adminNotes && submission.adminNotes !== adminNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{submission.adminNotes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submitter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Submitted By</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{submission.submittedBy?.name || 'Unknown User'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {submission.submittedBy?.email ? (
                    <a 
                      href={`mailto:${submission.submittedBy.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {submission.submittedBy.email}
                    </a>
                  ) : (
                    <span className="text-gray-500">No email provided</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {submission.submittedBy?.phone ? (
                    <a 
                      href={`tel:${submission.submittedBy.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {submission.submittedBy.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500">No phone provided</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {submission.status === 'pending_approval' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading !== null}
                    size="lg"
                  >
                    {actionLoading === 'approve' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve Submission
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading !== null}
                    size="lg"
                  >
                    {actionLoading === 'reject' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Reject Submission
                      </>
                    )}
                  </Button>

                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/admin/approvals')}
                    disabled={actionLoading !== null}
                  >
                    Cancel Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Submission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Submitted</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {submission.status !== 'pending' && (
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        submission.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {submission.status}
                        </p>
                        <p className="text-xs text-gray-500">
                          {/* This would be the updated timestamp if available */}
                          Recently
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
