import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import { Hotel, Restaurant, Attraction, Event, Sports } from '@/models'
import { generateSlug } from '@/lib/seo-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  
  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/places`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/travel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sports`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/business-resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/partnerships`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/advertising`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  try {
    await connectDB()

    // Dynamic entity pages
    const dynamicUrls: MetadataRoute.Sitemap = []

    // Hotels
    if (Hotel) {
      const hotels = await Hotel.find({ status: 'active' })
        .select('_id name updatedAt')
        .limit(1000)
        .lean()

      hotels.forEach((hotel) => {
        const slug = generateSlug(hotel.name)
        dynamicUrls.push({
          url: `${baseUrl}/hotels/${hotel._id}`,
          lastModified: hotel.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
        dynamicUrls.push({
          url: `${baseUrl}/hotels/${slug}`,
          lastModified: hotel.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Restaurants
    if (Restaurant) {
      const restaurants = await Restaurant.find({ status: 'active' })
        .select('_id name updatedAt')
        .limit(1000)
        .lean()

      restaurants.forEach((restaurant) => {
        const slug = generateSlug(restaurant.name)
        dynamicUrls.push({
          url: `${baseUrl}/restaurants/${restaurant._id}`,
          lastModified: restaurant.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
        dynamicUrls.push({
          url: `${baseUrl}/restaurants/${slug}`,
          lastModified: restaurant.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Attractions
    if (Attraction) {
      const attractions = await Attraction.find({ status: 'active' })
        .select('_id name updatedAt')
        .limit(1000)
        .lean()

      attractions.forEach((attraction) => {
        const slug = generateSlug(attraction.name)
        dynamicUrls.push({
          url: `${baseUrl}/places/${attraction._id}`,
          lastModified: attraction.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
        dynamicUrls.push({
          url: `${baseUrl}/places/${slug}`,
          lastModified: attraction.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Events
    if (Event) {
      const events = await Event.find({ 
        status: 'active',
        eventDate: { $gte: new Date() }
      })
        .select('_id title updatedAt eventDate')
        .limit(500)
        .lean()

      events.forEach((event) => {
        const slug = generateSlug(event.title)
        const priority = new Date(event.eventDate).getTime() > Date.now() + (30 * 24 * 60 * 60 * 1000) ? 0.6 : 0.9
        
        dynamicUrls.push({
          url: `${baseUrl}/events/${event._id}`,
          lastModified: event.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority,
        })
        dynamicUrls.push({
          url: `${baseUrl}/events/${slug}`,
          lastModified: event.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority,
        })
      })
    }

    // Sports
    if (Sports) {
      const sports = await Sports.find({ status: 'active' })
        .select('_id name updatedAt')
        .limit(500)
        .lean()

      sports.forEach((sport) => {
        const slug = generateSlug(sport.name)
        dynamicUrls.push({
          url: `${baseUrl}/sports/${sport._id}`,
          lastModified: sport.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
        dynamicUrls.push({
          url: `${baseUrl}/sports/${slug}`,
          lastModified: sport.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      })
    }

    return [...staticUrls, ...dynamicUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static urls if dynamic generation fails
    return staticUrls
  }
}
