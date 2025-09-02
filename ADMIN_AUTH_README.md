# Admin Authentication System

This document explains how to use the admin authentication system for the Destination Kolkata admin panel.

## Features

- **Secure Login**: Email/password authentication
- **Session Management**: Automatic token storage and validation
- **Route Protection**: Automatic redirect for unauthenticated users
- **Logout Functionality**: Clean session termination
- **Demo Credentials**: Pre-configured demo account for testing

## Demo Credentials

For testing purposes, use these credentials:

- **Email**: `admin@destinationkolkata.com`
- **Password**: `admin123`

## How It Works

### 1. Authentication Flow

1. User visits `/admin/login`
2. Enters credentials and submits form
3. API validates credentials at `/api/admin/auth/login`
4. On success: Token stored in localStorage, redirect to `/admin`
5. On failure: Error message displayed

### 2. Route Protection

All admin routes are protected by the `AuthGuard` component:
- Automatically redirects to login if not authenticated
- Shows loading spinner during authentication check
- Preserves intended destination after login

### 3. Session Management

- **Token Storage**: Stored in localStorage as `adminToken`
- **User Data**: Stored in localStorage as `adminUser`
- **Auto-login**: Checks for existing session on app load
- **Logout**: Clears all stored data and redirects to login

## API Endpoints

### POST `/api/admin/auth/login`

Authenticates admin user.

**Request Body:**
```json
{
  "email": "admin@destinationkolkata.com",
  "password": "admin123"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "1",
    "email": "admin@destinationkolkata.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Components

### `AuthContext`
Provides authentication state and methods throughout the app.

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth()

  // Use authentication state and methods
}
```

### `AuthGuard`
Protects routes by checking authentication status.

**Usage:**
```tsx
import { AuthGuard } from '@/components/AuthGuard'

function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Protected content here</div>
    </AuthGuard>
  )
}
```

## Security Notes

⚠️ **Important**: This is a demo implementation. For production use:

1. **Replace Demo Authentication**: Implement proper database validation
2. **Use Secure Tokens**: Replace with proper JWT tokens
3. **Add Password Hashing**: Never store plain text passwords
4. **Implement Rate Limiting**: Prevent brute force attacks
5. **Add Two-Factor Authentication**: For enhanced security
6. **Use HTTPS**: Always use secure connections
7. **Token Expiration**: Implement proper token expiration

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Protected admin layout
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── ...                 # Other admin pages
│   └── api/
│       └── admin/
│           └── auth/
│               └── login/
│                   └── route.ts # Authentication API
├── components/
│   ├── AuthGuard.tsx           # Route protection component
│   └── ui/
│       └── alert.tsx           # Alert component
└── contexts/
    └── AuthContext.tsx         # Authentication context
```

## Usage Examples

### Login Form
```tsx
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Redirect handled automatically
    } catch (error) {
      // Handle error
    }
  }
}
```

### Logout Button
```tsx
import { useAuth } from '@/contexts/AuthContext'

function LogoutButton() {
  const { logout } = useAuth()

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
}
```

### Protected Route
```tsx
import { AuthGuard } from '@/components/AuthGuard'

export default function AdminPage() {
  return (
    <AuthGuard>
      <div>Admin content here</div>
    </AuthGuard>
  )
}
```

## Customization

### Styling
The login page uses Tailwind CSS classes. Customize the appearance by modifying the class names in `/src/app/admin/login/page.tsx`.

### Validation
Add additional form validation by modifying the `handleSubmit` function in the login component.

### Redirect Logic
Modify the redirect destination after login by updating the `AuthContext` login function.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure all import paths are correct
2. **Authentication not working**: Check that the API endpoint is accessible
3. **Redirect loops**: Verify that the AuthGuard is properly implemented
4. **Token not persisting**: Check localStorage availability

### Debug Tips

1. Check browser console for authentication errors
2. Verify API endpoint is responding correctly
3. Check localStorage for token storage
4. Use browser dev tools to inspect authentication state

## Next Steps

1. Replace demo authentication with real database validation
2. Implement proper JWT token generation and validation
3. Add password reset functionality
4. Implement user role-based permissions
5. Add session timeout handling
6. Implement refresh token mechanism
