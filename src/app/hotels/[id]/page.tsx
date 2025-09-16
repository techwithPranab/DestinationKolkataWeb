import { Metadata } from 'next'
import connectDB from '@/lib/mongodb'
import { Hotel, IHotel } from '@/models'
import { generateSEOMetadata } from '@/components/SEO/SEOPage'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    await connectDB()
    const hotel = await Hotel.findById(params.id).lean() as (IHotel & {
      images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>
      address?: { street?: string; area?: string; city?: string; state?: string; pincode?: string; landmark?: string }
      amenities?: string[]
    }) | null
    
    if (!hotel) {
      return {
        title: 'Hotel Not Found',
        description: 'The requested hotel could not be found.'
      }
    }

    const keywords = [
      'hotel',
      'accommodation',
      'kolkata',
      hotel.name,
      hotel.address?.city || 'kolkata',
      hotel.category || 'hotel',
      ...(hotel.amenities?.slice(0, 5) || [])
    ]

    return generateSEOMetadata({
      title: `${hotel.name} - Hotel in ${hotel.address?.city || 'Kolkata'}`,
      description: hotel.description || `Book ${hotel.name} in ${hotel.address?.city || 'Kolkata'}. ${hotel.amenities?.slice(0, 3).join(', ') || 'Great amenities'} and more.`,
      keywords,
      image: hotel.images?.[0]?.url,
      url: `/hotels/${hotel._id}`,
      type: 'website'
    })
  } catch (error) {
    console.error('Error generating hotel metadata:', error)
    return {
      title: 'Hotel Details',
      description: 'Find detailed information about hotels in Kolkata.'
    }
  }
}

export default function HotelPage({ params }: PageProps) {
  // This would be your actual hotel page component
  return (
    <div>
      <h1>Hotel {params.id}</h1>
      {/* Hotel details component here */}
    </div>
  )
}
