"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../lib/mongodb");
const mongodb_2 = require("mongodb");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const { category, district, search, nearbyCoordinates, maxDistance } = req.query;
        const filter = { verified: true };
        if (category) {
            filter.category = category;
        }
        if (district) {
            filter.district = district;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (nearbyCoordinates) {
            const coords = nearbyCoordinates.split(',').map(Number);
            const distance = maxDistance ? Number(maxDistance) : 5000;
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coords
                    },
                    $maxDistance: distance
                }
            };
        }
        const contacts = await db
            .collection('emergencycontacts')
            .find(filter)
            .sort({ featured: -1, lastUpdated: -1 })
            .toArray();
        res.status(200).json({
            success: true,
            data: contacts,
            count: contacts.length
        });
    }
    catch (error) {
        console.error('Get emergency contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency contacts'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const { id } = req.params;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }
        const contact = await db
            .collection('emergencycontacts')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }
        res.status(200).json({
            success: true,
            data: contact
        });
    }
    catch (error) {
        console.error('Get emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency contact'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const { name, category, phone, email, address, location, district, area, description, operatingHours, website, services, featured } = req.body;
        if (!name || !category || !phone || !address || !district || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const validCategories = ['hospital', 'police', 'fire', 'ambulance', 'general'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }
        if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates format'
            });
        }
        const newContact = {
            name: name.trim(),
            category: category.toLowerCase(),
            phone: Array.isArray(phone) ? phone : [phone],
            email: email?.trim(),
            address: address.trim(),
            location: {
                type: 'Point',
                coordinates: location.coordinates
            },
            district: district.trim(),
            area: area?.trim(),
            description: description.trim(),
            operatingHours,
            website,
            services: Array.isArray(services) ? services : [],
            featured: featured || false,
            verified: false,
            lastUpdated: new Date()
        };
        const result = await db
            .collection('emergencycontacts')
            .insertOne(newContact);
        res.status(201).json({
            success: true,
            data: {
                _id: result.insertedId,
                ...newContact
            },
            message: 'Emergency contact created successfully'
        });
    }
    catch (error) {
        console.error('Create emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create emergency contact'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const { id } = req.params;
        const updates = req.body;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }
        delete updates.createdAt;
        const result = await db
            .collection('emergencycontacts')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, {
            $set: {
                ...updates,
                lastUpdated: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Emergency contact updated successfully'
        });
    }
    catch (error) {
        console.error('Update emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update emergency contact'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const { id } = req.params;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }
        const result = await db
            .collection('emergencycontacts')
            .deleteOne({ _id: new mongodb_2.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Emergency contact deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete emergency contact'
        });
    }
});
exports.default = router;
//# sourceMappingURL=emergency-contacts.js.map