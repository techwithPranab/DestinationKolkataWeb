# Email Marketing Campaign Feature

## Overview
This feature enables admins to send onboarding invitation emails to hotels and restaurants that have been ingested into the system but haven't completed their registration yet.

## Features

### 1. Email Marketing Dashboard
- **Location**: `/admin/email-marketing`
- **Purpose**: Central hub for managing and sending email campaigns to potential business partners

### 2. Statistics Overview
The dashboard displays:
- Total number of pending listings
- Number of listings with email addresses
- Number of listings without email addresses
- Category-wise breakdown (Hotels, Restaurants, Attractions, Events, Sports)

### 3. Email Campaign Features
- **Target Audience Selection**: Choose specific categories or send to all
- **Custom Subject Line**: Customize the email subject
- **Additional Message**: Add optional personalized message
- **Email Preview**: Preview the email before sending
- **Bulk Send**: Send emails to all qualifying listings at once
- **Detailed Reports**: Download CSV reports of sent emails

### 4. Email Template Content

The email includes:

#### About DestinationKolkata.com
- Brief introduction to the platform
- Platform's value proposition
- Target audience (tourists and locals)

#### Benefits of Onboarding (FREE)
✅ Maximum Visibility - Reach thousands of potential customers
✅ Free Forever - No listing fees or commissions
✅ Build Credibility - Customer reviews and ratings
✅ Complete Control - Manage business information anytime
✅ Direct Contact - Direct connection with customers
✅ SEO Benefits - Improve online presence
✅ Analytics Dashboard - Track visitor engagement
✅ Mobile Optimized - Great experience on all devices

#### Registration Process (3 Steps)

**Step 1: Sign Up with Email**
- Business owner clicks registration link
- Creates account using the same email address
- Takes only 2 minutes

**Step 2: Admin Tags Property**
- Admin assigns the listing to user account
- Completed within 24 hours (usually same day)
- User receives email notification

**Step 3: Complete Listing**
- User fills in business details
- Uploads photos
- Adds amenities/menu items
- Sets operating hours
- Provides contact information

**Step 4: Go Live After Approval**
- Submit completed listing for review
- Admin verifies information
- Approval within 1-2 business days
- Listing goes live instantly after approval

#### Support Information
- **Email Support**: support@destinationkolkata.com
- **Phone Support**: +91-9876543210
- **Support Hours**: Monday - Saturday, 10:00 AM - 6:00 PM IST

## API Endpoints

### 1. Get Email Statistics
```
GET /api/admin/listing-email-stats
```
Returns statistics about pending listings with/without email addresses.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalListings": 500,
    "withEmail": 350,
    "withoutEmail": 150,
    "breakdown": {
      "hotels": { "total": 100, "withEmail": 75 },
      "restaurants": { "total": 200, "withEmail": 150 },
      "attractions": { "total": 100, "withEmail": 75 },
      "events": { "total": 50, "withEmail": 25 },
      "sports": { "total": 50, "withEmail": 25 }
    }
  }
}
```

### 2. Preview Email Template
```
POST /api/admin/preview-listing-invitation
```
Generates a preview of the email template with sample data.

**Request Body:**
```json
{
  "listingType": "hotel",
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<html>...</html>",
  "subject": "Join Destination Kolkata - Grow Your Business!"
}
```

### 3. Send Email Campaign
```
POST /api/admin/send-listing-invitations
```
Sends invitation emails to all qualifying listings.

**Request Body:**
```json
{
  "listingType": "all",  // or "hotel", "restaurant", etc.
  "emailSubject": "Join Destination Kolkata - Grow Your Business!",
  "message": "Optional personalized message"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation emails sent successfully to 350 pending listings",
  "totalSent": 350,
  "failedCount": 5,
  "results": [...],
  "failedEmails": [...]
}
```

## Email Template Design

The email template features:
- Professional gradient header
- Clear call-to-action buttons
- Responsive design (mobile-optimized)
- Step-by-step visual process guide
- Highlighted benefits section
- Support contact information box
- Professional footer

### Email Template Variables
- `businessName`: Name of the business
- `businessEmail`: Business email address
- `listingType`: Type of listing (hotel, restaurant, etc.)
- `listingName`: Name of the specific listing
- `registrationLink`: Unique registration link with pre-filled data
- `message`: Optional custom message from admin

## Usage Instructions

### For Admins

1. **Access the Dashboard**
   - Navigate to `/admin/email-marketing`
   - View current statistics

2. **Configure Campaign**
   - Select target audience (All or specific category)
   - Customize email subject if needed
   - Add optional personalized message

3. **Preview Email**
   - Click "Preview Email" button
   - Review email content and design
   - Make adjustments if needed

4. **Send Campaign**
   - Click "Send to X Recipients" button
   - Confirm the action
   - Wait for campaign to complete

5. **Review Results**
   - Check success/failure statistics
   - Download detailed CSV report
   - Review failed emails and reasons

## Email Tracking

All sent emails are logged in the `emailHistory` collection with:
- Recipient email
- Template used
- Timestamp
- Success/failure status
- Related listing information
- Error messages (if failed)

## Environment Variables Required

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
EMAIL_FROM_NAME=Destination Kolkata
EMAIL_FROM=noreply@destinationkolkata.com
ADMIN_EMAIL=support@destinationkolkata.com
FRONTEND_URL=https://destinationkolkata.com
```

## Support Contact Configuration

Update these values in your .env file or in the email template:
- Support Email: `support@destinationkolkata.com`
- Support Phone: `+91-9876543210`
- Support Hours: Monday - Saturday, 10:00 AM - 6:00 PM IST

## Best Practices

1. **Test First**: Send test emails to your own email address before bulk sending
2. **Peak Hours**: Send emails during business hours for better open rates
3. **Segmentation**: Consider sending to specific categories first
4. **Follow-up**: Monitor email history and follow up with non-responders
5. **Update Contact Info**: Ensure support email and phone are always monitored

## Troubleshooting

### Emails Not Sending
- Check SMTP configuration in .env
- Verify email service credentials
- Check email service quota/limits
- Review error logs in backend console

### Low Open Rates
- Test different subject lines
- Send at optimal times (10 AM - 4 PM)
- Ensure emails aren't marked as spam
- Verify email design in preview

### Failed Emails
- Review failed emails list
- Check for invalid email addresses
- Verify SMTP connection
- Check email service limits

## Future Enhancements

- [ ] A/B testing for subject lines
- [ ] Scheduled email campaigns
- [ ] Email templates customization UI
- [ ] Advanced segmentation options
- [ ] Automated follow-up sequences
- [ ] Email analytics (open rates, click rates)
- [ ] Drip campaign support
- [ ] Unsubscribe management

## Security Considerations

- All endpoints require admin authentication
- Rate limiting applied to prevent spam
- Email sending logs maintained for audit
- Personal data handled per privacy policy
- SMTP credentials stored securely in environment variables

## License & Credits

This feature is part of the Destination Kolkata platform.
- Email service: Brevo (formerly Sendinblue)
- Template engine: Custom HTML/CSS
- Framework: Next.js + Express.js
