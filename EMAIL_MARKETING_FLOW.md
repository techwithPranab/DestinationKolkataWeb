# Email Marketing & Onboarding Flow

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN SENDS EMAIL CAMPAIGN                    │
│                                                                   │
│  Admin Dashboard → Email Marketing → Configure → Send            │
│                                                                   │
│  ✓ Select Target: All/Hotels/Restaurants/Attractions/etc.       │
│  ✓ Customize Subject & Message                                  │
│  ✓ Preview Email                                                 │
│  ✓ Send to X Recipients                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BUSINESS OWNER RECEIVES EMAIL                   │
│                                                                   │
│  Professional Email with:                                        │
│  • Introduction to DestinationKolkata.com                        │
│  • 100% FREE onboarding offer                                   │
│  • 8 Key Benefits (visibility, control, reviews, etc.)          │
│  • 3-Step Registration Process                                   │
│  • Support Contact Info                                          │
│  • Big CTA Button: "Register Now - It's FREE!"                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 1: BUSINESS OWNER SIGNS UP                  │
│                                                                   │
│  User clicks registration link →                                │
│  Redirected to: /auth/signup?type=hotel&ref=listing123          │
│                                                                   │
│  Registration Form:                                              │
│  ✓ Email (pre-filled from invitation)                           │
│  ✓ Password                                                      │
│  ✓ Business Name                                                 │
│  ✓ Contact Information                                           │
│                                                                   │
│  Time Required: 2 minutes                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SYSTEM SENDS WELCOME EMAIL                      │
│                                                                   │
│  To: Business Owner                                              │
│  Subject: Welcome to Destination Kolkata!                        │
│  Content: Account created, next steps, login link               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         SYSTEM SENDS ADMIN NOTIFICATION (New Registration)       │
│                                                                   │
│  To: Admin (support@destinationkolkata.com)                      │
│  Subject: New User Registration                                  │
│  Content: User details, recommended action (assign listing)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           STEP 2: ADMIN ASSIGNS LISTING TO USER                  │
│                                                                   │
│  Admin Dashboard → Assignments → Assign Resource                 │
│                                                                   │
│  Action:                                                         │
│  ✓ Select User (by email/name)                                  │
│  ✓ Select Listing (hotel/restaurant to assign)                  │
│  ✓ Add Assignment Notes                                          │
│  ✓ Click "Assign"                                                │
│                                                                   │
│  Timeline: Within 24 hours (usually same day)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          SYSTEM SENDS RESOURCE ASSIGNMENT EMAIL                  │
│                                                                   │
│  To: Business Owner                                              │
│  Subject: Your Listing Has Been Assigned!                        │
│  Content:                                                        │
│  • Listing details assigned                                      │
│  • Link to complete listing                                      │
│  • Instructions for next steps                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            STEP 3: USER COMPLETES LISTING DETAILS                │
│                                                                   │
│  User Dashboard → My Listings → Complete Profile                │
│                                                                   │
│  User Fills In:                                                  │
│  ✓ Business Description (short & detailed)                      │
│  ✓ High-quality Photos (upload images)                          │
│  ✓ Amenities/Facilities (for hotels)                            │
│  ✓ Menu Items (for restaurants)                                 │
│  ✓ Operating Hours                                               │
│  ✓ Price Range                                                   │
│  ✓ Contact Information (phone, website, social)                 │
│  ✓ Location/Address Details                                      │
│  ✓ Special Features/Tags                                         │
│                                                                   │
│  User Action: Click "Submit for Approval"                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       SYSTEM SENDS SUBMISSION NOTIFICATION TO ADMIN              │
│                                                                   │
│  To: Admin                                                       │
│  Subject: New Submission Pending Review                          │
│  Content: Submission details, review link                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN REVIEWS & APPROVES SUBMISSION                 │
│                                                                   │
│  Admin Dashboard → Approvals → Review Submission                 │
│                                                                   │
│  Admin Reviews:                                                  │
│  ✓ All information is accurate                                  │
│  ✓ Photos are appropriate and high-quality                      │
│  ✓ Contact details are valid                                    │
│  ✓ Content follows guidelines                                    │
│                                                                   │
│  Admin Action:                                                   │
│  → APPROVE (listing goes live) OR                               │
│  → REJECT (with reason, request changes)                        │
│                                                                   │
│  Timeline: 1-2 business days                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────┴──────────┐
                    ↓                     ↓
