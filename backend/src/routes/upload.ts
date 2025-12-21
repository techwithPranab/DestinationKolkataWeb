import { Router, Request, Response } from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  },
});

// Helper function to convert buffer to stream
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string, publicId?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      format: 'webp', // Convert to WebP for better compression
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};

// POST /api/upload - Upload single image (default route for compatibility)
router.post('/', auth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { folder = 'general' } = req.body;

    // Validate folder name - support both simple folder names and full paths with 'destination-kolkata' prefix
    const allowedFolders = [
      'general',
      'hotels',
      'restaurants',
      'attractions',
      'events',
      'sports',
      'travel',
      'profiles',
      'reviews',
      'promotions'
    ];

    // Handle both 'destination-kolkata/hotels' and 'hotels' formats
    const baseFolderName = folder.includes('destination-kolkata/') 
      ? folder.replace('destination-kolkata/', '').split('/')[0]
      : folder.split('/')[0];
      
    if (!allowedFolders.includes(baseFolderName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid folder name: ${baseFolderName}. Allowed folders: ${allowedFolders.join(', ')}`
      });
    }

    // Generate unique public ID
    const timestamp = Date.now();
    const publicId = `${user.userId}_${timestamp}`;

    const result = await uploadToCloudinary(req.file.buffer, folder, publicId);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/upload/single - Upload single image
router.post('/single', auth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { folder = 'general', alt = '', caption = '' } = req.body;

    // Validate folder name
    const allowedFolders = [
      'general',
      'hotels',
      'restaurants',
      'attractions',
      'events',
      'sports',
      'travel',
      'profiles',
      'reviews',
      'promotions'
    ];

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder name'
      });
    }

    // Generate unique public ID
    const timestamp = Date.now();
    const publicId = `${user.userId}_${timestamp}`;

    const result = await uploadToCloudinary(req.file.buffer, folder, publicId);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        alt,
        caption,
        folder,
        uploadedBy: user.userId,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/upload/multiple - Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const { folder = 'general' } = req.body;

    // Validate folder name
    const allowedFolders = [
      'general',
      'hotels',
      'restaurants',
      'attractions',
      'events',
      'sports',
      'travel',
      'profiles',
      'reviews',
      'promotions'
    ];

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder name'
      });
    }

    const files = req.files as Express.Multer.File[];
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const publicId = `${user.userId}_${timestamp}_${index}`;
      
      try {
        const result = await uploadToCloudinary(file.buffer, folder, publicId);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          originalName: file.originalname,
          folder,
          uploadedBy: user.userId,
          uploadedAt: new Date()
        };
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        return {
          error: `Failed to upload ${file.originalname}`,
          originalName: file.originalname
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.json({
      success: true,
      message: `${successful.length} images uploaded successfully`,
      data: {
        uploaded: successful,
        failed: failed,
        total: files.length,
        successCount: successful.length,
        failureCount: failed.length
      }
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// DELETE /api/upload/:publicId - Delete image from Cloudinary
router.delete('/:publicId', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Check if user has permission to delete this image
    // Only allow users to delete their own images unless they're admin
    if (user.role !== 'admin' && !publicId.startsWith(user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own images'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully',
        data: {
          publicId,
          result: result.result
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or could not be deleted',
        data: {
          publicId,
          result: result.result
        }
      });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/upload/folders - Get available upload folders
router.get('/folders', auth, async (req: Request, res: Response) => {
  try {
    const folders = [
      { name: 'general', description: 'General purpose images' },
      { name: 'hotels', description: 'Hotel photos and amenities' },
      { name: 'restaurants', description: 'Restaurant and food images' },
      { name: 'attractions', description: 'Tourist attractions and landmarks' },
      { name: 'events', description: 'Event photos and promotional materials' },
      { name: 'sports', description: 'Sports facilities and activities' },
      { name: 'travel', description: 'Travel and transportation images' },
      { name: 'profiles', description: 'User profile pictures' },
      { name: 'reviews', description: 'User review images' },
      { name: 'promotions', description: 'Promotional banners and advertisements' }
    ];

    res.json({
      success: true,
      data: folders
    });

  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching folders'
    });
  }
});

// GET /api/upload/user/:userId - Get user's uploaded images (admin or own images)
router.get('/user/:userId', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const { folder, limit = 20 } = req.query;

    // Check permissions
    if (user.role !== 'admin' && user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own images'
      });
    }

    // Build search expression for Cloudinary
    let expression = `folder:*`;
    if (folder) {
      expression = `folder:${folder}/*`;
    }

    // Add user filter
    expression += ` AND public_id:${userId}_*`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(parseInt(limit as string))
      .execute();

    const images = result.resources.map((resource: any) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      bytes: resource.bytes,
      createdAt: resource.created_at,
      folder: resource.folder
    }));

    res.json({
      success: true,
      data: images,
      total: result.total_count
    });

  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user images',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/upload/transform - Apply transformations to existing image
router.post('/transform', auth, async (req: Request, res: Response) => {
  try {
    const { publicId, transformations } = req.body;

    if (!publicId || !transformations) {
      return res.status(400).json({
        success: false,
        message: 'Public ID and transformations are required'
      });
    }

    // Generate transformed URL
    const transformedUrl = cloudinary.url(publicId, transformations);

    res.json({
      success: true,
      message: 'Transformation applied successfully',
      data: {
        originalPublicId: publicId,
        transformedUrl,
        transformations
      }
    });

  } catch (error) {
    console.error('Error applying transformations:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying transformations',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Error handler for multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Upload error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

export default router;
