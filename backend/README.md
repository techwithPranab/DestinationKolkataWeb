# Destination Kolkata - Backend API

This is the backend API server for the Destination Kolkata tourism application, built with Express.js, TypeScript, and MongoDB.

## Features

- RESTful API endpoints for tourism data
- User authentication and authorization
- File upload handling (Cloudinary integration)
- Rate limiting and security middleware
- MongoDB database with Mongoose ODM
- Email notifications (Nodemailer)
- Stripe payment integration
- TypeScript for type safety

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── models/          # MongoDB/Mongoose models
│   ├── middleware/      # Custom middleware functions
│   ├── lib/             # Utility libraries
│   └── server.ts        # Express server configuration
├── scripts/             # Database seeding and utility scripts
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual configuration values.

4. **Build the project:**
   ```bash
   npm run build
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using `tsx watch`.

#### Production Mode
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files
- `npm run seed-admin` - Create admin user
- `npm run ingest-data` - Ingest data from JSON files
- `npm run load-data` - Load data into MongoDB

## API Endpoints

### Base URL
- Development: `http://localhost:5000`
- Production: Your deployed backend URL

### Health Check
- `GET /health` - Check server status

### Main API Routes
- `POST /api/auth/*` - Authentication endpoints
- `GET|POST /api/attractions` - Tourist attractions
- `GET|POST /api/events` - Events and activities
- `GET|POST /api/hotels` - Hotel listings
- `GET|POST /api/restaurants` - Restaurant listings
- `GET|POST /api/sports` - Sports facilities
- `GET|POST /api/promotions` - Promotions and deals
- `GET|POST /api/reviews` - User reviews
- `GET|POST /api/travel` - Travel information
- `POST /api/feedback` - User feedback
- `POST /api/report` - Issue reporting
- `POST /api/upload` - File uploads
- `GET /api/emergency-contacts` - Emergency contacts

## Database

The application uses MongoDB with Mongoose ODM. The database schema includes:

- Users (authentication and profiles)
- Attractions (tourist spots)
- Hotels (accommodations)
- Restaurants (dining options)
- Events (activities and events)
- Reviews (user feedback)
- And more...

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token authentication
- Input validation
- MongoDB injection prevention

## Deployment

### Docker (Optional)
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=mongodb+srv://...`
- `JWT_SECRET=very-secure-secret`
- `FRONTEND_URL=https://your-frontend-domain.com`
- And all other configuration values

## Development Notes

### Adding New Routes
1. Create a new router file in `src/routes/`
2. Import and register it in `src/server.ts`
3. Add corresponding models if needed

### Database Operations
- Use the provided scripts for data management
- Models are defined in `src/models/`
- Database connection is configured in `src/lib/db.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
