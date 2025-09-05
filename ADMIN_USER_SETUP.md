# Admin User Setup Guide

This guide explains how to create and manage admin users for the Destination Kolkata application.

## ✅ STATUS: ADMIN USER CREATED SUCCESSFULLY

**Admin user has been created and is ready to use!**

- **Email**: `admin@destinationkolkata.com`
- **Password**: `admin123`
- **Status**: Active and verified
- **Created**: September 4, 2025

## 🚀 Quick Start

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the admin login page**:
   ```
   http://localhost:3001/admin/login
   ```

3. **Login with**:
   - Email: `admin@destinationkolkata.com`
   - Password: `admin123`

4. **⚠️ IMPORTANT**: Change the default password immediately after first login!

## 📋 Available Scripts

- `npm run seed-admin` - Create admin user (with duplicate prevention)
- `npm run verify-admin` - Verify admin user exists in database
- `npm run generate-admin` - Generate setup info without database connection

## 🔧 Troubleshooting

### Connection Issues
If you encounter connection issues:

1. **Check MongoDB status**:
   ```bash
   brew services list | grep mongodb
   ```

2. **Start MongoDB if needed**:
   ```bash
   brew services start mongodb-community
   ```

3. **Test connection**:
   ```bash
   mongosh --eval "db.runCommand({ping: 1})"
   ```

### Recreate Admin User
If you need to recreate the admin user:

1. **Delete existing admin user** (optional):
   ```bash
   mongosh destination-kolkata --eval "db.users.deleteOne({role: 'admin'})"
   ```

2. **Run seed script**:
   ```bash
   npm run seed-admin
   ```

## Prerequisites

1. MongoDB database connection (local or Atlas)
2. Node.js and npm installed
3. Project dependencies installed (`npm install`)

## Creating Admin User

### Method 1: Using the Seed Script (Recommended)

1. **Ensure MongoDB is running** (if using local MongoDB):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # Or start manually
   mongod --dbpath /usr/local/var/mongodb
   ```

2. **Update your `.env.local` file** with the correct MongoDB URI:
   ```bash
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/destination-kolkata

   # For MongoDB Atlas (replace with your connection string)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/destination-kolkata
   ```

3. **Run the admin seed script**:
   ```bash
   npm run seed-admin
   ```

   Or run directly:
   ```bash
   npx tsx scripts/seed-admin-user.ts
   ```

### Method 2: Manual Creation via MongoDB Shell

If you prefer to create the admin user manually:

1. **Connect to your MongoDB database**:
   ```bash
   mongo mongodb://localhost:27017/destination-kolkata
   # or for Atlas
   mongo "mongodb+srv://username:password@cluster.mongodb.net/destination-kolkata"
   ```

2. **Switch to the destination-kolkata database**:
   ```javascript
   use destination-kolkata
   ```

3. **Create the admin user**:
   ```javascript
   db.users.insertOne({
     firstName: "Admin",
     lastName: "User",
     email: "admin@destinationkolkata.com",
     password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK", // Hashed password for "admin123"
     role: "admin",
     phone: "+91-9876543210",
     city: "Kolkata",
     membershipType: "premium",
     status: "active",
     emailVerified: true,
     profile: {
       bio: "System Administrator for Destination Kolkata",
       location: {
         city: "Kolkata",
         state: "West Bengal",
         country: "India"
       }
     },
     preferences: {
       emailNotifications: true,
       smsNotifications: false,
       language: "en",
       currency: "INR"
     },
     verification: {
       email: true,
       phone: true,
       business: false
     },
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## Default Admin Credentials

After running the seed script, you can login with:

- **Email**: `admin@destinationkolkata.com`
- **Password**: `admin123`
- **Admin Panel**: `/admin/login`

## Important Security Notes

⚠️ **Change the default password immediately after first login!**

The default password is set for initial setup only. After logging in for the first time:

1. Go to Admin Settings or Profile
2. Change the password to a secure one
3. Store the new credentials securely

## Admin User Features

Once logged in as admin, you can:

- **Manage Users**: View, edit, and manage all user accounts
- **Content Moderation**: Approve/reject business listings and submissions
- **Analytics**: View dashboard statistics and reports
- **System Settings**: Configure application settings
- **Data Management**: Import/export data, manage categories

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running (for local setup)
- Check your MongoDB URI in `.env.local`
- Verify network connectivity (for Atlas)

### Permission Issues
- Ensure the database user has write permissions
- Check if the database exists and is accessible

### Script Errors
- Make sure all dependencies are installed: `npm install`
- Check Node.js version compatibility
- Verify TypeScript compilation: `npm run type-check`

## Additional Admin Users

To create additional admin users, you can:

1. **Use the seed script** and modify the email/password
2. **Create via the admin panel** (if you have an existing admin account)
3. **Manual insertion** using the MongoDB shell method above

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify your environment configuration
3. Ensure all prerequisites are met
4. Contact the development team for assistance
