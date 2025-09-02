# 🏙️ Destination Kolkata

A comprehensive travel and tourism website for discovering the City of Joy. Built with Next.js, TypeScript, MongoDB, and modern UI components.

## ✨ Features

### 🎯 Core Features
- **Hotels & Accommodations** - Browse, filter, and book places to stay
- **Restaurants & Dining** - Discover local cuisine and dining experiences
- **Tourist Attractions** - Explore historical, cultural, and recreational sites
- **Events & Festivals** - Stay updated with cultural events and celebrations
- **Travel Information** - Comprehensive guides for transportation and travel tips
- **Promotions & Deals** - Special offers and discounts from local businesses

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach with beautiful layouts
- **Modern Animations** - Smooth transitions using Framer Motion
- **Interactive Maps** - Leaflet-powered maps with location pins
- **Advanced Filtering** - Sophisticated search and filter capabilities
- **Dark/Light Mode** - Theme toggle for better user experience
- **SEO Optimized** - Server-side rendering and meta tag optimization

### 🔧 Technical Features
- **Next.js App Router** - Latest Next.js features with TypeScript
- **MongoDB Integration** - GeoJSON indexing for location-based queries
- **Real-time Search** - Fast and accurate search functionality
- **Admin Dashboard** - Content management and analytics
- **Data Ingestion** - Automated data import from OpenStreetMap and APIs
- **Authentication** - User registration and business account management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd destination-kolkata-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/destination-kolkata
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Stripe Configuration (for membership payments)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### Stripe Integration Setup

1. **Create a Stripe Account**
   - Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete account verification

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy your **Publishable key** and **Secret key**
   - Use test keys for development: `pk_test_` and `sk_test_`

3. **Configure Webhooks** (for production)
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`

4. **Test the Integration**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and any CVC
   - Membership purchases will redirect to Stripe Checkout

### Membership Plans Configuration

The membership system supports two plans:
- **Premium** (₹999/month): 15 listings, enhanced visibility
- **Business** (₹2999/month): Unlimited listings, maximum visibility

Prices are configured in `/api/customer/membership/route.ts` and can be modified as needed.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
destination-kolkata-new/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── places/            # Places to stay pages
│   │   ├── restaurants/       # Restaurant pages
│   │   ├── visiting/          # Tourist attractions
│   │   ├── events/            # Events and festivals
│   │   ├── admin/             # Admin dashboard
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   ├── layout/            # Layout components (Navbar, Footer)
│   │   ├── home/              # Homepage components
│   │   └── shared/            # Shared components
│   ├── lib/                   # Utility functions
│   │   ├── mongodb.ts         # Database connection
│   │   └── utils.ts           # Helper functions
│   └── models/                # MongoDB schemas
├── scripts/                   # Data ingestion and utility scripts
├── data/                      # Sample and ingested data
└── public/                    # Static assets
```

## 🗄️ Database Schema

### Collections

#### Hotels
```typescript
{
  name: string
  description: string
  location: GeoJSON Point
  priceRange: { min: number, max: number }
  roomTypes: Array<RoomType>
  amenities: string[]
  category: 'Luxury' | 'Business' | 'Budget' | 'Boutique' | 'Resort' | 'Heritage'
  rating: { average: number, count: number }
  // ... more fields
}
```

#### Restaurants
```typescript
{
  name: string
  description: string
  location: GeoJSON Point
  cuisine: string[]
  priceRange: 'Budget' | 'Mid-range' | 'Fine Dining' | 'Luxury'
  openingHours: WeeklySchedule
  menu: Array<MenuCategory>
  // ... more fields
}
```

#### Attractions
```typescript
{
  name: string
  description: string
  location: GeoJSON Point
  category: 'Historical' | 'Religious' | 'Museums' | 'Parks' | 'Architecture' | 'Cultural'
  entryFee: { adult: number, child: number, senior: number }
  timings: Schedule
  // ... more fields
}
```

#### Events
```typescript
{
  name: string
  description: string
  location: GeoJSON Point
  category: string
  startDate: Date
  endDate: Date
  ticketPrice: { min: number, max: number }
  organizer: OrganizerInfo
  // ... more fields
}
```

## 🌐 API Endpoints

### Hotels API
- `GET /api/hotels` - List hotels with filtering and pagination
- `POST /api/hotels` - Create new hotel listing
- `GET /api/hotels/[id]` - Get hotel details
- `PUT /api/hotels/[id]` - Update hotel information
- `DELETE /api/hotels/[id]` - Delete hotel listing

