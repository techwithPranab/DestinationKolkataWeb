"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../lib/db"));
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const sampleHotels = [
    {
        name: 'The Astor Kolkata',
        description: 'A luxury heritage hotel in the heart of Kolkata, offering world-class amenities and impeccable service.',
        shortDescription: 'Luxury heritage hotel with modern amenities',
        category: 'Luxury',
        location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
        },
        address: {
            street: '15 Jawaharlal Nehru Road',
            area: 'Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700013',
            landmark: 'Near Park Street'
        },
        contact: {
            phone: ['+91-33-2229-0101'],
            email: 'reservations@theastorkolkata.com',
            website: 'https://www.theastorkolkata.com',
            socialMedia: {
                facebook: 'https://facebook.com/theastorkolkata',
                instagram: 'https://instagram.com/theastorkolkata'
            }
        },
        priceRange: {
            min: 8000,
            max: 25000,
            currency: 'INR'
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service', 'Concierge'],
        roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
        images: [{
                url: '/images/astor-kolkata.jpg',
                alt: 'The Astor Kolkata exterior',
                isPrimary: true
            }],
        tags: ['Luxury', 'Heritage', 'Business', 'Central Location'],
        status: 'active',
        featured: true,
        promoted: true,
        rating: {
            average: 4.5,
            count: 1250
        },
        views: 5600
    },
    {
        name: 'Budget Inn Kolkata',
        description: 'Affordable and comfortable accommodation for budget-conscious travelers visiting Kolkata.',
        shortDescription: 'Budget-friendly accommodation in Kolkata',
        category: 'Budget',
        location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
        },
        address: {
            street: '123 MG Road',
            area: 'Ballygunge',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700019',
            landmark: 'Near Ballygunge Station'
        },
        contact: {
            phone: ['+91-33-2465-1234'],
            email: 'info@budgetinnkolkata.com',
            website: 'https://www.budgetinnkolkata.com'
        },
        priceRange: {
            min: 1500,
            max: 3500,
            currency: 'INR'
        },
        checkInTime: '12:00',
        checkOutTime: '11:00',
        amenities: ['WiFi', 'Restaurant', 'Room Service', 'Parking'],
        roomTypes: ['Standard Room', 'Deluxe Room'],
        images: [{
                url: '/images/budget-inn-kolkata.jpg',
                alt: 'Budget Inn Kolkata',
                isPrimary: true
            }],
        tags: ['Budget', 'Affordable', 'Central Location'],
        status: 'active',
        featured: false,
        promoted: false,
        rating: {
            average: 3.8,
            count: 320
        },
        views: 1200
    }
];
async function createSampleHotelsIfNeeded() {
    const hotelCount = await models_1.Hotel.countDocuments();
    if (hotelCount === 0) {
        try {
            await models_1.Hotel.insertMany(sampleHotels);
            console.log('Sample hotels created successfully');
        }
        catch (error) {
            console.error('Error creating sample hotels:', error);
        }
    }
}
function buildHotelQuery(query) {
    const mongoQuery = {};
    if (query.status && query.status !== 'all') {
        mongoQuery.status = query.status;
    }
    else if (!query.status) {
        mongoQuery.status = 'active';
    }
    if (query.category) {
        mongoQuery.category = query.category;
    }
    if (query.minPrice || query.maxPrice) {
        if (query.minPrice)
            mongoQuery['priceRange.min'] = { $gte: parseInt(query.minPrice) };
        if (query.maxPrice)
            mongoQuery['priceRange.max'] = { $lte: parseInt(query.maxPrice) };
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
            { tags: { $in: [new RegExp(query.search, 'i')] } }
        ];
    }
    return mongoQuery;
}
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        await createSampleHotelsIfNeeded();
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '12');
        const skip = (page - 1) * limit;
        const lat = parseFloat(req.query.lat || '0');
        const lng = parseFloat(req.query.lng || '0');
        const distance = parseInt(req.query.distance || '50');
        const query = buildHotelQuery(req.query);
        let hotels;
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
                {
                    $addFields: {
                        reviewCount: '$rating.count',
                        averagePrice: { $avg: ['$priceRange.min', '$priceRange.max'] }
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ];
            hotels = await models_1.Hotel.aggregate(pipeline);
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
            const totalResults = await models_1.Hotel.aggregate(totalPipeline);
            total = totalResults[0]?.total || 0;
        }
        else {
            hotels = await models_1.Hotel.find(query)
                .sort({ featured: -1, promoted: -1, 'rating.average': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            total = await models_1.Hotel.countDocuments(query);
        }
        const overallTotal = await models_1.Hotel.countDocuments();
        const activeCount = await models_1.Hotel.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            hotels,
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
                category: req.query.category,
                priceRange: {
                    min: req.query.minPrice,
                    max: req.query.maxPrice
                },
                rating: req.query.rating,
                amenities: req.query.amenities ? req.query.amenities.split(',') : [],
                search: req.query.search,
                location: lat && lng ? { lat, lng, distance } : null
            }
        });
    }
    catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hotels',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.post('/', auth_1.requireAdmin, async (req, res) => {
    try {
        await (0, db_1.default)();
        const body = req.body;
        const requiredFields = ['name', 'description', 'location', 'priceRange', 'category'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const hotel = new models_1.Hotel({
            ...body,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await hotel.save();
        res.status(201).json({
            success: true,
            data: hotel,
            message: 'Hotel submitted successfully. It will be reviewed before being published.'
        });
    }
    catch (error) {
        console.error('Error creating hotel:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create hotel',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const hotel = await models_1.Hotel.findById(id).lean();
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }
        if (!req.user || req.user.role !== 'admin') {
            await models_1.Hotel.findByIdAndUpdate(id, { $inc: { views: 1 } });
        }
        res.status(200).json({
            success: true,
            data: hotel
        });
    }
    catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hotel'
        });
    }
});
exports.default = router;
//# sourceMappingURL=hotels.js.map