import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

const router = Router();

interface EmergencyContact {
  _id?: ObjectId;
  name: string;
  category: string; // 'hospital', 'police', 'fire', 'ambulance', 'general'
  phone: string[];
  email?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  district: string;
  area?: string;
  description: string;
  operatingHours?: string;
  website?: string;
  services?: string[];
  featured: boolean;
  verified: boolean;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// GET - Get all emergency contacts with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { category, district, search, nearbyCoordinates, maxDistance } = req.query;

    const filter: any = { verified: true };

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

    // Geo-proximity search
    if (nearbyCoordinates) {
      const coords = (nearbyCoordinates as string).split(',').map(Number);
      const distance = maxDistance ? Number(maxDistance) : 5000; // 5km default

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
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts'
    });
  }
});

// GET - Get single emergency contact by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    const contact = await db
      .collection('emergencycontacts')
      .findOne({ _id: new ObjectId(id) });

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
  } catch (error) {
    console.error('Get emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contact'
    });
  }
});

// POST - Create new emergency contact (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const {
      name,
      category,
      phone,
      email,
      address,
      location,
      district,
      area,
      description,
      operatingHours,
      website,
      services,
      featured
    } = req.body;

    // Validation
    if (!name || !category || !phone || !address || !district || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate category
    const validCategories = ['hospital', 'police', 'fire', 'ambulance', 'general'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Validate coordinates
    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format'
      });
    }

    const newContact: EmergencyContact = {
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
      verified: false, // New contacts need verification
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
  } catch (error) {
    console.error('Create emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency contact'
    });
  }
});

// PUT - Update emergency contact (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    // Don't allow updating createdAt
    delete updates.createdAt;

    const result = await db
      .collection('emergencycontacts')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            lastUpdated: new Date()
          }
        },
        { returnDocument: 'after' }
      );

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
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact'
    });
  }
});

// DELETE - Delete emergency contact (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    const result = await db
      .collection('emergencycontacts')
      .deleteOne({ _id: new ObjectId(id) });

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
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact'
    });
  }
});

export default router;