### Restaurants API
- `GET /api/restaurants` - List restaurants with filtering
- `POST /api/restaurants` - Create new restaurant listing
- `GET /api/restaurants/[id]` - Get restaurant details

### Search API
- `GET /api/search` - Global search across all content types
- `GET /api/search/suggestions` - Search autocomplete suggestions

### Admin API
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/pending` - Pending listings for approval
- `POST /api/admin/approve` - Approve pending listings

## 📊 Data Ingestion

The project includes automated data ingestion from multiple sources:

### OpenStreetMap Integration
```bash
npm run ingest-data
```

This script fetches data from:
- **Hotels & Accommodations** via Overpass API
- **Restaurants & Cafes** with cuisine and amenity data
- **Tourist Attractions** including historical and cultural sites

### External APIs
- **Eventbrite API** for events and festivals
- **Kaggle Datasets** for additional restaurant data
- **Government Tourism Data** for official attractions

### Data Processing
- **GeoJSON Conversion** for location data
- **Data Normalization** and cleanup
- **Image URL Processing** from various sources
- **Rating & Review Aggregation**

## 🎨 UI Components

### Design System
Built with **shadcn/ui** and **Tailwind CSS**:

```typescript
// Example: ListingCard component
<ListingCard
  title="Hotel Oberoi Grand"
  description="Luxury heritage hotel in the heart of Kolkata"
  image="/images/oberoi-grand.jpg"
  rating={4.5}
  price={8500}
  location="Chowringhee"
  category="hotel"
  amenities={['WiFi', 'Pool', 'Spa', 'Restaurant']}
  href="/places/hotels/oberoi-grand"
/>
```

### Interactive Elements
- **FilterSidebar** - Advanced filtering with real-time updates
- **MapView** - Interactive maps with cluster markers
- **SearchBar** - Autocomplete with category suggestions
- **EventCarousel** - Horizontal scrolling event cards
- **ReviewCard** - User reviews with rating displays

## 🔐 Authentication & Authorization

### User Roles
- **Guest** - Browse and search content
- **User** - Create account, save favorites, write reviews
- **Business** - Manage listings, respond to reviews
- **Admin** - Full access, content moderation, analytics

### Features
- **NextAuth.js** integration
- **Email/Password** authentication
- **Social Login** (Google, Facebook)
- **Business Account** verification
- **Role-based** access control

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   git push origin main
   ```

2. **Configure Environment Variables** in Vercel dashboard:
   ```env
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### MongoDB Atlas Setup

1. **Create Cluster** at [MongoDB Atlas](https://cloud.mongodb.com)

2. **Configure Network Access**
   - Add your IP address
   - For production: Add Vercel IP ranges

3. **Create Database User**
   - Username/password authentication
   - Grant read/write access to database

4. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/destination-kolkata
   ```

### Performance Optimization

- **CDN Integration** for images (Cloudinary recommended)
- **Database Indexing** for GeoJSON and search queries
- **Caching Strategy** with Redis (optional)
- **Image Optimization** with Next.js Image component

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- **Page Views** tracking
- **Search Queries** analytics
- **Popular Listings** metrics
- **User Engagement** data

### External Integration
- **Google Analytics** for web analytics
- **Sentry** for error monitoring
- **Vercel Analytics** for performance metrics

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Areas for Contribution
- **New Features** (wishlist, trip planning, reviews)
- **UI/UX Improvements** (accessibility, mobile optimization)
- **Data Sources** (new APIs, datasets)
- **Performance** (caching, optimization)
- **Documentation** (guides, tutorials)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Data Sources
- **OpenStreetMap** - Geographic and POI data
- **Kaggle** - Restaurant and business datasets
- **Eventbrite** - Event information
- **Government of West Bengal** - Tourism data

### Technologies
- **Next.js** - React framework
- **MongoDB** - Database
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Leaflet** - Maps
- **Vercel** - Hosting platform

### Images
- **Unsplash** - Stock photography
- **Wikimedia Commons** - Historical images
- **Local Contributors** - Community photos

---

## 📞 Support

For support, email [support@destinationkolkata.com](mailto:support@destinationkolkata.com) or join our [Discord community](https://discord.gg/destinationkolkata).

### Quick Links
- [Live Demo](https://destination-kolkata.vercel.app)
- [API Documentation](https://destination-kolkata.vercel.app/docs)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ for the City of Joy 🏙️
