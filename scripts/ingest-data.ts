import axios from 'axios'
import fs from 'fs'
import path from 'path'

/**
 * Data Ingestion Script for Destination Kolkata
 * 
 * This script fetches data from various sources:
 * 1. OpenStreetMap (Overpass API) for POIs, hotels, restaurants
 * 2. Sample data generation for events and promotions
 * 
 * Usage: npm run ingest-data
 */

// Kolkata bounding box [south, west, north, east]
const KOLKATA_BBOX = '22.4696, 88.3019, 22.6482, 88.4333'

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

class DataIngestionService {
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter'
  private readonly outputDir = './data/ingested'

  constructor() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * Fetch data from Overpass API
   */
  async fetchFromOverpass(query: string): Promise<OSMResponse> {
    try {
      console.log('Fetching data from Overpass API...')
      const response = await axios.post(this.overpassUrl, query, {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 30000 // 30 seconds timeout
      })
      return response.data
    } catch (error) {
      console.error('Error fetching from Overpass API:', error)
      throw error
    }
  }

  /**
   * Generate Overpass query for hotels in Kolkata
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
        relation["tourism"="hotel"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for restaurants in Kolkata
   */
  getRestaurantsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](${KOLKATA_BBOX});
        node["amenity"="cafe"](${KOLKATA_BBOX});
        node["amenity"="fast_food"](${KOLKATA_BBOX});
        node["amenity"="food_court"](${KOLKATA_BBOX});
        way["amenity"="restaurant"](${KOLKATA_BBOX});
        way["amenity"="cafe"](${KOLKATA_BBOX});
        way["amenity"="fast_food"](${KOLKATA_BBOX});
        relation["amenity"="restaurant"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for attractions in Kolkata
   */
  getAttractionsQuery(): string {
    return `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](${KOLKATA_BBOX});
        node["tourism"="museum"](${KOLKATA_BBOX});
        node["tourism"="gallery"](${KOLKATA_BBOX});
        node["historic"](${KOLKATA_BBOX});
        node["amenity"="place_of_worship"](${KOLKATA_BBOX});
        node["leisure"="park"](${KOLKATA_BBOX});
        way["tourism"="attraction"](${KOLKATA_BBOX});
        way["tourism"="museum"](${KOLKATA_BBOX});
        way["historic"](${KOLKATA_BBOX});
        way["amenity"="place_of_worship"](${KOLKATA_BBOX});
        way["leisure"="park"](${KOLKATA_BBOX});
        relation["tourism"="attraction"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Generate Overpass query for sports facilities in Kolkata
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
        relation["leisure"="pitch"](${KOLKATA_BBOX});
        relation["leisure"="stadium"](${KOLKATA_BBOX});
        relation["amenity"="sports_centre"](${KOLKATA_BBOX});
        relation["club"="sport"](${KOLKATA_BBOX});
      );
      out body;
      >;
      out skel qt;
    `
  }

  /**
   * Process and normalize hotel data
   */
  processHotels(data: OSMResponse) {
    const hotels = data.elements
      .filter(element => element.lat && element.lon && element.tags)
      .map(element => {
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
            phone: tags.phone ? [tags.phone] : [],
            email: tags.email || '',
            website: tags.website || '',
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
            average: Math.random() * 2 + 3, // Random rating between 3-5
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
          tags: this.extractTags(tags),
          status: 'active',
          featured: Math.random() > 0.8,
          promoted: Math.random() > 0.9,
          osmId: element.id,
          source: 'OpenStreetMap'
        }
      })

    return hotels.filter(hotel => hotel.name !== 'Unnamed Hotel')
  }

  /**
   * Process and normalize restaurant data
   */
  processRestaurants(data: OSMResponse) {
    const restaurants = data.elements
      .filter(element => element.lat && element.lon && element.tags)
      .map(element => {
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
            phone: tags.phone ? [tags.phone] : [],
            email: tags.email || '',
            website: tags.website || '',
            socialMedia: {}
          },
          cuisine: this.extractCuisine(tags),
          priceRange: this.categorizePriceRange(tags),
          openingHours: this.parseOpeningHours(tags.opening_hours),
          menu: this.generateSampleMenu(tags),
          amenities: this.extractRestaurantAmenities(tags),
          rating: {
            average: Math.random() * 2 + 3, // Random rating between 3-5
            count: Math.floor(Math.random() * 200) + 5
          },
          deliveryPartners: Math.random() > 0.5 ? ['Swiggy', 'Zomato'] : [],
          reservationRequired: Math.random() > 0.7,
          avgMealCost: this.estimatePrice(tags.amenity, 'avg'),
          tags: this.extractTags(tags),
          status: 'active',
          featured: Math.random() > 0.8,
          promoted: Math.random() > 0.9,
          osmId: element.id,
          source: 'OpenStreetMap'
        }
      })

    return restaurants.filter(restaurant => restaurant.name !== 'Unnamed Restaurant')
  }

  /**
   * Process and normalize attraction data
   */
  processAttractions(data: OSMResponse) {
    const attractions = data.elements
      .filter(element => element.lat && element.lon && element.tags)
      .map(element => {
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
            phone: tags.phone ? [tags.phone] : [],
            email: tags.email || '',
            website: tags.website || '',
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
          tags: this.extractTags(tags),
          status: 'active',
          featured: Math.random() > 0.8,
          promoted: Math.random() > 0.9,
          osmId: element.id,
          source: 'OpenStreetMap'
        }
      })

    return attractions.filter(attraction => attraction.name !== 'Unnamed Attraction')
  }

  /**
   * Process and normalize sports facilities data
   */
  processSports(data: OSMResponse) {
    const sports = data.elements
      .filter(element => element.lat && element.lon && element.tags)
      .map(element => {
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
            phone: tags.phone ? [tags.phone] : [],
            email: tags.email || '',
            website: tags.website || '',
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
          tags: this.extractTags(tags),
          status: 'active',
          featured: Math.random() > 0.7,
          promoted: Math.random() > 0.8,
          osmId: element.id,
          source: 'OpenStreetMap'
        }
      })

    return sports.filter(sport => sport.name !== 'Unnamed Sports Facility')
  }  /**
   * Helper functions for data processing
   */
  private categorizeHotel(tags: Record<string, string>): string {
    if (tags.stars) {
      const stars = parseInt(tags.stars)
      if (stars >= 4) return 'Luxury'
      if (stars === 3) return 'Business'
      return 'Budget'
    }
    
    if (tags.tourism === 'hostel') return 'Budget'
    if (tags.tourism === 'guest_house') return 'Budget'
    
    // Default categorization based on name
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
        // Map OSM cuisine values to our categories
        if (c.includes('indian') || c.includes('bengali')) return 'Bengali'
        if (c.includes('chinese')) return 'Chinese'
        if (c.includes('continental')) return 'Continental'
        if (c.includes('fast_food')) return 'Fast Food'
        return c.charAt(0).toUpperCase() + c.slice(1)
      })
  }

  private categorizePriceRange(tags: Record<string, string>): string {
    // Simple heuristic based on amenity type and other tags
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

  private extractTags(osmTags: Record<string, string>): string[] {
    const tags: string[] = []
    
    // Add location-based tags
    if (osmTags['addr:suburb']) tags.push(osmTags['addr:suburb'])
    if (osmTags['addr:district']) tags.push(osmTags['addr:district'])
    
    // Add feature tags
    if (osmTags.heritage === 'yes') tags.push('Heritage')
    if (osmTags.tourism) tags.push(osmTags.tourism)
    if (osmTags.amenity) tags.push(osmTags.amenity)
    
    return tags.filter(tag => tag.length > 0)
  }

  private parseOpeningHours(openingHours?: string) {
    // Simple parsing of opening hours - in real implementation, use a proper parser
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
   * Save processed data to files
   */
  private saveToFile(data: any[], filename: string) {
    const filePath = path.join(this.outputDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`✅ Saved ${data.length} items to ${filePath}`)
  }

  /**
   * Main ingestion process
   */
  async ingestAll() {
    try {
      console.log('🚀 Starting data ingestion for Destination Kolkata...')
      
      // Fetch and process hotels
      console.log('\n📍 Fetching hotels...')
      const hotelsData = await this.fetchFromOverpass(this.getHotelsQuery())
      const processedHotels = this.processHotels(hotelsData)
      this.saveToFile(processedHotels, 'hotels.json')
      
      // Wait between requests to avoid rate limiting
      await this.sleep(2000)
      
      // Fetch and process restaurants
      console.log('\n🍽️ Fetching restaurants...')
      const restaurantsData = await this.fetchFromOverpass(this.getRestaurantsQuery())
      const processedRestaurants = this.processRestaurants(restaurantsData)
      this.saveToFile(processedRestaurants, 'restaurants.json')
      
      await this.sleep(2000)
      
      // Fetch and process attractions
      console.log('\n🏛️ Fetching attractions...')
      const attractionsData = await this.fetchFromOverpass(this.getAttractionsQuery())
      const processedAttractions = this.processAttractions(attractionsData)
      this.saveToFile(processedAttractions, 'attractions.json')
      
      await this.sleep(2000)
      
      // Fetch and process sports facilities
      console.log('\n⚽ Fetching sports facilities...')
      const sportsData = await this.fetchFromOverpass(this.getSportsQuery())
      const processedSports = this.processSports(sportsData)
      this.saveToFile(processedSports, 'sports.json')
      
      // Generate sample events and promotions
      console.log('\n🎉 Generating sample events...')
      const sampleEvents = this.generateSampleEvents()
      this.saveToFile(sampleEvents, 'events.json')
      
      console.log('\n💰 Generating sample promotions...')
      const samplePromotions = this.generateSamplePromotions()
      this.saveToFile(samplePromotions, 'promotions.json')
      
      console.log('\n✅ Data ingestion completed successfully!')
      console.log('\n📊 Summary:')
      console.log(`- Hotels: ${processedHotels.length}`)
      console.log(`- Restaurants: ${processedRestaurants.length}`)
      console.log(`- Attractions: ${processedAttractions.length}`)
      console.log(`- Sports Facilities: ${processedSports.length}`)
      console.log(`- Events: ${sampleEvents.length}`)
      console.log(`- Promotions: ${samplePromotions.length}`)
      
    } catch (error) {
      console.error('❌ Error during data ingestion:', error)
      throw error
    }
  }

  private generateSampleEvents() {
    const events = [
      {
        name: 'Durga Puja Festival 2024',
        description: 'The biggest festival of Bengal celebrating Goddess Durga with elaborate pandals and cultural programs.',
        category: 'Festivals',
        startDate: new Date('2024-10-10'),
        endDate: new Date('2024-10-15'),
        startTime: '06:00',
        endTime: '23:00',
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726] // Park Street area
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
        status: 'active',
        featured: true,
        promoted: true
      },
      {
        name: 'Eden Gardens Cricket Match',
        description: 'Exciting cricket match at the historic Eden Gardens stadium.',
        category: 'Sports',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15'),
        startTime: '14:30',
        endTime: '22:30',
        location: {
          type: 'Point',
          coordinates: [88.3426, 22.5648]
        },
        address: {
          street: 'Eden Gardens',
          area: 'Maidan',
          city: 'Kolkata',
          state: 'West Bengal'
        },
        ticketPrice: {
          min: 500,
          max: 5000,
          currency: 'INR',
          isFree: false
        },
        organizer: {
          name: 'Cricket Association of Bengal',
          contact: '+91 33 2248 1911',
          email: 'info@cab.org.in'
        },
        venue: {
          name: 'Eden Gardens',
          capacity: 66000,
          type: 'Outdoor'
        },
        status: 'active',
        featured: true
      }
    ]

    return events
  }

  private generateSamplePromotions() {
    const promotions = [
      {
        title: '30% Off on Heritage Hotels',
        description: 'Experience the royal heritage of Kolkata with 30% discount on all heritage hotels.',
        businessType: 'Hotel',
        discountPercent: 30,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        code: 'HERITAGE30',
        minAmount: 2000,
        maxDiscount: 1500,
        usageLimit: 1000,
        usedCount: 45,
        isActive: true,
        terms: [
          'Valid on heritage category hotels only',
          'Minimum stay of 2 nights required',
          'Cannot be combined with other offers'
        ]
      },
      {
        title: 'Bengali Food Festival - Buy 1 Get 1',
        description: 'Enjoy authentic Bengali cuisine with buy 1 get 1 offer on selected restaurants.',
        businessType: 'Restaurant',
        discountPercent: 50,
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-02-29'),
        code: 'BENGALI50',
        usageLimit: 500,
        usedCount: 123,
        isActive: true,
        terms: [
          'Valid on Bengali cuisine restaurants only',
          'Applicable on main course items',
          'Valid for dine-in only'
        ]
      }
    ]

    return promotions
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export for use as a module
export default DataIngestionService

// If running directly
if (require.main === module) {
  const ingestionService = new DataIngestionService()
  ingestionService.ingestAll()
    .then(() => {
      console.log('Data ingestion completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Data ingestion failed:', error)
      process.exit(1)
    })
}
