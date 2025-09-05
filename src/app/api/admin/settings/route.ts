import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Setting } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all settings and organize them by category
    const settings = await Setting.find({}).sort({ category: 1, key: 1 })

    // Organize settings into categories
    const organizedSettings: Record<string, Record<string, unknown>> = {}

    settings.forEach(setting => {
      if (!organizedSettings[setting.category]) {
        organizedSettings[setting.category] = {}
      }
      organizedSettings[setting.category][setting.key] = setting.value
    })

    // If no settings exist, create default settings
    if (Object.keys(organizedSettings).length === 0) {
      const defaultSettings = [
        // General settings
        { category: 'general', key: 'siteName', value: 'Destination Kolkata', type: 'string', description: 'Website name' },
        { category: 'general', key: 'siteDescription', value: 'Discover the best of Kolkata - hotels, restaurants, attractions, and events', type: 'string', description: 'Website description' },
        { category: 'general', key: 'contactEmail', value: 'info@destinationkolkata.com', type: 'string', description: 'Contact email' },
        { category: 'general', key: 'contactPhone', value: '+91-9876543210', type: 'string', description: 'Contact phone' },
        { category: 'general', key: 'timezone', value: 'Asia/Kolkata', type: 'string', description: 'Timezone' },
        { category: 'general', key: 'language', value: 'en', type: 'string', description: 'Default language' },
        { category: 'general', key: 'maintenanceMode', value: false, type: 'boolean', description: 'Maintenance mode' },

        // Email settings
        { category: 'email', key: 'smtpHost', value: '', type: 'string', description: 'SMTP host' },
        { category: 'email', key: 'smtpPort', value: 587, type: 'number', description: 'SMTP port' },
        { category: 'email', key: 'smtpUser', value: '', type: 'string', description: 'SMTP username' },
        { category: 'email', key: 'smtpPassword', value: '', type: 'string', description: 'SMTP password' },
        { category: 'email', key: 'smtpSecure', value: true, type: 'boolean', description: 'SMTP secure' },
        { category: 'email', key: 'fromEmail', value: 'noreply@destinationkolkata.com', type: 'string', description: 'From email' },
        { category: 'email', key: 'fromName', value: 'Destination Kolkata', type: 'string', description: 'From name' },

        // Security settings
        { category: 'security', key: 'sessionTimeout', value: 60, type: 'number', description: 'Session timeout in minutes' },
        { category: 'security', key: 'passwordMinLength', value: 8, type: 'number', description: 'Minimum password length' },
        { category: 'security', key: 'passwordRequireSpecial', value: true, type: 'boolean', description: 'Require special characters' },
        { category: 'security', key: 'passwordRequireNumbers', value: true, type: 'boolean', description: 'Require numbers' },
        { category: 'security', key: 'twoFactorEnabled', value: false, type: 'boolean', description: 'Two-factor authentication' },
        { category: 'security', key: 'loginAttempts', value: 5, type: 'number', description: 'Max login attempts' },
        { category: 'security', key: 'lockoutDuration', value: 30, type: 'number', description: 'Lockout duration in minutes' },

        // Notification settings
        { category: 'notifications', key: 'emailNotifications', value: true, type: 'boolean', description: 'Email notifications' },
        { category: 'notifications', key: 'pushNotifications', value: false, type: 'boolean', description: 'Push notifications' },
        { category: 'notifications', key: 'newUserRegistration', value: true, type: 'boolean', description: 'New user registration alerts' },
        { category: 'notifications', key: 'newSubmission', value: true, type: 'boolean', description: 'New submission alerts' },
        { category: 'notifications', key: 'reviewModeration', value: true, type: 'boolean', description: 'Review moderation alerts' },
        { category: 'notifications', key: 'systemAlerts', value: true, type: 'boolean', description: 'System alerts' },

        // Appearance settings
        { category: 'appearance', key: 'theme', value: 'light', type: 'string', description: 'Theme' },
        { category: 'appearance', key: 'primaryColor', value: '#ea580c', type: 'string', description: 'Primary color' },
        { category: 'appearance', key: 'logoUrl', value: '/images/logo.png', type: 'string', description: 'Logo URL' },
        { category: 'appearance', key: 'faviconUrl', value: '/favicon.ico', type: 'string', description: 'Favicon URL' },
        { category: 'appearance', key: 'customCss', value: '', type: 'string', description: 'Custom CSS' },

        // Integration settings
        { category: 'integrations', key: 'googleAnalytics', value: '', type: 'string', description: 'Google Analytics ID' },
        { category: 'integrations', key: 'facebookPixel', value: '', type: 'string', description: 'Facebook Pixel ID' },
        { category: 'integrations', key: 'stripePublishableKey', value: '', type: 'string', description: 'Stripe publishable key' },
        { category: 'integrations', key: 'stripeSecretKey', value: '', type: 'string', description: 'Stripe secret key' },
        { category: 'integrations', key: 'mapboxToken', value: '', type: 'string', description: 'Mapbox token' }
      ]

      await Setting.insertMany(defaultSettings)

      // Re-fetch settings after creation
      const newSettings = await Setting.find({}).sort({ category: 1, key: 1 })
      newSettings.forEach(setting => {
        if (!organizedSettings[setting.category]) {
          organizedSettings[setting.category] = {}
        }
        organizedSettings[setting.category][setting.key] = setting.value
      })
    }

    return NextResponse.json({
      success: true,
      data: organizedSettings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Update multiple settings
    const updates = []
    for (const [category, settings] of Object.entries(body)) {
      for (const [key, value] of Object.entries(settings as Record<string, unknown>)) {
        updates.push({
          updateOne: {
            filter: { category, key },
            update: { value, updatedAt: new Date() },
            upsert: true
          }
        })
      }
    }

    if (updates.length > 0) {
      await Setting.bulkWrite(updates)
    }

    // Return updated settings
    const settings = await Setting.find({}).sort({ category: 1, key: 1 })
    const organizedSettings: Record<string, Record<string, unknown>> = {}

    settings.forEach(setting => {
      if (!organizedSettings[setting.category]) {
        organizedSettings[setting.category] = {}
      }
      organizedSettings[setting.category][setting.key] = setting.value
    })

    return NextResponse.json({
      success: true,
      data: organizedSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { category, key, value } = body

    if (!category || !key) {
      return NextResponse.json(
        { success: false, message: 'Category and key are required' },
        { status: 400 }
      )
    }

    // Update individual setting
    const setting = await Setting.findOneAndUpdate(
      { category, key },
      { value, updatedAt: new Date() },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Setting updated successfully'
    })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update setting' },
      { status: 500 }
    )
  }
}
