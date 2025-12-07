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

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Destination Kolkata Backend API'
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
