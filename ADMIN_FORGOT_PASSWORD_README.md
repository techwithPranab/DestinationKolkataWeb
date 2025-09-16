# Admin Forgot Password Implementation Guide

This document provides comprehensive information about the admin forgot password functionality implemented for the Destination Kolkata admin portal.

## Overview

The admin forgot password system provides a secure way for administrators and moderators to reset their passwords. It includes:

- **Dedicated Admin Endpoints**: Separate from regular user password reset
- **Role-Based Security**: Only admin and moderator accounts can use this system
- **Secure Token Generation**: Cryptographically secure reset tokens
- **Email Integration**: Professional email templates with Brevo SMTP
- **Time-Limited Tokens**: 1-hour expiration for security
- **User-Friendly Interface**: Clean, responsive UI matching the admin theme

## Implementation Components

### 1. API Endpoints

#### `/api/admin/forgot-password` (POST)
**Purpose**: Initiates password reset for admin accounts

**Request Body:**
```json
{
  "email": "admin@destinationkolkata.com"
}
```

**Response:**
```json
{
  "message": "If an admin account with this email exists, a reset link has been sent."
}
```

**Security Features:**
- Only processes admin/moderator accounts
- Doesn't reveal if email exists (security through obscurity)
- Generates cryptographically secure tokens
- Sets 1-hour expiration
- Professional email template

#### `/api/admin/reset-password` (POST)
**Purpose**: Resets admin password using valid token

**Request Body:**
```json
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Admin password reset successfully"
}
```

**Security Features:**
- Validates token existence and expiration
- Ensures user has admin/moderator role
- Hashes new password with bcrypt (12 rounds)
- Clears reset token after successful reset

### 2. Frontend Pages

#### `/admin/forgot-password`
**Features:**
- Clean, professional UI matching admin theme
- Email validation
- Loading states and error handling
- Success state with clear instructions
- Responsive design

#### `/admin/reset-password`
**Features:**
- Token validation from URL parameters
- Password strength requirements (min 6 characters)
- Password confirmation matching
- Secure password input with show/hide toggle
- Auto-redirect to login after successful reset

### 3. Email Template

The system sends professional HTML emails with:
- Company branding (Destination Kolkata)
- Clear call-to-action button
- Security warnings and expiration notice
- Fallback plain text link
- Responsive design for all email clients

## Security Features

### 1. Role-Based Access
- Only users with `admin` or `moderator` roles can reset passwords
- Regular users must use the general forgot password system

### 2. Token Security
- 32-byte cryptographically secure random tokens
- 1-hour expiration window
- One-time use (cleared after successful reset)
- URL-encoded for safe transmission

### 3. Password Security
- Minimum 6 characters requirement
- Bcrypt hashing with 12 salt rounds
- Secure password comparison

### 4. Email Security
- No sensitive information in emails
- Generic success messages (doesn't confirm email existence)
- Professional templates without user data exposure

## User Flow

### Password Reset Process:

1. **Admin clicks "Forgot Password"** on login page
2. **Redirected to `/admin/forgot-password`**
3. **Enters admin email address**
4. **System validates email and role**
5. **Secure token generated and stored**
6. **Professional email sent with reset link**
7. **Admin clicks link in email**
8. **Redirected to `/admin/reset-password?token=...`**
9. **Enters new password (with confirmation)**
10. **Password validated and updated**
11. **Auto-redirect to admin login**
12. **Success message displayed**

## Database Schema

The User model includes password reset fields:

```typescript
{
  resetToken: String,
  resetTokenExpiry: Date,
  // ... other user fields
}
```

## Configuration

### Environment Variables Required:
```bash
# SMTP Configuration (already configured)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@destinationkolkata.com

# App URLs (already configured)
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

## Error Handling

### Frontend Errors:
- Invalid email format
- Network errors
- Server errors
- Token validation errors
- Password validation errors

### Backend Errors:
- Database connection failures
- Email sending failures
- Invalid tokens
- Expired tokens
- Insufficient permissions

## Testing the Implementation

### Manual Testing Steps:

1. **Test Forgot Password:**
   - Visit `/admin/login`
   - Click "Reset it here" link
   - Enter admin email
   - Check email for reset link

2. **Test Reset Password:**
   - Click reset link in email
   - Enter new password
   - Confirm password
   - Verify redirect to login

3. **Test Security:**
   - Try with non-admin email
   - Try expired tokens
   - Try invalid tokens
   - Verify password requirements

### API Testing:

```bash
# Test forgot password
curl -X POST http://localhost:3001/api/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@destinationkolkata.com"}'

# Test reset password
curl -X POST http://localhost:3001/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your-reset-token","password":"newpassword123"}'
```

## Integration with Existing Systems

### AuthContext Integration:
- Works seamlessly with existing admin authentication
- Maintains session state after password reset
- Redirects appropriately after successful reset

### Email System:
- Uses existing Brevo SMTP configuration
- Professional templates matching brand
- Error handling for email failures

### Database:
- Uses existing User model
- Compatible with current authentication system
- Maintains data integrity

## Best Practices Implemented

### Security:
- ✅ Role-based access control
- ✅ Secure token generation
- ✅ Time-limited tokens
- ✅ Password hashing
- ✅ Input validation
- ✅ Error message sanitization

### User Experience:
- ✅ Clear error messages
- ✅ Loading states
- ✅ Success feedback
- ✅ Responsive design
- ✅ Accessibility features

### Performance:
- ✅ Efficient database queries
- ✅ Minimal API calls
- ✅ Optimized email templates

## Troubleshooting

### Common Issues:

1. **Email not received:**
   - Check spam folder
   - Verify SMTP configuration
   - Check email logs

2. **Token expired:**
   - Request new reset link
   - Check server time settings

3. **Invalid token:**
   - Ensure full URL is used
   - Check for URL encoding issues

4. **Permission denied:**
   - Verify user has admin/moderator role
   - Check user status is 'active'

## Future Enhancements

### Potential Improvements:
- Rate limiting for forgot password requests
- Two-factor authentication integration
- Password strength indicators
- Audit logging for security events
- Admin notification system for password resets
- Customizable email templates

## Support

For issues with the admin forgot password system:
1. Check browser developer tools for errors
2. Verify SMTP configuration
3. Check server logs for API errors
4. Test with different admin accounts
5. Contact development team for custom modifications

---

**Status**: ✅ **Fully Implemented and Tested**
**Pages**: `/admin/forgot-password`, `/admin/reset-password`
**APIs**: `/api/admin/forgot-password`, `/api/admin/reset-password`
**Security**: ✅ **Production Ready**
**Compatibility**: ✅ **Fully Integrated**</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/DestinationKolkataWeb/ADMIN_FORGOT_PASSWORD_README.md
