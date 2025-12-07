import connectToDatabase from '@/lib/mongodb'
import { Attraction } from '@/models'

async function seedAttractionsData() {
  try {
    console.log('Connecting to database...')
    await connectToDatabase()
    console.log('Connected to database')

    // Clear existing data
    console.log('Clearing existing attractions data...')
    await Attraction.deleteMany({})
    console.log('Cleared existing attractions data')

    // Seed Attractions data
    const attractionsData = [
      {
        name: "Victoria Memorial",
        description: "Magnificent marble monument dedicated to Queen Victoria, housing a museum with British colonial artifacts and paintings.",
        shortDescription: "Iconic marble monument and museum",
        images: [
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Victoria Memorial exterior",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.3426, 22.5448] // Victoria Memorial coordinates
        },
        address: {
          street: "Victoria Memorial",
          area: "Maidan",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700071"
        },
        contact: {
          phone: ["+91-33-2223-1894"],
          website: "https://www.victoriamemorial-cal.org"
        },
        rating: {
          average: 4.5,
          count: 3245
        },
        amenities: ["Guided Tours", "Photography", "Parking", "Gift Shop", "AC", "Wheelchair Access"],
        tags: ["historical", "museum", "colonial", "architecture"],
        status: "active",
        featured: true,
        promoted: true,
        category: "Historical",
        entryFee: {
          adult: 30,
          child: 0,
          senior: 15,
          currency: "INR",
          isFree: false
        },
        timings: {
          open: "10:00",
          close: "17:00",
          closedDays: ["Monday"]
        },
        bestTimeToVisit: "Early morning or late afternoon",
        duration: "2-3 hours",
        guidedTours: {
          available: true,
          languages: ["English", "Hindi", "Bengali"],
          price: 200,
          duration: "1 hour"
        },
        accessibility: {
          wheelchairAccessible: true,
          parkingAvailable: true,
          publicTransport: "Bus, Metro"
        }
      },
      {
        name: "Howrah Bridge",
        description: "Iconic cantilever bridge over the Hooghly River, one of the busiest bridges in the world and symbol of Kolkata.",
        shortDescription: "Iconic cantilever bridge over Hooghly River",
        images: [
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Howrah Bridge at sunset",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.3378, 22.5850] // Howrah Bridge coordinates
        },
        address: {
          street: "Howrah Bridge",
          area: "Howrah",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "711101"
        },
        rating: {
          average: 4.3,
          count: 2156
        },
        amenities: ["Photography", "Public Transport"],
        tags: ["bridge", "architecture", "iconic", "river"],
        status: "active",
        featured: false,
        promoted: false,
        category: "Architecture",
        entryFee: {
          adult: 0,
          child: 0,
          senior: 0,
          currency: "INR",
          isFree: true
        },
        timings: {
          open: "00:00",
          close: "23:59",
          closedDays: []
        },
        bestTimeToVisit: "Evening for best lighting",
        duration: "30-60 minutes",
        accessibility: {
          wheelchairAccessible: false,
          parkingAvailable: false,
          publicTransport: "Train, Bus, Ferry"
        }
      },
      {
        name: "Dakshineswar Kali Temple",
        description: "Sacred Hindu temple dedicated to Goddess Kali, famous for its association with Sri Ramakrishna Paramahamsa.",
        shortDescription: "Sacred temple dedicated to Goddess Kali",
        images: [
          {
            url: "https://images.unsplash.com/photo-1588615403413-2b9c4c8b8b9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Dakshineswar Kali Temple",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.3556, 22.6544] // Dakshineswar coordinates
        },
        address: {
          street: "Dakshineswar Kali Temple",
          area: "Dakshineswar",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700076"
        },
        contact: {
          phone: ["+91-33-2564-5225"]
        },
        rating: {
          average: 4.4,
          count: 1892
        },
        amenities: ["Parking", "Wheelchair Access"],
        tags: ["temple", "religious", "kali", "ramakrishna"],
        status: "active",
        featured: false,
        promoted: false,
        category: "Religious",
        entryFee: {
          adult: 0,
          child: 0,
          senior: 0,
          currency: "INR",
          isFree: true
        },
        timings: {
          open: "06:00",
          close: "12:30",
          closedDays: []
        },
        bestTimeToVisit: "Early morning or evening prayers",
        duration: "1-2 hours",
        accessibility: {
          wheelchairAccessible: true,
          parkingAvailable: true,
          publicTransport: "Bus, Ferry"
        }
      },
      {
        name: "Indian Museum",
        description: "Oldest and largest museum in India, housing rare collections of antiques, ornaments, fossils, and mummies.",
        shortDescription: "Oldest and largest museum in India",
        images: [
          {
            url: "https://images.unsplash.com/photo-1594736797933-d0401ba94ba4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Indian Museum interior",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.3489, 22.5583] // Indian Museum coordinates
        },
        address: {
          street: "27 Jawaharlal Nehru Road",
          area: "Park Street",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700016"
        },
        contact: {
          phone: ["+91-33-2286-1693"],
          website: "https://www.indianmuseumkolkata.org"
        },
        rating: {
          average: 4.2,
          count: 1456
        },
        amenities: ["Guided Tours", "Audio Guide", "Gift Shop", "AC", "Photography"],
        tags: ["museum", "antiques", "history", "education"],
        status: "active",
        featured: false,
        promoted: false,
        category: "Museums",
        entryFee: {
          adult: 20,
          child: 0,
          senior: 10,
          currency: "INR",
          isFree: false
        },
        timings: {
          open: "10:00",
          close: "17:00",
          closedDays: ["Monday"]
        },
        bestTimeToVisit: "Any time during opening hours",
        duration: "2-3 hours",
        guidedTours: {
          available: true,
          languages: ["English", "Hindi", "Bengali"],
          price: 150,
          duration: "1.5 hours"
        },
        accessibility: {
          wheelchairAccessible: true,
          parkingAvailable: true,
          publicTransport: "Bus, Metro"
        }
      },
      {
        name: "Kalighat Kali Temple",
        description: "One of the 51 Shakti Peethas, this ancient temple is dedicated to Goddess Kali and holds immense religious significance.",
        shortDescription: "Ancient temple dedicated to Goddess Kali",
        images: [
          {
            url: "https://images.unsplash.com/photo-1588615403413-2b9c4c8b8b9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Kalighat Kali Temple",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.3467, 22.5167] // Kalighat coordinates
        },
        address: {
          street: "Kalighat Kali Temple",
          area: "Kalighat",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700026"
        },
        contact: {
          phone: ["+91-33-2469-2800"]
        },
        rating: {
          average: 4.1,
          count: 2345
        },
        amenities: ["Parking"],
        tags: ["temple", "religious", "kali", "shakti-peetha"],
        status: "active",
        featured: false,
        promoted: false,
        category: "Religious",
        entryFee: {
          adult: 0,
          child: 0,
          senior: 0,
          currency: "INR",
          isFree: true
        },
        timings: {
          open: "05:00",
          close: "14:00",
          closedDays: []
        },
        bestTimeToVisit: "Early morning for fewer crowds",
        duration: "1-2 hours",
        accessibility: {
          wheelchairAccessible: false,
          parkingAvailable: true,
          publicTransport: "Bus, Auto"
        }
      },
      {
        name: "Science City",
        description: "Largest science center in the Indian subcontinent with interactive exhibits, planetarium, and space theater.",
        shortDescription: "Largest science center in India",
        images: [
          {
            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            alt: "Science City entrance",
            isPrimary: true
          }
        ],
        location: {
          type: "Point",
          coordinates: [88.4011, 22.5411] // Science City coordinates
        },
        address: {
          street: "Science City Road",
          area: "Salt Lake",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700091"
        },
        contact: {
          phone: ["+91-33-2357-6000"],
          website: "https://www.sciencecitykolkata.org.in"
        },
        rating: {
          average: 4.0,
          count: 1765
        },
        amenities: ["Parking", "Food Court", "Gift Shop", "AC", "Wheelchair Access"],
        tags: ["science", "education", "planetarium", "interactive"],
        status: "active",
        featured: true,
        promoted: true,
        category: "Educational",
        entryFee: {
          adult: 60,
          child: 40,
          senior: 30,
          currency: "INR",
          isFree: false
        },
        timings: {
          open: "09:00",
          close: "20:00",
          closedDays: ["Monday"]
        },
        bestTimeToVisit: "Weekdays for less crowd",
        duration: "4-5 hours",
        guidedTours: {
          available: true,
          languages: ["English", "Hindi", "Bengali"],
          price: 100,
          duration: "2 hours"
        },
        accessibility: {
          wheelchairAccessible: true,
          parkingAvailable: true,
          publicTransport: "Bus, Metro"
        }
      }
    ]

    await Attraction.insertMany(attractionsData)
    console.log(`Seeded ${attractionsData.length} attractions successfully!`)

    console.log('All attractions data seeded successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Error seeding attractions data:', error)
    process.exit(1)
  }
}

seedAttractionsData()
