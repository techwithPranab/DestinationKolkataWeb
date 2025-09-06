# Cloudinary Integration Setup

## Overview
This project now includes Cloudinary integration for image uploads in the admin panel. You can upload images for hotels, restaurants, and other content directly from the admin interface.

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Navigate to your Dashboard

### 2. Get Your API Credentials
1. In your Cloudinary Dashboard, go to "Account" → "Settings"
2. Scroll down to "Access Keys" section
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configure Environment Variables
Update your `.env.local` file with your Cloudinary credentials:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 4. Restart Your Development Server
```bash
npm run dev
```

## Features

### Image Upload Component
- **Drag & Drop**: Drag images directly onto the upload area
- **Click to Upload**: Click the upload area to select files
- **Multiple Formats**: Supports JPEG, PNG, and WebP
- **File Size Limit**: Maximum 5MB per image
- **Image Optimization**: Automatic resizing and compression
- **Primary Image**: Mark one image as primary for listings

### Admin Integration
- **Hotels Admin**: Upload hotel images with primary image selection
- **Restaurants Admin**: Upload restaurant images
- **Image Management**: View, reorder, and delete uploaded images
- **Auto-optimization**: Images are automatically optimized for web delivery

## Usage

### In Admin Panel
1. Navigate to Hotels or Restaurants admin section
2. Click "Add Hotel/Restaurant" or edit existing entries
3. Scroll to the "Images" section
4. Drag & drop images or click to select files
5. Set a primary image for the main listing display
6. Save the form

### API Endpoints
- `POST /api/upload` - Upload images to Cloudinary
- `DELETE /api/upload?public_id=...` - Delete images from Cloudinary

## Image Specifications
- **Supported Formats**: JPEG, PNG, WebP
- **Maximum Size**: 5MB per image
- **Automatic Optimization**: Images are resized to 1200x800px max
- **Quality**: Auto-optimized for web delivery
- **Storage**: Images stored in `destination-kolkata` folder

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check your Cloudinary credentials in `.env.local`
2. **File Too Large**: Ensure images are under 5MB
3. **Invalid Format**: Only JPEG, PNG, and WebP are supported
4. **Network Issues**: Check your internet connection

### Error Messages
- "No file provided" - No image was selected
- "Invalid file type" - Unsupported image format
- "File size too large" - Image exceeds 5MB limit
- "Failed to upload image" - Check Cloudinary credentials and network

## Folder Organization

Cloudinary supports hierarchical folder structures to keep your images organized. This integration automatically creates folders based on content type and website name.

### Default Folder Structure

Images are automatically organized into the following folders:

```
destination-kolkata/
├── hotels/           # Hotel images
├── restaurants/      # Restaurant images
├── attractions/      # Tourist attraction images
├── events/           # Event images
├── sports/           # Sports facility images
└── general/          # General/miscellaneous images
```

### Custom Folder Organization

You can also create custom folder structures:

```javascript
// Using the utility functions
import { getCloudinaryFolder, generateFolderName } from '@/lib/cloudinary-utils'

// Get predefined folder
const hotelFolder = getCloudinaryFolder('hotels') // "destination-kolkata/hotels"

// Generate custom folder with website name
const customFolder = generateFolderName('my-website', 'products') // "my-website/products"
```

### Benefits of Folder Organization

1. **Better Management**: Group related images together
2. **Faster Search**: Quickly find images by category
3. **Access Control**: Set different permissions per folder
4. **Analytics**: Track usage by content type
5. **Backup**: Easier to backup specific content types

### Folder Naming Conventions

- Use lowercase letters and hyphens
- Avoid special characters
- Keep names descriptive but concise
- Example: `destination-kolkata/hotels/luxury`

### Advanced Folder Organization

For larger projects, you can create more complex folder structures:

```javascript
// Multi-website setup
const websiteFolders = {
  'destination-kolkata': {
    hotels: 'destination-kolkata/hotels',
    restaurants: 'destination-kolkata/restaurants',
    attractions: 'destination-kolkata/attractions'
  },
  'kolkata-events': {
    events: 'kolkata-events/events',
    promotions: 'kolkata-events/promotions'
  }
}

// Date-based organization
const dateFolder = `destination-kolkata/hotels/${new Date().getFullYear()}/${new Date().getMonth() + 1}`

// User-specific folders
const userFolder = `destination-kolkata/users/${userId}/uploads`
```

### Extending to Other Admin Sections

To add image upload to other admin sections:

```typescript
// In your admin component
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder } from '@/lib/cloudinary-utils'

// In your form
<ImageUpload
  images={formData.images}
  onImagesChange={(images) => setFormData({ ...formData, images })}
  maxImages={5}
  folder={getCloudinaryFolder('attractions')} // or custom folder
/>
```

### Folder Permissions and Access Control

Cloudinary supports different access levels for folders:

1. **Public Folders**: Images accessible via public URLs
2. **Private Folders**: Images require authentication
3. **Upload Presets**: Pre-configured upload settings per folder

### Monitoring and Analytics

Use Cloudinary's dashboard to:

- View folder storage usage
- Monitor upload activity by folder
- Set up automated backups per folder
- Generate reports on folder usage
