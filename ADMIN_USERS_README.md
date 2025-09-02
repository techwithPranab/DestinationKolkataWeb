# Admin User Management System

This document describes the admin user management system for the Destination Kolkata admin panel.

## Overview

The admin user system provides role-based access control with different permission levels for managing the Destination Kolkata platform.

## User Roles & Permissions

### 1. Admin (`admin`)
- **Permissions**: `['all']`
- **Access**: Full access to all admin features
- **Description**: System administrator with complete control

### 2. Manager (`manager`)
- **Permissions**: `['read', 'write', 'update']`
- **Access**: Can read, create, and update content but cannot delete
- **Description**: Content manager for day-to-day operations

### 3. Editor (`editor`)
- **Permissions**: `['read', 'write']`
- **Access**: Can read and create content but cannot update or delete
- **Description**: Content creator with limited editing rights

### 4. Viewer (`viewer`)
- **Permissions**: `['read']`
- **Access**: Read-only access to admin panel
- **Description**: View-only access for monitoring purposes

## Default Admin Users

The system comes with pre-seeded admin users:

```typescript
// System Administrator
Email: admin@destinationkolkata.com
Password: admin123
Role: admin

// Content Manager
Email: manager@destinationkolkata.com
Password: manager123
Role: manager

// Content Editor
Email: editor@destinationkolkata.com
Password: editor123
Role: editor

// Content Viewer
Email: viewer@destinationkolkata.com
Password: viewer123
Role: viewer
```

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin user login

### Admin User Management
- `GET /api/admin/admin-users` - Get all admin users
- `POST /api/admin/admin-users` - Create new admin user
- `GET /api/admin/admin-users/[id]` - Get specific admin user
- `PUT /api/admin/admin-users/[id]` - Update admin user
- `DELETE /api/admin/admin-users/[id]` - Delete admin user

### Regular User Management (separate from admin users)
- `GET /api/admin/users` - Get all regular users (travelers/customers)
- `POST /api/admin/users` - Create new regular user
- `GET /api/admin/users/[id]` - Get specific regular user
- `PUT /api/admin/users/[id]` - Update regular user
- `DELETE /api/admin/users/[id]` - Delete regular user

## Usage Examples

### Login
```javascript
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@destinationkolkata.com',
    password: 'admin123'
  })
})
```

### Get All Admin Users
```javascript
const response = await fetch('/api/admin/admin-users')
const data = await response.json()
// Returns: { success: true, users: [...], total: number }
```

### Create New Admin User
```javascript
const response = await fetch('/api/admin/admin-users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newadmin@example.com',
    password: 'securepassword',
    name: 'New Admin',
    role: 'editor',
    permissions: ['read', 'write']
  })
})
```

## Security Notes

### Production Considerations
1. **Password Hashing**: Currently passwords are stored in plain text. Use bcrypt or similar for production.
2. **JWT Tokens**: Replace the simple token generation with proper JWT implementation.
3. **Database**: Replace mock data with actual database (MongoDB recommended).
4. **Authentication Middleware**: Add proper authentication checks to all admin routes.
5. **Rate Limiting**: Implement rate limiting for login attempts.
6. **Password Policies**: Enforce strong password requirements.

### Environment Variables
Add these to your `.env.local`:
```
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

## File Structure

```
src/
├── lib/
│   └── seeds/
│       └── admin-users.ts          # Admin user seed data
├── app/
│   └── api/
│       └── admin/
│           ├── auth/
│           │   └── login/
│           │       └── route.ts     # Login logic with user table
│           ├── admin-users/
│           │   ├── route.ts         # Admin user CRUD operations
│           │   └── [id]/
│           │       └── route.ts     # Individual admin user operations
│           └── users/               # Regular user management (separate)
```

## Migration to Production

1. Replace mock data with actual database models
2. Implement proper password hashing
3. Add authentication middleware
4. Set up proper JWT token handling
5. Add input validation and sanitization
6. Implement audit logging for admin actions
