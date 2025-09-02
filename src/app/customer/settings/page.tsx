"use client"

import React, { useState } from 'react'
import { Bell, Shield, Palette, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CustomerSettings() {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    marketingEmails: false,

    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,

    // Preferences
    language: 'en',
    timezone: 'Asia/Kolkata',
    theme: 'light'
  })

  const [loading, setLoading] = useState(false)

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Implement settings save API
      console.log('Saving settings:', settings)
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your account preferences and privacy settings</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Checkbox
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
            </div>
            <Checkbox
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications" className="text-sm font-medium">
                SMS Notifications
              </Label>
              <p className="text-sm text-gray-600">Receive important updates via SMS</p>
            </div>
            <Checkbox
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('smsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails" className="text-sm font-medium">
                Marketing Emails
              </Label>
              <p className="text-sm text-gray-600">Receive promotional emails and newsletters</p>
            </div>
            <Checkbox
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked: boolean) => handleSettingChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profile-visibility" className="text-sm font-medium">
              Profile Visibility
            </Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value) => handleSettingChange('profileVisibility', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="business">Business Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-email" className="text-sm font-medium">
                Show Email Address
              </Label>
              <p className="text-sm text-gray-600">Display your email on your public profile</p>
            </div>
            <Checkbox
              id="show-email"
              checked={settings.showEmail}
              onCheckedChange={(checked: boolean) => handleSettingChange('showEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-phone" className="text-sm font-medium">
                Show Phone Number
              </Label>
              <p className="text-sm text-gray-600">Display your phone number on your public profile</p>
            </div>
            <Checkbox
              id="show-phone"
              checked={settings.showPhone}
              onCheckedChange={(checked: boolean) => handleSettingChange('showPhone', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-sm font-medium">
              Language
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => handleSettingChange('timezone', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="Asia/Dhaka">Asia/Dhaka (BST)</SelectItem>
                <SelectItem value="Asia/Thimphu">Asia/Thimphu (BTT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="theme" className="text-sm font-medium">
              Theme
            </Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange('theme', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
