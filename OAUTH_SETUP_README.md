# OAuth Setup Guide for Destination Kolkata

This guide will help you set up Google and Facebook OAuth authentication for the Destination Kolkata application.

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- NextAuth.js configured

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted
4. Select "Web application" as application type
5. Add authorized redirect URIs:
   - For development: `http://localhost:3001/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Save and copy the Client ID and Client Secret

### 3. Update Environment Variables

Add to your `.env.local` file:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Facebook OAuth Setup

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app

### 2. Configure Facebook Login

1. In your Facebook app dashboard, go to "Facebook Login" > "Settings"
2. Add valid OAuth redirect URIs:
   - For development: `http://localhost:3001/api/auth/callback/facebook`
   - For production: `https://yourdomain.com/api/auth/callback/facebook`
3. Go to "App Settings" > "Basic" and copy the App ID and App Secret

### 3. Update Environment Variables

Add to your `.env.local` file:
```bash
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## Testing OAuth

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Google Sign-In

1. Navigate to `http://localhost:3001/auth/login`
2. Click the "Google" button
3. You should be redirected to Google for authentication
4. After authentication, you should be redirected back to the customer dashboard

### 3. Test Facebook Sign-In

1. Navigate to `http://localhost:3001/auth/login`
2. Click the "Facebook" button
3. You should be redirected to Facebook for authentication
4. After authentication, you should be redirected back to the customer dashboard

## Features Implemented

### ✅ OAuth Integration
- Google OAuth 2.0 authentication
- Facebook OAuth 2.0 authentication
- Automatic user creation for new OAuth users
- User profile data synchronization

### ✅ Database Integration
- MongoDB adapter for NextAuth
- User model updated with OAuth fields
- Automatic user creation and updates

### ✅ Security Features
- Secure token management
- Session handling
- User role assignment (defaults to 'customer')
- Email verification for OAuth users

### ✅ User Experience
- Seamless sign-in flow
- Loading states during authentication
- Error handling for failed authentications
- Automatic redirect to customer dashboard

## Troubleshooting

### Common Issues

1. **"Invalid OAuth access token" error**
   - Check that your OAuth credentials are correct
   - Verify redirect URIs match exactly

2. **"MongoDB connection error"**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env.local

3. **Users not being created**
   - Check database connection
   - Verify User model is properly imported

### Debug Mode

Enable NextAuth debug mode by adding to `.env.local`:
```bash
NEXTAUTH_DEBUG=true
```

## Production Deployment

### 1. Update Environment Variables

For production, update your environment variables with production URLs:
```bash
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-production-google-client-id
FACEBOOK_CLIENT_ID=your-production-facebook-app-id
```

### 2. Update OAuth Redirect URIs

Update your OAuth provider settings with production redirect URIs:
- Google: `https://yourdomain.com/api/auth/callback/google`
- Facebook: `https://yourdomain.com/api/auth/callback/facebook`

### 3. Security Considerations

- Use HTTPS in production
- Regularly rotate OAuth secrets
- Monitor authentication logs
- Implement rate limiting for OAuth endpoints

## Support

If you encounter any issues with OAuth setup, please check:
1. OAuth provider documentation
2. NextAuth.js documentation
3. Application logs for error messages

For additional help, refer to the main application documentation or contact the development team.
