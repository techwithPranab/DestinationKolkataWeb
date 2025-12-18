import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Import routes
import attractionsRouter from './routes/attractions';
import eventsRouter from './routes/events';
import hotelsRouter from './routes/hotels';
import restaurantsRouter from './routes/restaurants';
import sportsRouter from './routes/sports';
import promotionsRouter from './routes/promotions';
import reviewsRouter from './routes/reviews';
import travelRouter from './routes/travel';
import feedbackRouter from './routes/feedback';
import reportRouter from './routes/report';
import submissionsRouter from './routes/submissions';
import emergencyContactsRouter from './routes/emergency-contacts';
import uploadRouter from './routes/upload';
import webhooksRouter from './routes/webhooks';
import customerRouter from './routes/customer';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting - use environment variables
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // increased limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.floor(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for:
    // 1. Health checks
    // 2. OPTIONS requests (CORS preflight)
    // 3. Development environment requests from localhost
    return req.path === '/health' || 
           req.method === 'OPTIONS' ||
           (process.env.NODE_ENV === 'development' && (req.headers.origin?.includes('localhost') || false));
  }
});

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Handle OPTIONS requests for CORS preflight before rate limiting
app.options('*', (req, res) => {
  console.log('OPTIONS request for:', req.path, 'from origin:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: (origin, callback) => {
    // Get allowed origins from environment variable
    const frontendUrls = process.env.FRONTEND_URL || 'http://localhost:3001';
    const allowedOrigins = frontendUrls.split(',').map(url => url.trim());
    
    console.log('CORS request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Destination Kolkata Backend API',
    cors: {
      origin: req.headers.origin,
      allowed: process.env.NODE_ENV === 'development' ? 'all local origins' : 'production origins only'
    }
  });
});

// API Routes
app.use('/api/attractions', attractionsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/travel', travelRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/report', reportRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/emergency-contacts', emergencyContactsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/customer', customerRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', err.message);
  console.error('Stack trace:', err.stack);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: err.message,
      origin: req.headers.origin 
    });
  }
  
  // Rate limiting errors
  if (err.status === 429 || err.message.includes('rate limit')) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later.',
      retryAfter: 900
    });
  }
  
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
