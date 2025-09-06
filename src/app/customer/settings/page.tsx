"use client"

import React, { useState, useEffect } from 'react'
import { Bell, Shield, Palette, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useApi } from '@/lib/api-client'

interface SettingsData {
  preferences?: {
    emailNotifications?: boolean
    pushNotifications?: boolean
    smsNotifications?: boolean
    marketingEmails?: boolean
    language?: string
    timezone?: string
    theme?: string
  }
  privacy?: {
    profileVisibility?: string
    showEmail?: boolean
    showPhone?: boolean
  }
}

export default function CustomerSettings() {
  const api = useApi()
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
  const [fetching, setFetching] = useState(true)

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...')

      const response = await api.get('/api/customer/settings')

      if (response.data) {
        console.log('Settings data received:', response.data)
        const userSettings = (response.data as { settings: SettingsData }).settings

        setSettings({
          emailNotifications: userSettings.preferences?.emailNotifications ?? true,
          pushNotifications: userSettings.preferences?.pushNotifications ?? false,
          smsNotifications: userSettings.preferences?.smsNotifications ?? false,
          marketingEmails: userSettings.preferences?.marketingEmails ?? false,
          profileVisibility: userSettings.privacy?.profileVisibility ?? 'public',
          showEmail: userSettings.privacy?.showEmail ?? false,
          showPhone: userSettings.privacy?.showPhone ?? false,
          language: userSettings.preferences?.language ?? 'en',
          timezone: userSettings.preferences?.timezone ?? 'Asia/Kolkata',
          theme: userSettings.preferences?.theme ?? 'light'
        })
      } else {
        console.error('Failed to load settings:', response.error)
        toast.error(`Failed to load settings: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error(`Error loading settings: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setFetching(false)
    }
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      console.log('Saving settings...')

      const response = await api.put('/api/customer/settings', {
        preferences: {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          smsNotifications: settings.smsNotifications,
          marketingEmails: settings.marketingEmails,
          language: settings.language,
          timezone: settings.timezone,
          theme: settings.theme
        },
        privacy: {
          profileVisibility: settings.profileVisibility,
          showEmail: settings.showEmail,
          showPhone: settings.showPhone
        }
      })

      if (response.data) {
        console.log('Settings saved successfully:', response.data)
        toast.success('Settings saved successfully!')
      } else {
        console.error('Failed to save settings:', response.error)
        toast.error(response.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(`Error saving settings: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
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
