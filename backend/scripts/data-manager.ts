#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { Hotel, Restaurant, Attraction, Event, Promotion, Sports } from '../src/models/index.js'
import { generateSlug } from '../src/lib/cloudinary-utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', 'data', 'ingested')
const BATCH_SIZE = 50 // Smaller batch size for pending status processing

// Kolkata bounding box [south, west, north, east] - Increased radius
const KOLKATA_BBOX = '22.4000, 88.2500, 22.7000, 88.5000'

interface OSMElement {
  type: string
  id: number
  lat?: number
  lon?: number
  tags?: Record<string, string>
  nodes?: number[]
  members?: Array<{
    type: string
    ref: number
    role: string
  }>
}

interface OSMResponse {
  elements: OSMElement[]
}

interface LoadStats {
  total: number
  success: number
  failed: number
  skipped: number
  pending: number
}

interface DataIngestionStats {
  hotels: LoadStats
  restaurants: LoadStats
  attractions: LoadStats
  sports: LoadStats
  events: LoadStats
  promotions: LoadStats
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
  totalPending: number
  processingTime: number
  timestamp: Date
}

class DataIngestionManager {
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter'
  private readonly outputDir = DATA_DIR
  private stats: DataIngestionStats

  constructor() {
    this.stats = {
      hotels: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      restaurants: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      attractions: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      sports: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      events: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      promotions: { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 },
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      totalPending: 0,
      processingTime: 0,
      timestamp: new Date()
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * Connect to MongoDB database
   */
  async connectToDatabase(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata'
      console.log('🔌 Connecting to MongoDB...')
      await mongoose.connect(mongoUri)
      console.log('✅ Connected to MongoDB successfully')
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error)
      throw error
    }
  }

  /**
   * Fetch data from Overpass API
   */
  async fetchFromOverpass(query: string): Promise<OSMResponse> {
    try {
      console.log('📡 Fetching data from Overpass API...')
      const response = await axios.post(this.overpassUrl, query, {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 30000
      })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching from Overpass API:', error)
      throw error
    }
  }

