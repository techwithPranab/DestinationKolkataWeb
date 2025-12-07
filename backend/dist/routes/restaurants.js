"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("../lib/db"));
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const sampleRestaurants = [
    {
        name: '6 Ballygunge Place',
        description: 'Authentic Bengali cuisine in a heritage setting. Experience traditional flavors with modern presentation.',
        shortDescription: 'Authentic Bengali cuisine in heritage setting',
        images: [
            {
                url: '/images/6-ballygunge-place.jpg',
                alt: '6 Ballygunge Place interior',
                isPrimary: true
            }
        ],
        location: {
            type: 'Point',
            coordinates: [88.3654, 22.5275]
        },
        address: {
            street: '6 Ballygunge Place',
            area: 'Ballygunge',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700019'
        },
        contact: {
            phone: ['+91-33-2287-0000'],
            email: 'info@6ballygungeplace.com',
            website: 'https://www.6ballygungeplace.com'
        },
        rating: {
            average: 4.6,
            count: 1245
        },
        amenities: ['AC', 'Parking', 'WiFi', 'Outdoor Seating'],
        tags: ['bengali', 'heritage', 'fine-dining'],
        status: 'active',
        featured: true,
        promoted: true,
        cuisine: ['Bengali', 'Indian'],
        priceRange: 'Fine Dining',
        openingHours: {
            monday: { open: '12:00', close: '23:00', closed: false },
            tuesday: { open: '12:00', close: '23:00', closed: false },
            wednesday: { open: '12:00', close: '23:00', closed: false },
            thursday: { open: '12:00', close: '23:00', closed: false },
            friday: { open: '12:00', close: '23:00', closed: false },
            saturday: { open: '12:00', close: '23:00', closed: false },
            sunday: { open: '12:00', close: '23:00', closed: false }
        },
        views: 3200
    },
    {
        name: 'Kewpies Kitchen',
        description: 'Home-style Bengali cooking in a cozy, family-like atmosphere. Known for authentic fish curry and traditional sweets.',
        shortDescription: 'Home-style Bengali cooking',
        images: [
            {
                url: '/images/kewpies-kitchen.jpg',
                alt: 'Kewpies Kitchen dining area',
                isPrimary: true
            }
        ],
        location: {
            type: 'Point',
            coordinates: [88.3476, 22.5488]
        },
        address: {
            street: '2 Elgin Lane',
            area: 'Elgin Road',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700020'
        },
        contact: {
            phone: ['+91-33-2223-1600'],
            email: 'kewpieskitchen@gmail.com'
        },
        rating: {
            average: 4.4,
            count: 890
        },
        amenities: ['AC', 'WiFi'],
        tags: ['bengali', 'home-style', 'authentic'],
        status: 'active',
        featured: true,
        promoted: false,
        cuisine: ['Bengali'],
        priceRange: 'Casual Dining',
        openingHours: {
            monday: { open: '12:00', close: '22:00', closed: false },
            tuesday: { open: '12:00', close: '22:00', closed: false },
            wednesday: { open: '12:00', close: '22:00', closed: false },
            thursday: { open: '12:00', close: '22:00', closed: false },
            friday: { open: '12:00', close: '22:00', closed: false },
            saturday: { open: '12:00', close: '22:00', closed: false },
            sunday: { open: '12:00', close: '22:00', closed: false }
        },
        views: 2100
    }
];
async function createSampleRestaurantsIfNeeded() {
    const restaurantCount = await models_1.Restaurant.countDocuments();
    if (restaurantCount === 0) {
        try {
            await models_1.Restaurant.insertMany(sampleRestaurants);
            console.log('Sample restaurants created successfully');
        }
        catch (error) {
            console.error('Error creating sample restaurants:', error);
        }
    }
}
function buildRestaurantQuery(query) {
    const mongoQuery = {};
    if (query.status && query.status !== 'all') {
        mongoQuery.status = query.status;
    }
    else if (!query.status) {
        mongoQuery.status = 'active';
    }
    if (query.cuisine) {
        mongoQuery.cuisine = { $in: query.cuisine.split(',') };
    }
    if (query.priceRange) {
        mongoQuery.priceRange = query.priceRange;
    }
    if (query.rating) {
        mongoQuery['rating.average'] = { $gte: parseFloat(query.rating) };
    }
    if (query.amenities) {
        mongoQuery.amenities = { $in: query.amenities.split(',') };
    }
    if (query.search) {
        mongoQuery.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
            { 'address.area': { $regex: query.search, $options: 'i' } },
            { cuisine: { $in: [new RegExp(query.search, 'i')] } },
            { tags: { $in: [new RegExp(query.search, 'i')] } }
        ];
    }
    return mongoQuery;
}
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        await createSampleRestaurantsIfNeeded();
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '12');
        const skip = (page - 1) * limit;
        const lat = parseFloat(req.query.lat || '0');
        const lng = parseFloat(req.query.lng || '0');
        const distance = parseInt(req.query.distance || '50');
        const query = buildRestaurantQuery(req.query);
        let restaurants;
        let total;
        if (lat && lng) {
            const pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        distanceField: 'distance',
                        maxDistance: distance * 1000,
                        spherical: true,
                        query: query
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ];
            restaurants = await models_1.Restaurant.aggregate(pipeline);
            const totalPipeline = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [lng, lat] },
                        distanceField: 'distance',
                        maxDistance: distance * 1000,
                        spherical: true,
                        query: query
                    }
                },
                { $count: 'total' }
            ];
            const totalResults = await models_1.Restaurant.aggregate(totalPipeline);
            total = totalResults[0]?.total || 0;
        }
        else {
            restaurants = await models_1.Restaurant.find(query)
                .sort({ featured: -1, promoted: -1, 'rating.average': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            total = await models_1.Restaurant.countDocuments(query);
        }
        const overallTotal = await models_1.Restaurant.countDocuments();
        const activeCount = await models_1.Restaurant.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                activeCount,
                overallTotal
            },
            filters: {
                cuisine: req.query.cuisine ? req.query.cuisine.split(',') : [],
                priceRange: req.query.priceRange,
                rating: req.query.rating,
                amenities: req.query.amenities ? req.query.amenities.split(',') : [],
                search: req.query.search,
                location: lat && lng ? { lat, lng, distance } : null
            }
        });
    }
    catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.post('/', auth_1.requireAdmin, async (req, res) => {
    try {
        await (0, db_1.default)();
        const body = req.body;
        const requiredFields = ['name', 'description', 'location', 'cuisine'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const restaurant = new models_1.Restaurant({
            ...body,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await restaurant.save();
        res.status(201).json({
            success: true,
            data: restaurant,
            message: 'Restaurant submitted successfully. It will be reviewed before being published.'
        });
    }
    catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create restaurant',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        let restaurant;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            restaurant = await models_1.Restaurant.findById(id).lean();
        }
        if (!restaurant) {
            restaurant = await models_1.Restaurant.findOne({ slug: id }).lean();
        }
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }
        if (!req.user || req.user.role !== 'admin') {
            await models_1.Restaurant.findByIdAndUpdate(restaurant._id, { $inc: { views: 1 } });
        }
        const restaurantData = {
            ...restaurant,
            images: restaurant.images || []
        };
        res.status(200).json({
            success: true,
            data: restaurantData
        });
    }
    catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant'
        });
    }
});
exports.default = router;
//# sourceMappingURL=restaurants.js.map