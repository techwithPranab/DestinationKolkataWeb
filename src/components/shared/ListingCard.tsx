"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, Users, Wifi, Coffee, Trophy, DollarSign, Calendar, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ListingCardProps {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly image: string
  readonly rating: number
  readonly reviewCount: number
  readonly price?: number
  readonly priceUnit?: string
  readonly location: string
  readonly category: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  readonly amenities?: readonly string[]
  readonly distance?: string
  readonly isPromoted?: boolean
  readonly href: string
  // Restaurant-specific props
  readonly openingHours?: {
    monday?: { open: string; close: string; closed: boolean }
  }
  readonly priceRange?: string
  readonly cuisine?: readonly string[]
  // Attraction-specific props
  readonly duration?: string
  readonly entryFee?: {
    adult: number
    isFree: boolean
  }
  readonly timings?: {
    open: string
    close: string
  }
  readonly attractionCategory?: string
  // Sports-specific props
  readonly capacity?: number
  readonly facilities?: readonly string[]
  readonly sport?: string
  readonly sportsCategory?: string
  // Event-specific props
  readonly startDate?: Date | string
  readonly startTime?: string
  readonly endDate?: Date | string
  readonly endTime?: string
  readonly eventCategory?: string
  readonly venueCapacity?: number
  readonly isFree?: boolean
  // Hotel-specific props
  readonly checkInTime?: string
  readonly checkOutTime?: string
  readonly roomTypes?: Array<{
    name: string
    price: number
    capacity: number
  }>
  readonly hotelCategory?: string
}

const categoryIcons = {
  hotel: Users,
  restaurant: Coffee,
  attraction: MapPin,
  event: Clock,
  sports: Trophy
}

const categoryColors = {
  hotel: 'text-blue-600',
  restaurant: 'text-green-600',
  attraction: 'text-purple-600',
  event: 'text-orange-600',
  sports: 'text-red-600'
}

