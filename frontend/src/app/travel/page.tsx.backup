"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plane, Train, Car, Bus, Clock, MapPin, Phone, IndianRupee, Info, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TransportOption {
  _id: string
  name: string
  description: string
  category: string
  transportType: 'air' | 'train' | 'bus' | 'taxi' | 'metro'
  from: string
  to: string
  duration: string
  frequency: string
  priceRange: {
    min: number
    max: number
    currency: string
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  features: string[]
  operatingHours?: {
    open: string
    close: string
    closedDays: string[]
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TravelTip {
  _id: string
  title: string
  description: string
  category: 'general' | 'transport' | 'safety' | 'culture'
  icon: string
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EmergencyContact {
  _id: string
  service: string
  number: string
  description: string
  category: 'police' | 'medical' | 'fire' | 'tourist' | 'other'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function TravelPage() {
  const [selectedTab, setSelectedTab] = useState<'air' | 'train' | 'road' | 'local' | 'tips'>('air')
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([])
  const [travelTips, setTravelTips] = useState<TravelTip[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch transport options
        const transportResponse = await fetch('/api/travel')
        if (!transportResponse.ok) throw new Error('Failed to fetch transport options')
        const transportData = await transportResponse.json()
        console.log('Fetched transport options:', transportData)
        setTransportOptions(transportData.services || [])

        // Fetch travel tips
        const tipsResponse = await fetch('/api/travel-tips')
        if (!tipsResponse.ok) throw new Error('Failed to fetch travel tips')
        const tipsData = await tipsResponse.json()
        setTravelTips(tipsData.data || [])

        // Fetch emergency contacts
        const emergencyResponse = await fetch('/api/emergency-contacts')
        if (!emergencyResponse.ok) throw new Error('Failed to fetch emergency contacts')
        const emergencyData = await emergencyResponse.json()
        setEmergencyContacts(emergencyData.data || [])

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        console.error('Error fetching travel data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'air':
        return <Plane className="h-4 w-4" />
      case 'train':
        return <Train className="h-4 w-4" />
      case 'road':
        return <Car className="h-4 w-4" />
      case 'local':
        return <Bus className="h-4 w-4" />
      case 'tips':
        return <Info className="h-4 w-4" />
      default:
        return null
    }
  }

  const getFilteredTransport = () => {
    switch (selectedTab) {
      case 'air':
        return transportOptions.filter(t => t.transportType === 'air')
      case 'train':
        return transportOptions.filter(t => t.transportType === 'train')
      case 'road':
        return transportOptions.filter(t => t.transportType === 'bus')
      case 'local':
        return transportOptions.filter(t => t.transportType === 'taxi' || t.transportType === 'metro')
      default:
        return []
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-800'
      case 'transport':
        return 'bg-green-100 text-green-800'
      case 'safety':
        return 'bg-red-100 text-red-800'
      case 'culture':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading travel information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Travel Information</h1>
            <p className="text-gray-600 mt-2">
              Complete guide to reaching and getting around Kolkata
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'air' as const, label: 'By Air' },
              { id: 'train' as const, label: 'By Train' },
              { id: 'road' as const, label: 'By Road' },
              { id: 'local' as const, label: 'Local Transport' },
              { id: 'tips' as const, label: 'Travel Tips' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabIcon(tab.id)}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'tips' ? (
          /* Travel Tips */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Essential Travel Tips</h2>
              <p className="text-gray-600">Important information for a smooth trip to Kolkata</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelTips.map((tip, index) => (
                <motion.div
                  key={tip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{tip.icon}</div>
                        <CardTitle className="text-lg text-black">{tip.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
                      <div className="mt-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryStyle(tip.category)}`}>
                          {tip.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-black" />
                  <span className='text-black'>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emergencyContacts.length > 0 ? (
                    emergencyContacts.map((contact) => (
                      <div key={contact._id}>
                        <h4 className="font-medium text-gray-900">{contact.service}</h4>
                        <p className="text-lg font-bold text-red-600">{contact.number}</p>
                        <p className="text-xs text-gray-600">{contact.description}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <h4 className="font-medium text-gray-900">Police</h4>
                        <p className="text-lg font-bold text-red-600">100</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Fire Brigade</h4>
                        <p className="text-lg font-bold text-red-600">101</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Ambulance</h4>
                        <p className="text-lg font-bold text-red-600">108</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Tourist Helpline</h4>
                        <p className="text-lg font-bold text-blue-600">1363</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Transport Options */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedTab === 'air' && 'Flight Information'}
                {selectedTab === 'train' && 'Railway Information'}
                {selectedTab === 'road' && 'Bus & Road Transport'}
                {selectedTab === 'local' && 'Local Transportation'}
              </h2>
              <p className="text-gray-600">
                {selectedTab === 'air' && 'Connect to Kolkata via air travel'}
                {selectedTab === 'train' && 'Rail connectivity to the City of Joy'}
                {selectedTab === 'road' && 'Road transport options to reach Kolkata'}
                {selectedTab === 'local' && 'Getting around within the city'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredTransport().map((transport, index) => (
                <motion.div
                  key={transport._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center space-x-2">
                            {transport.transportType === 'air' && <Plane className="h-5 w-5 text-blue-600" />}
                            {transport.transportType === 'train' && <Train className="h-5 w-5 text-green-600" />}
                            {transport.transportType === 'bus' && <Bus className="h-5 w-5 text-orange-600" />}
                            {transport.transportType === 'taxi' && <Car className="h-5 w-5 text-purple-600" />}
                            {transport.transportType === 'metro' && <Train className="h-5 w-5 text-indigo-600" />}
                            <span className='text-black'>{transport.name}</span>
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{transport.from} → {transport.to}</span>
                            </div>
                          </div>
                        </div>
                        {transport.contact.website && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => window.open(transport.contact.website, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-1 text-gray-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">Duration</span>
                          </div>
                          <p className="text-sm">{transport.duration}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 text-gray-600 mb-1">
                            <IndianRupee className="h-3 w-3" />
                            <span className="text-xs font-medium">Price Range</span>
                          </div>
                          <p className="text-sm font-semibold text-green-600">
                            {transport.priceRange.currency}{transport.priceRange.min} - {transport.priceRange.currency}{transport.priceRange.max}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Frequency</p>
                        <p className="text-sm">{transport.frequency}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {transport.features.map((feature, featureIndex) => (
                            <span
                              key={`${transport._id}-feature-${featureIndex}`}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{transport.contact.phone}</span>
                        </div>
                        <Button size="sm" className="text-white bg-orange-600 hover:bg-orange-700">
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
