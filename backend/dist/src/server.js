"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const attractions_1 = __importDefault(require("./routes/attractions"));
const events_1 = __importDefault(require("./routes/events"));
const hotels_1 = __importDefault(require("./routes/hotels"));
const restaurants_1 = __importDefault(require("./routes/restaurants"));
const sports_1 = __importDefault(require("./routes/sports"));
const promotions_1 = __importDefault(require("./routes/promotions"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const travel_1 = __importDefault(require("./routes/travel"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const report_1 = __importDefault(require("./routes/report"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const emergency_contacts_1 = __importDefault(require("./routes/emergency-contacts"));
const upload_1 = __importDefault(require("./routes/upload"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const customer_1 = __importDefault(require("./routes/customer"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Destination Kolkata Backend API'
    });
});
app.use('/api/attractions', attractions_1.default);
app.use('/api/events', events_1.default);
app.use('/api/hotels', hotels_1.default);
app.use('/api/restaurants', restaurants_1.default);
app.use('/api/sports', sports_1.default);
app.use('/api/promotions', promotions_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/travel', travel_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/report', report_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/emergency-contacts', emergency_contacts_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.use('/api/customer', customer_1.default);
app.use('/api/auth', auth_1.default);
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map