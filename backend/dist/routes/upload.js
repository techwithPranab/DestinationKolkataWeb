"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const router = (0, express_1.Router)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});
const bufferToStream = (buffer) => {
    const readable = new stream_1.Readable();
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    return readable;
};
const uploadToCloudinary = (buffer, folder, publicId) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: 'image',
            format: 'webp',
            quality: 'auto',
            fetch_format: 'auto',
        };
        if (publicId) {
            uploadOptions.public_id = publicId;
        }
        const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        bufferToStream(buffer).pipe(uploadStream);
    });
};
router.post('/single', auth_1.authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const user = req.user;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }
        const { folder = 'general', alt = '', caption = '' } = req.body;
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
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/multiple', auth_1.authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        const user = req.user;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }
        const { folder = 'general' } = req.body;
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
        const files = req.files;
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.delete('/:publicId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { publicId } = req.params;
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required'
            });
        }
        if (user.role !== 'admin' && !publicId.startsWith(user.userId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own images'
            });
        }
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        if (result.result === 'ok') {
            res.json({
                success: true,
                message: 'Image deleted successfully',
                data: {
                    publicId,
                    result: result.result
                }
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Image not found or could not be deleted',
                data: {
                    publicId,
                    result: result.result
                }
            });
        }
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/folders', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching folders'
        });
    }
});
router.get('/user/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        const { folder, limit = 20 } = req.query;
        if (user.role !== 'admin' && user.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own images'
            });
        }
        let expression = `folder:*`;
        if (folder) {
            expression = `folder:${folder}/*`;
        }
        expression += ` AND public_id:${userId}_*`;
        const result = await cloudinary_1.v2.search
            .expression(expression)
            .sort_by('created_at', 'desc')
            .max_results(parseInt(limit))
            .execute();
        const images = result.resources.map((resource) => ({
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
    }
    catch (error) {
        console.error('Error fetching user images:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user images',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/transform', auth_1.authenticateToken, async (req, res) => {
    try {
        const { publicId, transformations } = req.body;
        if (!publicId || !transformations) {
            return res.status(400).json({
                success: false,
                message: 'Public ID and transformations are required'
            });
        }
        const transformedUrl = cloudinary_1.v2.url(publicId, transformations);
        res.json({
            success: true,
            message: 'Transformation applied successfully',
            data: {
                originalPublicId: publicId,
                transformedUrl,
                transformations
            }
        });
    }
    catch (error) {
        console.error('Error applying transformations:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying transformations',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.default = router;
//# sourceMappingURL=upload.js.map