┌─────────────────────────────┐  ┌──────────────────────────────┐
│      IF APPROVED             │  │       IF REJECTED            │
│                              │  │                              │
│  System Actions:             │  │  System Actions:             │
│  ✓ Change status to "active" │  │  ✓ Status remains "draft"   │
│  ✓ Listing goes LIVE         │  │  ✓ User can edit & resubmit │
│  ✓ Visible on website        │  │                              │
│  ✓ Searchable by users       │  │  Email to User:             │
│                              │  │  • Rejection reason          │
│  Email to User:              │  │  • What needs to change      │
│  • Congratulations message   │  │  • Link to edit listing      │
│  • Link to view listing      │  │  • Resubmit instructions     │
│  • Tips for optimization     │  │                              │
└─────────────────────────────┘  └──────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LISTING IS NOW LIVE! 🎉                         │
│                                                                   │
│  Available Features:                                             │
│  ✓ Visible to all website visitors                              │
│  ✓ Appears in search results                                    │
│  ✓ Users can view details                                       │
│  ✓ Users can leave reviews                                      │
│  ✓ Direct contact via phone/email/website                       │
│  ✓ Shows on map                                                  │
│  ✓ Included in recommendations                                   │
│                                                                   │
│  Business Owner Can:                                             │
│  ✓ Update listing anytime                                        │
│  ✓ Add/remove photos                                             │
│  ✓ Respond to reviews                                            │
│  ✓ View analytics                                                │
│  ✓ Manage bookings (if enabled)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Email Templates Used in Flow

### 1. Listing Invitation Email
**Trigger**: Admin sends email campaign
**Template**: `listing_invitation`
**Recipients**: Hotels/Restaurants with valid email, status: pending
**Content**:
- Platform introduction
- FREE onboarding offer (highlighted)
- 8 key benefits
- 3-step registration process
- Support contact info
- CTA: Register Now button

### 2. Registration Welcome Email
**Trigger**: User completes registration
**Template**: `registration_welcome`
**Recipients**: Newly registered user
**Content**:
- Welcome message
- Account confirmation
- Next steps (wait for admin assignment)
- Login link
- Support contact

### 3. Admin Registration Notification
**Trigger**: User completes registration
**Template**: `registration_admin_notification`
**Recipients**: Admin team
**Content**:
- New user details
- Registration timestamp
- Recommended action (assign listing)
- Admin dashboard link

### 4. Resource Assignment Email
**Trigger**: Admin assigns listing to user
**Template**: `resource_assignment`
**Recipients**: User who received assignment
**Content**:
- Assignment confirmation
- Listing details
- Instructions to complete listing
- Link to customer dashboard
- Deadline/expectations

### 5. Submission Admin Notification
**Trigger**: User submits listing for approval
**Template**: `submission_admin_notification`
**Recipients**: Admin team
**Content**:
- Submission details
- User information
- Review link
- Priority indicator

### 6. Submission Approval Email
**Trigger**: Admin approves submission
**Template**: `submission_approval`
**Recipients**: User whose submission was approved
**Content**:
- Congratulations message
- Listing is now live
- Link to view listing
- Optimization tips
- Analytics access info

### 7. Submission Rejection Email
**Trigger**: Admin rejects submission
**Template**: `submission_rejection`
**Recipients**: User whose submission was rejected
**Content**:
- Rejection reason
- What needs to change
- Link to edit listing
- Resubmission instructions
- Support contact for questions

## Timeline Summary

```
Day 1:
├─ 10:00 AM: Admin sends email campaign
├─ 10:30 AM: Business owner receives email
├─ 11:00 AM: Business owner signs up (Step 1) ✓
├─ 11:01 AM: Welcome email sent
├─ 11:01 AM: Admin notification sent
└─ 02:00 PM: Admin assigns listing (Step 2) ✓

Day 1-2:
├─ Business owner completes listing details (Step 3)
├─ Business owner submits for approval
└─ Admin notification sent

Day 2-3:
├─ Admin reviews submission
├─ Admin approves/rejects
└─ Decision email sent to user

Day 3:
└─ Listing goes LIVE! 🎉 (if approved)
```

## Support Touchpoints

Throughout the process, users can get help:

**Email Support**: support@destinationkolkata.com
**Phone Support**: +91-9876543210
**Support Hours**: Mon-Sat, 10 AM - 6 PM IST

Available at every step:
- During registration
- While completing listing
- During submission process
- After approval/rejection
- For ongoing management

## Success Metrics to Track

1. **Email Campaign Performance**
   - Emails sent
   - Delivery rate
   - Open rate (if tracking enabled)
   - Click-through rate

2. **Registration Conversion**
   - Emails sent → Registrations
   - Conversion rate %
   - Time to register

3. **Completion Rate**
   - Registrations → Completed listings
   - Average completion time
   - Drop-off points

4. **Approval Rate**
   - Submissions → Approvals
   - Rejection reasons
   - Resubmission rate

5. **Overall Success**
   - Total listings onboarded
   - Active listings
   - User satisfaction
   - Platform growth

---

This complete flow ensures a smooth onboarding experience from initial email to live listing! 🚀
