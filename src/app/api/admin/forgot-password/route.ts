import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Create email transporter for Brevo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // STARTTLS for Brevo
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional options for better reliability with Brevo
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find admin/moderator user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ['admin', 'moderator'] },
      status: 'active'
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If an admin account with this email exists, a reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Verify transporter connection
    try {
      await transporter.verify()
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return NextResponse.json(
        { message: 'Email service temporarily unavailable' },
        { status: 500 }
      )
    }

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@destinationkolkata.com',
      to: email,
      subject: 'Admin Password Reset - Destination Kolkata',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Destination Kolkata</h1>
            <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Admin Password Reset</p>
          </div>

          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Admin Password</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello ${user.firstName || user.name || 'Admin'},
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              You requested a password reset for your admin account. Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 64, 175, 0.3);">
                Reset Admin Password
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and contact your system administrator immediately.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              If the button doesn't work, copy and paste this URL into your browser:
            </p>

            <p style="word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; margin: 0;">
              <a href="${resetUrl}" style="color: #1e40af; text-decoration: none;">${resetUrl}</a>
            </p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated message from Destination Kolkata Admin System. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    // Send reset email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'If an admin account with this email exists, a reset link has been sent.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Admin forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