export default function ListingCard({ 
  id,
  title, 
  description, 
  image, 
  rating, 
  reviewCount, 
  price, 
  priceUnit = 'night',
  location, 
  category,
  amenities = [],
  distance,
  isPromoted = false,
  href,
  // Restaurant-specific props
  openingHours,
  priceRange,
  cuisine = [],
  // Attraction-specific props
  duration,
  entryFee,
  timings,
  attractionCategory,
  // Sports-specific props
  capacity,
  facilities = [],
  sport,
  sportsCategory,
  // Event-specific props
  startDate,
  startTime,
  endDate,
  endTime,
  eventCategory,
  venueCapacity,
  isFree,
  // Hotel-specific props
  checkInTime,
  checkOutTime,
  roomTypes = [],
  hotelCategory
}: ListingCardProps) {
  const IconComponent = categoryIcons[category]
  const iconColor = categoryColors[category]

  const getButtonText = (category: string) => {
    switch (category) {
      case 'hotel':
        return 'Book Now'
      case 'restaurant':
        return 'Reserve'
      case 'event':
        return 'Get Tickets'
      case 'sports':
        return 'Book Facility'
      default:
        return 'Explore'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={`h-full overflow-hidden backdrop-blur-sm bg-white/95 hover:bg-white transition-all duration-300 ${isPromoted ? 'ring-2 ring-orange-400 shadow-orange-200' : 'shadow-gray-200'}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {image && image.trim() !== "" ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="text-center text-gray-500">
                <IconComponent size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</p>
              </div>
            </div>
          )}
          
          {/* Promoted Badge */}
          {isPromoted && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
              Promoted
            </div>
          )}
          
          {/* Price Badge */}
          {price && (
            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full z-10">
              <span className="text-sm font-bold text-gray-900">
                ₹{price.toLocaleString()}
                <span className="text-xs text-gray-600">/{priceUnit}</span>
              </span>
            </div>
          )}
          
          {/* Category Icon */}
          <div className={`absolute bottom-3 left-3 bg-white p-2 rounded-full z-10 ${iconColor}`}>
            <IconComponent size={16} />
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({reviewCount})
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
            {distance && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {distance}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Restaurant-specific information */}
          {category === 'restaurant' && (
            <div className=" border-gray-100 pt-3 mt-3">
              {/* Opening Hours and Price Range */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {openingHours?.monday?.open && openingHours?.monday?.close
                      ? `${openingHours.monday.open} - ${openingHours.monday.close}`
                      : 'Hours not available'
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  <span>{priceRange || 'Price not specified'}</span>
                </div>
              </div>

              {/* Cuisine Tags */}
              {cuisine.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {cuisine.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                  {cuisine.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{cuisine.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Attraction-specific information */}
          {category === 'attraction' && (
            <div className=" border-gray-100 pt-3 mt-3">
              {/* Duration and Entry Fee */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{duration || 'Duration N/A'}</span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  <span>
                    {entryFee?.isFree ? 'Free' : `${entryFee?.adult || 0}`}
                  </span>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-3 w-3 mr-1" />
                <span>
                  {timings?.open || 'N/A'} - {timings?.close || 'N/A'}
                </span>
              </div>

              {/* Category Tag */}
              {attractionCategory && (
                <div className="flex">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {attractionCategory}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sports-specific information */}
          {category === 'sports' && (
            <div className=" border-gray-100 pt-3 mt-3">
              {/* Opening Hours and Capacity */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {openingHours?.monday?.open || 'N/A'} - {openingHours?.monday?.close || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{capacity ? `${capacity} capacity` : 'Capacity N/A'}</span>
                </div>
              </div>

              {/* Facilities */}
              {facilities.length > 0 && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Trophy className="h-3 w-3 mr-1" />
                  <span>Facilities: {facilities.slice(0, 2).join(', ')}</span>
                </div>
              )}

              {/* Sport and Category Tags */}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {sport && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {sport}
                    </span>
                  )}
                  {sportsCategory && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {sportsCategory}
                    </span>
                  )}
                </div>
                {price && price > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    Entry Fee: ₹{price}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Event-specific information */}
          {category === 'event' && (
            <div className=" border-gray-100 pt-3 mt-3">
              {/* Date and Time */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {startDate ? new Date(startDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Date TBD'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {startTime ? new Date(`2024-01-01T${startTime}`).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 'Time TBD'}
                  </span>
                </div>
              </div>

              {/* Venue Capacity */}
              {venueCapacity && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{venueCapacity.toLocaleString()} capacity</span>
                </div>
              )}

              {/* Category and Free Tags */}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {eventCategory && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {eventCategory}
                    </span>
                  )}
                  {isFree && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Free
                    </span>
                  )}
                </div>
                {price && price > 0 && !isFree && (
                  <span className="text-xs text-orange-600 font-medium">
                    From ₹{price}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hotel-specific information */}
          {category === 'hotel' && (
            <div className=" border-gray-100 pt-3 mt-3">
              {/* Check-in/Check-out Times */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    Check-in: {checkInTime ? new Date(`2024-01-01T${checkInTime}`).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    Check-out: {checkOutTime ? new Date(`2024-01-01T${checkOutTime}`).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Room Types */}
              {roomTypes.length > 0 && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  <span>Rooms: {roomTypes.slice(0, 2).map(room => room.name).join(', ')}</span>
                </div>
              )}

              {/* Hotel Category and Price Range */}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {hotelCategory && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {hotelCategory}
                    </span>
                  )}
                  {roomTypes.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {roomTypes.length} room type{roomTypes.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {price && price > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    From ₹{price}/night
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
            <div className="flex items-center space-x-2">
              {category === 'hotel' && <Wifi className="h-4 w-4 text-gray-400" />}
              {category === 'restaurant' && <Clock className="h-4 w-4 text-gray-400" />}
              {category === 'attraction' && <MapPin className="h-4 w-4 text-gray-400" />}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-8" asChild>
                <Link href={`${href}?view=details`}>
                  View Details
                </Link>
              </Button>
              {/* <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs px-3 py-1 h-8" asChild>
                <Link href={href}>
                  {getButtonText(category)}
                </Link>
              </Button> */}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