  /**
   * Generate Overpass query for hotels
   */
  getHotelsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](${KOLKATA_BBOX});
        node["tourism"="guest_house"](${KOLKATA_BBOX});
        node["tourism"="hostel"](${KOLKATA_BBOX});
        way["tourism"="hotel"](${KOLKATA_BBOX});
        way["tourism"="guest_house"](${KOLKATA_BBOX});
        way["tourism"="hostel"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for restaurants
   */
  getRestaurantsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](${KOLKATA_BBOX});
        node["amenity"="cafe"](${KOLKATA_BBOX});
        node["amenity"="fast_food"](${KOLKATA_BBOX});
        way["amenity"="restaurant"](${KOLKATA_BBOX});
        way["amenity"="cafe"](${KOLKATA_BBOX});
        way["amenity"="fast_food"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for attractions
   */
  getAttractionsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](${KOLKATA_BBOX});
        node["tourism"="museum"](${KOLKATA_BBOX});
        node["historic"](${KOLKATA_BBOX});
        node["amenity"="place_of_worship"](${KOLKATA_BBOX});
        node["leisure"="park"](${KOLKATA_BBOX});
        way["tourism"="attraction"](${KOLKATA_BBOX});
        way["tourism"="museum"](${KOLKATA_BBOX});
        way["historic"](${KOLKATA_BBOX});
        way["amenity"="place_of_worship"](${KOLKATA_BBOX});
        way["leisure"="park"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for sports facilities
   */
  getSportsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["leisure"="pitch"](${KOLKATA_BBOX});
        node["leisure"="stadium"](${KOLKATA_BBOX});
        node["amenity"="sports_centre"](${KOLKATA_BBOX});
        node["club"="sport"](${KOLKATA_BBOX});
        way["leisure"="pitch"](${KOLKATA_BBOX});
        way["leisure"="stadium"](${KOLKATA_BBOX});
        way["amenity"="sports_centre"](${KOLKATA_BBOX});
        way["club"="sport"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Process and normalize data with pending status
   */
  private processDataWithPendingStatus(data: OSMResponse, processor: (element: OSMElement) => any): any[] {
    return data.elements
      .filter(element => element.lat && element.lon && element.tags)
      .map(element => {
        const processedData = processor(element)
        return {
          ...processedData,
          slug: generateSlug(processedData.name) + '-' + element.id,
          status: 'pending', // Set status to pending
          featured: false,
          promoted: false,
          osmId: element.id,
          source: 'OpenStreetMap'
        }
      })
      .filter(item => item.name !== 'Unnamed Hotel' && item.name !== 'Unnamed Restaurant' &&
                     item.name !== 'Unnamed Attraction' && item.name !== 'Unnamed Sports Facility')
  }

  /**
   * Process hotel data
   */
  processHotels(data: OSMResponse) {
    return this.processDataWithPendingStatus(data, (element) => {
      const tags = element.tags!
      return {
        name: tags.name || 'Unnamed Hotel',
        description: tags.description || `A ${tags.tourism} in Kolkata`,
        shortDescription: tags.description?.substring(0, 200) || '',
        location: {
          type: 'Point',
          coordinates: [element.lon!, element.lat!]
        },
        address: {
          street: tags['addr:street'] || '',
          area: tags['addr:suburb'] || tags['addr:district'] || '',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: tags['addr:postcode'] || '',
          landmark: tags.landmark || ''
        },
        contact: {
          phone: this.extractPhone(tags),
          email: this.extractEmail(tags),
          website: this.extractWebsite(tags),
          socialMedia: {}
        },
        priceRange: {
          min: this.estimatePrice(tags.tourism, 'min'),
          max: this.estimatePrice(tags.tourism, 'max'),
          currency: 'INR'
        },
        category: this.categorizeHotel(tags),
        amenities: this.extractAmenities(tags),
        rating: {
          average: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 100) + 10
        },
        roomTypes: [{
          name: 'Standard Room',
          price: this.estimatePrice(tags.tourism, 'min'),
          capacity: 2,
          amenities: ['WiFi', 'AC'],
          images: [],
          available: true
        }],
        checkInTime: '14:00',
        checkOutTime: '12:00',
        tags: this.extractTags(tags)
      }
    })
  }

  /**
   * Process restaurant data
   */
  processRestaurants(data: OSMResponse) {
    return this.processDataWithPendingStatus(data, (element) => {
      const tags = element.tags!
      return {
        name: tags.name || 'Unnamed Restaurant',
        description: tags.description || `A ${tags.amenity} serving delicious food`,
        shortDescription: tags.description?.substring(0, 200) || '',
        location: {
          type: 'Point',
          coordinates: [element.lon!, element.lat!]
        },
        address: {
          street: tags['addr:street'] || '',
          area: tags['addr:suburb'] || tags['addr:district'] || '',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: tags['addr:postcode'] || '',
          landmark: tags.landmark || ''
        },
        contact: {
          phone: this.extractPhone(tags),
          email: this.extractEmail(tags),
          website: this.extractWebsite(tags),
          socialMedia: {}
        },
        cuisine: this.extractCuisine(tags),
        priceRange: this.categorizePriceRange(tags),
        openingHours: this.parseOpeningHours(tags.opening_hours),
        menu: this.generateSampleMenu(tags),
        amenities: this.extractRestaurantAmenities(tags),
        rating: {
          average: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 200) + 5
        },
        deliveryPartners: Math.random() > 0.5 ? ['Swiggy', 'Zomato'] : [],
        reservationRequired: Math.random() > 0.7,
        avgMealCost: this.estimatePrice(tags.amenity, 'avg'),
        tags: this.extractTags(tags)
      }
    })
  }

  /**
   * Process attraction data
   */
  processAttractions(data: OSMResponse) {
    return this.processDataWithPendingStatus(data, (element) => {
      const tags = element.tags!
      const category = this.categorizeAttraction(tags)

      return {
        name: tags.name || 'Unnamed Attraction',
        description: tags.description || this.generateAttractionDescription(tags, category),
        shortDescription: tags.description?.substring(0, 200) || '',
        location: {
          type: 'Point',
          coordinates: [element.lon!, element.lat!]
        },
        address: {
          street: tags['addr:street'] || '',
          area: tags['addr:suburb'] || tags['addr:district'] || '',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: tags['addr:postcode'] || '',
          landmark: tags.landmark || ''
        },
        contact: {
          phone: this.extractPhone(tags),
          email: this.extractEmail(tags),
          website: this.extractWebsite(tags),
          socialMedia: {}
        },
        category,
        entryFee: this.generateEntryFee(category),
        timings: this.parseOpeningHours(tags.opening_hours),
        bestTimeToVisit: this.getBestTimeToVisit(category),
        duration: this.getVisitDuration(category),
        guidedTours: {
          available: Math.random() > 0.6,
          languages: ['English', 'Bengali', 'Hindi'],
          price: 100,
          duration: '1 hour'
        },
        accessibility: {
          wheelchairAccessible: tags.wheelchair === 'yes',
          parkingAvailable: Math.random() > 0.5,
          publicTransport: 'Metro, Bus available nearby'
        },
        amenities: this.extractAttractionAmenities(tags),
        rating: {
          average: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 500) + 20
        },
        tags: this.extractTags(tags)
      }
    })
  }

  /**
   * Process sports data
   */
  processSports(data: OSMResponse) {
    return this.processDataWithPendingStatus(data, (element) => {
      const tags = element.tags!
      const category = this.categorizeSports(tags)

      return {
        name: tags.name || 'Unnamed Sports Facility',
        description: tags.description || this.generateSportsDescription(tags, category),
        shortDescription: tags.description?.substring(0, 200) || '',
        location: {
          type: 'Point',
          coordinates: [element.lon!, element.lat!]
        },
        address: {
          street: tags['addr:street'] || '',
          area: tags['addr:suburb'] || tags['addr:district'] || '',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: tags['addr:postcode'] || '',
          landmark: tags.landmark || ''
        },
        contact: {
          phone: this.extractPhone(tags),
          email: this.extractEmail(tags),
          website: this.extractWebsite(tags),
          socialMedia: {}
        },
        category,
        sport: tags.sport || this.extractSportType(tags),
        capacity: this.estimateCapacity(tags),
        facilities: this.extractSportsFacilities(tags),
        entryFee: this.generateSportsEntryFee(category),
        timings: this.parseOpeningHours(tags.opening_hours),
        bestTimeToVisit: this.getBestTimeForSports(category),
        duration: this.getSportsDuration(category),
        amenities: this.extractSportsAmenities(tags),
        rating: {
          average: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 200) + 10
        },
        tags: this.extractTags(tags)
      }
    })
  }

  // Helper methods (same as in original ingest-data.ts)
  private categorizeHotel(tags: Record<string, string>): string {
    if (tags.stars) {
      const stars = parseInt(tags.stars)
      if (stars >= 4) return 'Luxury'
      if (stars === 3) return 'Business'
      return 'Budget'
    }

    if (tags.tourism === 'hostel') return 'Budget'
    if (tags.tourism === 'guest_house') return 'Budget'

    const name = tags.name?.toLowerCase() || ''
    if (name.includes('heritage') || name.includes('palace')) return 'Heritage'
    if (name.includes('resort')) return 'Resort'
    if (name.includes('boutique')) return 'Boutique'

    return 'Business'
  }

  private categorizeSports(tags: Record<string, string>): string {
    if (tags.leisure === 'stadium') return 'Stadium'
    if (tags.leisure === 'pitch') return 'Sports Grounds'
    if (tags.amenity === 'sports_centre') return 'Coaching Centers'
    if (tags.club === 'sport') return 'Sports Clubs'
    return 'Sports Facilities'
  }

  private categorizeAttraction(tags: Record<string, string>): string {
    if (tags.historic) return 'Historical'
    if (tags.amenity === 'place_of_worship') return 'Religious'
    if (tags.tourism === 'museum') return 'Museums'
    if (tags.tourism === 'gallery') return 'Museums'
    if (tags.leisure === 'park') return 'Parks'
    if (tags.building === 'government') return 'Architecture'
    return 'Cultural'
  }

  private generateSportsDescription(tags: Record<string, string>, category: string): string {
    const name = tags.name || 'sports facility'
    const sport = tags.sport || 'various sports'

    const descriptions = {
      'Stadium': `${name} is a premier sports stadium in Kolkata, hosting major sporting events and matches.`,
      'Sports Grounds': `${name} is a well-maintained sports ground perfect for ${sport} and recreational activities.`,
      'Coaching Centers': `${name} is a professional coaching center offering training in ${sport} and fitness programs.`,
      'Sports Clubs': `${name} is a sports club providing facilities and training for ${sport} enthusiasts.`,
      'Sports Facilities': `${name} offers excellent sports facilities for ${sport} in Kolkata.`
    }

    return descriptions[category as keyof typeof descriptions] || `Visit ${name} for ${sport} activities in Kolkata.`
  }

  private extractSportType(tags: Record<string, string>): string {
    if (tags.sport) return tags.sport
    if (tags.leisure === 'pitch') return 'football'
    if (tags.leisure === 'stadium') return 'cricket'
    if (tags.amenity === 'sports_centre') return 'multi-sport'
    if (tags.club === 'sport') return 'multi-sport'
    return 'general'
  }

  private estimateCapacity(tags: Record<string, string>): number {
    if (tags.capacity) return parseInt(tags.capacity)
    if (tags.leisure === 'stadium') return 50000
    if (tags.leisure === 'pitch') return 1000
    if (tags.amenity === 'sports_centre') return 200
    if (tags.club === 'sport') return 500
    return 100
  }

  private extractSportsFacilities(tags: Record<string, string>): string[] {
    const facilities: string[] = []

    if (tags.sport) facilities.push(tags.sport)
    if (tags.surface) facilities.push(`${tags.surface} surface`)
    if (tags.lit === 'yes') facilities.push('Floodlights')
    if (tags.covered === 'yes') facilities.push('Covered facility')
    if (tags.changing_room === 'yes') facilities.push('Changing rooms')
    if (tags.shower === 'yes') facilities.push('Showers')
    if (tags.parking === 'yes') facilities.push('Parking')

    return facilities
  }

  private generateSportsEntryFee(category: string) {
    const fees = {
      'Stadium': { adult: 100, child: 50, senior: 50, currency: 'INR', isFree: false },
      'Sports Grounds': { adult: 20, child: 10, senior: 10, currency: 'INR', isFree: false },
      'Coaching Centers': { adult: 500, child: 300, senior: 300, currency: 'INR', isFree: false },
      'Sports Clubs': { adult: 200, child: 100, senior: 100, currency: 'INR', isFree: false },
      'Sports Facilities': { adult: 50, child: 25, senior: 25, currency: 'INR', isFree: false }
    }

    return fees[category as keyof typeof fees] || fees['Sports Facilities']
  }

  private getBestTimeForSports(category: string): string {
    if (category === 'Stadium') return 'Evening matches, daytime practice'
    if (category === 'Sports Grounds') return 'Morning and evening'
    if (category === 'Coaching Centers') return 'Morning and evening sessions'
    if (category === 'Sports Clubs') return 'All day with peak hours in evening'
    return 'Morning and evening'
  }

  private getSportsDuration(category: string): string {
    const durations = {
      'Stadium': '2-4 hours',
      'Sports Grounds': '1-2 hours',
      'Coaching Centers': '1-2 hours per session',
      'Sports Clubs': '1-3 hours',
      'Sports Facilities': '1-2 hours'
    }

    return durations[category as keyof typeof durations] || '1-2 hours'
  }

  private extractSportsAmenities(tags: Record<string, string>): string[] {
    const amenities: string[] = []

    if (tags.internet_access === 'yes' || tags.wifi === 'yes') amenities.push('WiFi')
    if (tags.parking === 'yes') amenities.push('Parking')
    if (tags.changing_room === 'yes') amenities.push('Changing Rooms')
    if (tags.shower === 'yes') amenities.push('Showers')
    if (tags.toilets === 'yes') amenities.push('Toilets')
    if (tags.drinking_water === 'yes') amenities.push('Drinking Water')
    if (tags.first_aid === 'yes') amenities.push('First Aid')
    if (tags.lit === 'yes') amenities.push('Floodlights')

    return amenities
  }

  private extractCuisine(tags: Record<string, string>): string[] {
    const cuisine = tags.cuisine || 'indian'
    return cuisine.split(';').map(c => c.trim().toLowerCase())
      .map(c => {
        if (c.includes('indian') || c.includes('bengali')) return 'Bengali'
        if (c.includes('chinese')) return 'Chinese'
        if (c.includes('continental')) return 'Continental'
        if (c.includes('fast_food')) return 'Fast Food'
        return c.charAt(0).toUpperCase() + c.slice(1)
      })
  }

  private categorizePriceRange(tags: Record<string, string>): string {
    if (tags.amenity === 'fast_food') return 'Budget'
    if (tags.amenity === 'cafe') return 'Budget'
    if (tags['payment:credit_cards'] === 'yes') return 'Mid-range'
    if (tags.cuisine?.includes('fine_dining')) return 'Fine Dining'
    return 'Mid-range'
  }

  private estimatePrice(type: string, range: 'min' | 'max' | 'avg'): number {
    const prices = {
      hotel: { min: 1500, max: 8000, avg: 3500 },
      guest_house: { min: 800, max: 3000, avg: 1800 },
      hostel: { min: 500, max: 1500, avg: 900 },
      restaurant: { min: 200, max: 1000, avg: 500 },
      cafe: { min: 100, max: 400, avg: 250 },
      fast_food: { min: 80, max: 300, avg: 150 }
    }

    return prices[type as keyof typeof prices]?.[range] || prices.restaurant[range]
  }

  private extractAmenities(tags: Record<string, string>): string[] {
    const amenities: string[] = []

    if (tags.internet_access === 'yes' || tags.wifi === 'yes') amenities.push('WiFi')
    if (tags['amenity:air_conditioning'] === 'yes') amenities.push('AC')
    if (tags.parking === 'yes') amenities.push('Parking')
    if (tags.swimming_pool === 'yes') amenities.push('Pool')
    if (tags.fitness_centre === 'yes') amenities.push('Gym')
    if (tags.spa === 'yes') amenities.push('Spa')
    if (tags.restaurant === 'yes') amenities.push('Restaurant')
    if (tags.bar === 'yes') amenities.push('Bar')
    if (tags.room_service === 'yes') amenities.push('Room Service')

    return amenities
  }

  private extractRestaurantAmenities(tags: Record<string, string>): string[] {
    const amenities: string[] = []

    if (tags.outdoor_seating === 'yes') amenities.push('Outdoor Seating')
    if (tags.internet_access === 'yes' || tags.wifi === 'yes') amenities.push('WiFi')
    if (tags.parking === 'yes') amenities.push('Parking')
    if (tags.live_music === 'yes') amenities.push('Live Music')
    if (tags['amenity:air_conditioning'] === 'yes') amenities.push('AC')
    if (tags.delivery === 'yes') amenities.push('Home Delivery')
    if (tags.takeaway === 'yes') amenities.push('Takeaway')

    return amenities
  }

  private extractAttractionAmenities(tags: Record<string, string>): string[] {
    const amenities: string[] = []

    if (tags.guided_tours === 'yes') amenities.push('Guided Tours')
    if (tags.audio_guide === 'yes') amenities.push('Audio Guide')
    if (tags.parking === 'yes') amenities.push('Parking')
    if (tags.wheelchair === 'yes') amenities.push('Wheelchair Access')
    if (tags.photography === 'yes') amenities.push('Photography')
    if (tags.shop === 'yes') amenities.push('Gift Shop')

    return amenities
  }

  private extractEmail(tags: Record<string, string>): string {
    // Try multiple possible email tag formats used in OSM
    return tags.email || 
           tags['contact:email'] || 
           tags['email:main'] || 
           tags['contact:email:main'] ||
           tags['operator:email'] ||
           tags['brand:email'] ||
           ''
  }

  private extractWebsite(tags: Record<string, string>): string {
    // Try multiple possible website tag formats used in OSM
    return tags.website || 
           tags['contact:website'] || 
           tags.url ||
           tags['contact:url'] ||
           tags['operator:website'] ||
           tags['brand:website'] ||
           ''
  }

  private extractPhone(tags: Record<string, string>): string[] {
    const phones: string[] = []
    
    // Try multiple possible phone tag formats
    if (tags.phone) phones.push(tags.phone)
    if (tags['contact:phone']) phones.push(tags['contact:phone'])
    if (tags['phone:main']) phones.push(tags['phone:main'])
    if (tags['contact:phone:main']) phones.push(tags['contact:phone:main'])
    if (tags['operator:phone']) phones.push(tags['operator:phone'])
    if (tags['brand:phone']) phones.push(tags['brand:phone'])
    
    // Remove duplicates and empty values
    return [...new Set(phones.filter(phone => phone && phone.length > 0))]
  }

  private extractTags(osmTags: Record<string, string>): string[] {
    const tags: string[] = []

    if (osmTags['addr:suburb']) tags.push(osmTags['addr:suburb'])
    if (osmTags['addr:district']) tags.push(osmTags['addr:district'])
    if (osmTags.heritage === 'yes') tags.push('Heritage')
    if (osmTags.tourism) tags.push(osmTags.tourism)
    if (osmTags.amenity) tags.push(osmTags.amenity)

    return tags.filter(tag => tag.length > 0)
  }

  private parseOpeningHours(openingHours?: string) {
    const defaultHours = { open: '09:00', close: '21:00', closed: false }

    return {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours
    }
  }

  private generateSampleMenu(tags: Record<string, string>) {
    const cuisineType = this.extractCuisine(tags)[0] || 'Bengali'

    return [{
      category: 'Main Course',
      items: [
        {
          name: cuisineType === 'Bengali' ? 'Fish Curry Rice' : 'Chicken Biryani',
          price: 180,
          description: `Traditional ${cuisineType.toLowerCase()} dish with steamed rice`,
          isVeg: false,
          isVegan: false,
          spiceLevel: 2
        },
        {
          name: 'Vegetable Thali',
          price: 150,
          description: 'Complete vegetarian meal with dal, sabzi, rice, and roti',
          isVeg: true,
          isVegan: false,
          spiceLevel: 1
        }
      ]
    }]
  }

  private generateAttractionDescription(tags: Record<string, string>, category: string): string {
    const name = tags.name || 'attraction'
    const descriptions = {
      'Historical': `${name} is a significant historical site in Kolkata, showcasing the rich heritage of the city.`,
      'Religious': `${name} is an important place of worship, offering spiritual solace to visitors.`,
      'Museums': `${name} houses a fascinating collection of artifacts and exhibits.`,
      'Parks': `${name} is a beautiful green space perfect for relaxation and recreation.`,
      'Architecture': `${name} represents the architectural heritage of Kolkata.`,
      'Cultural': `${name} is a vibrant cultural center celebrating the arts and traditions of Bengal.`
    }

    return descriptions[category as keyof typeof descriptions] || `Visit ${name} for a memorable experience in Kolkata.`
  }

  private generateEntryFee(category: string) {
    const fees = {
      'Historical': { adult: 10, child: 5, senior: 5, currency: 'INR', isFree: false },
      'Religious': { adult: 0, child: 0, senior: 0, currency: 'INR', isFree: true },
      'Museums': { adult: 20, child: 10, senior: 10, currency: 'INR', isFree: false },
      'Parks': { adult: 5, child: 2, senior: 2, currency: 'INR', isFree: false },
      'Architecture': { adult: 15, child: 8, senior: 8, currency: 'INR', isFree: false },
      'Cultural': { adult: 50, child: 25, senior: 25, currency: 'INR', isFree: false }
    }

    return fees[category as keyof typeof fees] || fees.Cultural
  }

  private getBestTimeToVisit(category: string): string {
    if (category === 'Parks') return 'Early morning or evening'
    if (category === 'Religious') return 'Morning or evening prayers'
    return 'Any time during opening hours'
  }

  private getVisitDuration(category: string): string {
    const durations = {
      'Historical': '1-2 hours',
      'Religious': '30-60 minutes',
      'Museums': '2-3 hours',
      'Parks': '1-3 hours',
      'Architecture': '30-60 minutes',
      'Cultural': '2-4 hours'
    }

    return durations[category as keyof typeof durations] || '1-2 hours'
  }

  /**
   * Load data into database with pending status
   */
  async loadDataToDatabase<T>(
    model: mongoose.Model<T>,
    data: any[],
    collectionName: string
  ): Promise<LoadStats> {
    const stats: LoadStats = { total: 0, success: 0, failed: 0, skipped: 0, pending: 0 }

    try {
      console.log(`\n📂 Loading ${collectionName} into database...`)

      if (!data || data.length === 0) {
        console.log(`⚠️  No ${collectionName} data to load`)
        return stats
      }

      stats.total = data.length
      console.log(`📊 Found ${stats.total} ${collectionName} records to process`)

      // Process in batches
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE)
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(data.length / BATCH_SIZE)

        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`)

        try {
          // Check for existing records to avoid duplicates
          const existingIds = new Set()
          if (collectionName === 'hotels' || collectionName === 'restaurants' ||
              collectionName === 'attractions' || collectionName === 'sports') {
            const existingRecords = await model.find({}, { osmId: 1 }).lean()
            existingRecords.forEach((record: any) => {
              if (record.osmId) existingIds.add(record.osmId)
            })
          }

          const validBatch = batch.filter((item: any) => {
            if (item.osmId && existingIds.has(item.osmId)) {
              stats.skipped++
              return false
            }
            return true
          })

          if (validBatch.length > 0) {
            // Ensure all items have pending status
            const pendingBatch = validBatch.map(item => ({
              ...item,
              status: 'pending'
            }))

            const result = await model.insertMany(pendingBatch, {
              ordered: false,
              lean: true
            })

            stats.success += result.length
            stats.pending += result.length
            console.log(`✅ Batch ${batchNumber} completed: ${result.length} inserted with pending status`)
          } else {
            console.log(`⏭️  Batch ${batchNumber} skipped: all records already exist`)
          }
        } catch (batchError: any) {
          console.error(`❌ Error in batch ${batchNumber}:`, batchError.message)

          // Try individual inserts for failed batch
          for (const item of batch) {
            try {
              const pendingItem = { ...item, status: 'pending' }
              await model.create(pendingItem)
              stats.success++
              stats.pending++
            } catch (itemError: any) {
              stats.failed++
              console.error(`❌ Failed to insert item:`, itemError.message)
            }
          }
        }
      }

      console.log(`📈 ${collectionName} loading completed:`)
      console.log(`   Total: ${stats.total}`)
      console.log(`   Success: ${stats.success}`)
      console.log(`   Failed: ${stats.failed}`)
      console.log(`   Skipped: ${stats.skipped}`)
      console.log(`   Pending: ${stats.pending}`)

    } catch (error: any) {
      console.error(`❌ Error loading ${collectionName}:`, error.message)
      stats.failed = stats.total
    }

    return stats
  }

  /**
   * Generate sample events and promotions
   */
  private generateSampleEvents() {
    const events = [
      {
        name: 'Durga Puja Festival 2024',
        slug: generateSlug('Durga Puja Festival 2024'),
        description: 'The biggest festival of Bengal celebrating Goddess Durga with elaborate pandals and cultural programs.',
        category: 'Festivals',
        startDate: new Date('2024-10-10'),
        endDate: new Date('2024-10-15'),
        startTime: '06:00',
        endTime: '23:00',
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726]
        },
        address: {
          street: 'Park Street',
          area: 'Central Kolkata',
          city: 'Kolkata',
          state: 'West Bengal'
        },
        ticketPrice: {
          min: 0,
          max: 0,
          currency: 'INR',
          isFree: true
        },
        organizer: {
          name: 'Kolkata Puja Committee Association',
          contact: '+91 33 1234 5678',
          email: 'info@kolkatapuja.org'
        },
        venue: {
          name: 'Various Pandals across Kolkata',
          capacity: 1000000,
          type: 'Outdoor'
        },
        isRecurring: true,
        recurrencePattern: 'Annual',
        status: 'pending',
        featured: true,
        promoted: true
      }
    ]

    return events
  }

  private generateSamplePromotions() {
    const promotions = [
      {
        title: '30% Off on Heritage Hotels',
        slug: generateSlug('30% Off on Heritage Hotels'),
        description: 'Experience the royal heritage of Kolkata with 30% discount on all heritage hotels.',
        businessType: 'Hotel',
        discountPercent: 30,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        code: 'HERITAGE30',
        minAmount: 2000,
        maxDiscount: 1500,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true,
        terms: [
          'Valid on heritage category hotels only',
          'Minimum stay of 2 nights required',
          'Cannot be combined with other offers'
        ]
      }
    ]

    return promotions
  }

  /**
   * Save processed data to files
   */
  private saveToFile(data: any[], filename: string) {
    const filePath = path.join(this.outputDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`💾 Saved ${data.length} items to ${filePath}`)
  }

  /**
   * Generate comprehensive statistics report
   */
  private generateStatisticsReport(): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 DATA INGESTION AND LOADING STATISTICS REPORT')
    console.log('='.repeat(80))
    console.log(`📅 Report Generated: ${this.stats.timestamp.toISOString()}`)
    console.log(`⏱️  Processing Time: ${this.stats.processingTime.toFixed(2)} seconds`)
    console.log('='.repeat(80))

    // Individual collection stats
    const collections = [
      { name: 'Hotels', stats: this.stats.hotels },
      { name: 'Restaurants', stats: this.stats.restaurants },
      { name: 'Attractions', stats: this.stats.attractions },
      { name: 'Sports Facilities', stats: this.stats.sports },
      { name: 'Events', stats: this.stats.events },
      { name: 'Promotions', stats: this.stats.promotions }
    ]

    collections.forEach(({ name, stats }) => {
      if (stats.total > 0) {
        console.log(`\n🏨 ${name}:`)
        console.log(`   📊 Total Records: ${stats.total}`)
        console.log(`   ✅ Successfully Loaded: ${stats.success}`)
        console.log(`   ⏳ Pending Status: ${stats.pending}`)
        console.log(`   ❌ Failed: ${stats.failed}`)
        console.log(`   ⏭️  Skipped (Duplicates): ${stats.skipped}`)
        console.log(`   📈 Success Rate: ${((stats.success / stats.total) * 100).toFixed(1)}%`)
      }
    })

    // Overall summary
    console.log('\n' + '='.repeat(80))
    console.log('🎯 OVERALL SUMMARY')
    console.log('='.repeat(80))
    console.log(`📊 Total Records Processed: ${this.stats.totalProcessed}`)
    console.log(`✅ Total Successfully Loaded: ${this.stats.totalSuccessful}`)
    console.log(`⏳ Total Pending Status: ${this.stats.totalPending}`)
    console.log(`❌ Total Failed: ${this.stats.totalFailed}`)
    console.log(`📈 Overall Success Rate: ${this.stats.totalProcessed > 0 ? ((this.stats.totalSuccessful / this.stats.totalProcessed) * 100).toFixed(1) : 0}%`)

    // Status distribution
    console.log('\n📋 STATUS DISTRIBUTION:')
    console.log(`   • Active Records: 0 (all new records start as pending)`)
    console.log(`   • Pending Records: ${this.stats.totalPending} (awaiting admin approval)`)
    console.log(`   • Failed Records: ${this.stats.totalFailed}`)

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (this.stats.totalFailed > 0) {
      console.log(`   • Review ${this.stats.totalFailed} failed records in the logs above`)
      console.log(`   • Check data validation rules and database constraints`)
    }
    if (this.stats.totalPending > 0) {
      console.log(`   • ${this.stats.totalPending} records are pending admin approval`)
      console.log(`   • Use the admin panel to review and approve/reject these records`)
    }
    console.log(`   • Monitor system performance with ${this.stats.totalSuccessful} new records`)

    console.log('\n' + '='.repeat(80))
    console.log('✅ REPORT COMPLETE')
    console.log('='.repeat(80))
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Main ingestion and loading process
   */
  async ingestAndLoadAll(): Promise<void> {
    const startTime = Date.now()

    try {
      console.log('🚀 Starting comprehensive data ingestion and loading process...')
      console.log('📍 Target: Kolkata, West Bengal')
      console.log('🎯 Status: All new records will be set to PENDING')

      // Connect to database
      await this.connectToDatabase()

      // Fetch and process hotels
      console.log('\n🏨 Processing Hotels...')
      const hotelsData = await this.fetchFromOverpass(this.getHotelsQuery())
      const processedHotels = this.processHotels(hotelsData)
      this.saveToFile(processedHotels, 'hotels.json')
      this.stats.hotels = await this.loadDataToDatabase(Hotel, processedHotels, 'hotels')

      await this.sleep(2000)

      // Fetch and process restaurants
      console.log('\n🍽️ Processing Restaurants...')
      const restaurantsData = await this.fetchFromOverpass(this.getRestaurantsQuery())
      const processedRestaurants = this.processRestaurants(restaurantsData)
      this.saveToFile(processedRestaurants, 'restaurants.json')
      this.stats.restaurants = await this.loadDataToDatabase(Restaurant, processedRestaurants, 'restaurants')

      await this.sleep(2000)

      // Fetch and process attractions
      console.log('\n🏛️ Processing Attractions...')
      const attractionsData = await this.fetchFromOverpass(this.getAttractionsQuery())
      const processedAttractions = this.processAttractions(attractionsData)
      this.saveToFile(processedAttractions, 'attractions.json')
      this.stats.attractions = await this.loadDataToDatabase(Attraction, processedAttractions, 'attractions')

      await this.sleep(2000)

      // Fetch and process sports facilities
      console.log('\n⚽ Processing Sports Facilities...')
      const sportsData = await this.fetchFromOverpass(this.getSportsQuery())
      const processedSports = this.processSports(sportsData)
      this.saveToFile(processedSports, 'sports.json')
      this.stats.sports = await this.loadDataToDatabase(Sports, processedSports, 'sports')

      // Generate and load sample events
      console.log('\n🎉 Processing Sample Events...')
      const sampleEvents = this.generateSampleEvents()
      this.saveToFile(sampleEvents, 'events.json')
      this.stats.events = await this.loadDataToDatabase(Event, sampleEvents, 'events')

      // Generate and load sample promotions
      console.log('\n💰 Processing Sample Promotions...')
      const samplePromotions = this.generateSamplePromotions()
      this.saveToFile(samplePromotions, 'promotions.json')
      this.stats.promotions = await this.loadDataToDatabase(Promotion, samplePromotions, 'promotions')

      // Calculate overall statistics
      this.stats.totalProcessed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'total' in stat)
        .reduce((sum, stat: any) => sum + stat.total, 0)
      this.stats.totalSuccessful = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'success' in stat)
        .reduce((sum, stat: any) => sum + stat.success, 0)
      this.stats.totalFailed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'failed' in stat)
        .reduce((sum, stat: any) => sum + stat.failed, 0)
      this.stats.totalPending = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'pending' in stat)
        .reduce((sum, stat: any) => sum + stat.pending, 0)

      this.stats.processingTime = (Date.now() - startTime) / 1000

      // Generate comprehensive report
      this.generateStatisticsReport()

      console.log('\n✅ Data ingestion and loading process completed successfully!')
      console.log(`🎯 ${this.stats.totalSuccessful} records loaded with pending status`)
      console.log('💡 All new records require admin approval before becoming active')

    } catch (error) {
      console.error('💥 Fatal error during data ingestion and loading:', error)
      throw error
    }
  }

  /**
   * Load existing JSON files into database with pending status
   */
  async loadExistingData(): Promise<void> {
    const startTime = Date.now()

    try {
      console.log('📂 Loading existing JSON data files into database...')
      console.log('🎯 Status: All records will be set to PENDING')

      await this.connectToDatabase()

      // Load hotels
      const hotelsPath = path.join(DATA_DIR, 'hotels.json')
      if (fs.existsSync(hotelsPath)) {
        const hotelsData = JSON.parse(fs.readFileSync(hotelsPath, 'utf-8'))
        this.stats.hotels = await this.loadDataToDatabase(Hotel, hotelsData, 'hotels')
      }

      // Load restaurants
      const restaurantsPath = path.join(DATA_DIR, 'restaurants.json')
      if (fs.existsSync(restaurantsPath)) {
        const restaurantsData = JSON.parse(fs.readFileSync(restaurantsPath, 'utf-8'))
        this.stats.restaurants = await this.loadDataToDatabase(Restaurant, restaurantsData, 'restaurants')
      }

      // Load attractions
      const attractionsPath = path.join(DATA_DIR, 'attractions.json')
      if (fs.existsSync(attractionsPath)) {
        const attractionsData = JSON.parse(fs.readFileSync(attractionsPath, 'utf-8'))
        this.stats.attractions = await this.loadDataToDatabase(Attraction, attractionsData, 'attractions')
      }

      // Load sports
      const sportsPath = path.join(DATA_DIR, 'sports.json')
      if (fs.existsSync(sportsPath)) {
        const sportsData = JSON.parse(fs.readFileSync(sportsPath, 'utf-8'))
        this.stats.sports = await this.loadDataToDatabase(Sports, sportsData, 'sports')
      }

      // Load events
      const eventsPath = path.join(DATA_DIR, 'events.json')
      if (fs.existsSync(eventsPath)) {
        const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'))
        this.stats.events = await this.loadDataToDatabase(Event, eventsData, 'events')
      }

      // Load promotions
      const promotionsPath = path.join(DATA_DIR, 'promotions.json')
      if (fs.existsSync(promotionsPath)) {
        const promotionsData = JSON.parse(fs.readFileSync(promotionsPath, 'utf-8'))
        this.stats.promotions = await this.loadDataToDatabase(Promotion, promotionsData, 'promotions')
      }

      // Calculate overall statistics
      this.stats.totalProcessed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'total' in stat)
        .reduce((sum, stat: any) => sum + stat.total, 0)
      this.stats.totalSuccessful = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'success' in stat)
        .reduce((sum, stat: any) => sum + stat.success, 0)
      this.stats.totalFailed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'failed' in stat)
        .reduce((sum, stat: any) => sum + stat.failed, 0)
      this.stats.totalPending = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'pending' in stat)
        .reduce((sum, stat: any) => sum + stat.pending, 0)

      this.stats.processingTime = (Date.now() - startTime) / 1000

      // Generate comprehensive report
      this.generateStatisticsReport()

      console.log('\n✅ Existing data loading completed successfully!')

    } catch (error) {
      console.error('💥 Fatal error during data loading:', error)
      throw error
    }
  }

  /**
   * Delete all pending records and perform fresh ingestion
   */
  async freshIngestAndLoad(): Promise<void> {
    const startTime = Date.now()

    try {
      console.log('🚀 Starting fresh data ingestion process...')
      console.log('⚠️  WARNING: This will delete ALL pending records and fetch fresh data')
      console.log('📍 Target: Kolkata, West Bengal')
      console.log('🎯 Status: All records will be fresh with pending status')

      // Connect to database
      await this.connectToDatabase()

      // Delete all pending records
      console.log('\n🗑️  Deleting all pending records...')
      await this.deletePendingRecords()

      // Fetch and process hotels
      console.log('\n🏨 Processing Hotels...')
      const hotelsData = await this.fetchFromOverpass(this.getHotelsQuery())
      const processedHotels = this.processHotels(hotelsData)
      this.saveToFile(processedHotels, 'hotels.json')
      this.stats.hotels = await this.loadDataToDatabase(Hotel, processedHotels, 'hotels')

      await this.sleep(2000)

      // Fetch and process restaurants
      console.log('\n🍽️ Processing Restaurants...')
      const restaurantsData = await this.fetchFromOverpass(this.getRestaurantsQuery())
      const processedRestaurants = this.processRestaurants(restaurantsData)
      this.saveToFile(processedRestaurants, 'restaurants.json')
      this.stats.restaurants = await this.loadDataToDatabase(Restaurant, processedRestaurants, 'restaurants')

      await this.sleep(2000)

      // Fetch and process attractions
      console.log('\n🏛️ Processing Attractions...')
      const attractionsData = await this.fetchFromOverpass(this.getAttractionsQuery())
      const processedAttractions = this.processAttractions(attractionsData)
      this.saveToFile(processedAttractions, 'attractions.json')
      this.stats.attractions = await this.loadDataToDatabase(Attraction, processedAttractions, 'attractions')

      await this.sleep(2000)

      // Fetch and process sports facilities
      console.log('\n⚽ Processing Sports Facilities...')
      const sportsData = await this.fetchFromOverpass(this.getSportsQuery())
      const processedSports = this.processSports(sportsData)
      this.saveToFile(processedSports, 'sports.json')
      this.stats.sports = await this.loadDataToDatabase(Sports, processedSports, 'sports')

      // Generate and load sample events
      console.log('\n🎉 Processing Sample Events...')
      const sampleEvents = this.generateSampleEvents()
      this.saveToFile(sampleEvents, 'events.json')
      this.stats.events = await this.loadDataToDatabase(Event, sampleEvents, 'events')

      // Generate and load sample promotions
      console.log('\n💰 Processing Sample Promotions...')
      const samplePromotions = this.generateSamplePromotions()
      this.saveToFile(samplePromotions, 'promotions.json')
      this.stats.promotions = await this.loadDataToDatabase(Promotion, samplePromotions, 'promotions')

      // Calculate overall statistics
      this.stats.totalProcessed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'total' in stat)
        .reduce((sum, stat: any) => sum + stat.total, 0)
      this.stats.totalSuccessful = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'success' in stat)
        .reduce((sum, stat: any) => sum + stat.success, 0)
      this.stats.totalFailed = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'failed' in stat)
        .reduce((sum, stat: any) => sum + stat.failed, 0)
      this.stats.totalPending = Object.values(this.stats).filter(stat => typeof stat === 'object' && 'pending' in stat)
        .reduce((sum, stat: any) => sum + stat.pending, 0)

      this.stats.processingTime = (Date.now() - startTime) / 1000

      // Generate comprehensive report
      this.generateStatisticsReport()

      console.log('\n✅ Fresh data ingestion and loading process completed successfully!')
      console.log(`🎯 ${this.stats.totalSuccessful} fresh records loaded with pending status`)
      console.log('💡 All records are fresh and require admin approval before becoming active')

    } catch (error) {
      console.error('💥 Fatal error during fresh data ingestion and loading:', error)
      throw error
    }
  }

  /**
   * Delete all pending records from all collections
   */
  private async deletePendingRecords(): Promise<void> {
    try {
      console.log('🔄 Deleting pending records from all collections...')

      const deletePromises = [
        Hotel.deleteMany({ status: 'pending' }),
        Restaurant.deleteMany({ status: 'pending' }),
        Attraction.deleteMany({ status: 'pending' }),
        Sports.deleteMany({ status: 'pending' }),
        Event.deleteMany({ status: 'pending' }),
        Promotion.deleteMany({ status: 'pending' })
      ]

      const results = await Promise.all(deletePromises)
      const collections = ['Hotels', 'Restaurants', 'Attractions', 'Sports', 'Events', 'Promotions']

      let totalDeleted = 0
      results.forEach((result, index) => {
        const deleted = result.deletedCount || 0
        totalDeleted += deleted
        if (deleted > 0) {
          console.log(`   ✅ ${collections[index]}: ${deleted} pending records deleted`)
        } else {
          console.log(`   ⚪ ${collections[index]}: No pending records found`)
        }
      })

      console.log(`🗑️  Total pending records deleted: ${totalDeleted}`)
      
      if (totalDeleted === 0) {
        console.log('💡 No pending records were found to delete')
      } else {
        console.log('✅ All pending records have been successfully removed')
      }

    } catch (error) {
      console.error('❌ Error deleting pending records:', error)
      throw error
    }
  }
}

// Export for use as a module
export default DataIngestionManager

// If running directly
if (require.main === module) {
  const ingestionManager = new DataIngestionManager()

  // Check command line arguments
  const args = process.argv.slice(2)
  const command = args[0] || 'ingest-and-load'

  switch (command) {
    case 'ingest-and-load':
      ingestionManager.ingestAndLoadAll()
        .then(() => {
          console.log('🎉 Data ingestion and loading completed successfully!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('💥 Data ingestion and loading failed:', error)
          process.exit(1)
        })
      break

    case 'load-existing':
      ingestionManager.loadExistingData()
        .then(() => {
          console.log('🎉 Existing data loading completed successfully!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('💥 Data loading failed:', error)
          process.exit(1)
        })
      break

    case 'fresh-ingest':
      ingestionManager.freshIngestAndLoad()
        .then(() => {
          console.log('🎉 Fresh data ingestion completed successfully!')
          process.exit(0)
        })
        .catch((error) => {
          console.error('💥 Fresh data ingestion failed:', error)
          process.exit(1)
        })
      break

    default:
      console.log('Usage:')
      console.log('  npm run data-manager:ingest    # Fetch from OSM and load to DB (skip existing)')
      console.log('  npm run data-manager:load      # Load existing JSON files to DB')
      console.log('  npm run data-manager:fresh     # Delete pending records and fetch fresh data')
      console.log('')
      console.log('Available commands:')
      console.log('  ingest-and-load    - Incremental data ingestion (preserves existing records)')
      console.log('  load-existing      - Load data from existing JSON files')
      console.log('  fresh-ingest       - Complete refresh (deletes all pending records first)')
      process.exit(1)
  }
}
