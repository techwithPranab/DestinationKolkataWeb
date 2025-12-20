"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Trophy,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailStats {
  totalListings: number
  withEmail: number
  withoutEmail: number
  breakdown: {
    [key: string]: {
      total: number
      withEmail: number
    }
  }
}

interface SendResult {
  success: boolean
  totalSent: number
  failedCount: number
  results?: Array<{
    listing: {
      id: string
      name: string
      email: string
      type: string
    }
    emailSent: boolean
    logId?: string
  }>
  failedEmails?: Array<{
    listing: {
      id: string
      name: string
      email: string
    }
    error: string
  }>
}

export default function EmailMarketingPage() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  
  const [formData, setFormData] = useState({
    listingType: 'all',
    emailSubject: 'Join Destination Kolkata - Grow Your Business!',
    message: ''
  })

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null)

  const listingTypes = [
    { value: 'all', label: 'All Listings', icon: Building2, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { value: 'hotel', label: 'Hotels', icon: Building2, color: 'bg-blue-500' },
    { value: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { value: 'attraction', label: 'Attractions', icon: MapPin, color: 'bg-green-500' },
    { value: 'event', label: 'Events', icon: Calendar, color: 'bg-red-500' },
    { value: 'sport', label: 'Sports', icon: Trophy, color: 'bg-yellow-500' }
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetchAuthenticatedAPI('/api/admin/listing-email-stats', {
        method: 'GET'
      })
      const data = await response.json()
      console.log('Fetched stats:', data);
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmails = async () => {
    if (!confirm(`Are you sure you want to send emails to ${stats?.withEmail || 0} listings?`)) {
      return
    }

    try {
      setSending(true)
      setResult(null)

      const response = await fetchAuthenticatedAPI('/api/admin/send-listing-invitations', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          totalSent: data.totalSent,
          failedCount: data.failedCount,
          results: data.results,
          failedEmails: data.failedEmails
        })
        
        // Refresh stats after sending
        await fetchStats()
      } else {
        setResult({
          success: false,
          totalSent: 0,
          failedCount: 0
        })
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      setResult({
        success: false,
        totalSent: 0,
        failedCount: 0
      })
    } finally {
      setSending(false)
    }
  }

  const handlePreview = async () => {
    try {
      const response = await fetchAuthenticatedAPI('/api/admin/preview-listing-invitation', {
        method: 'POST',
        body: JSON.stringify({
          listingType: formData.listingType === 'all' ? 'hotel' : formData.listingType,
          message: formData.message
        })
      })
      const data = await response.json()

      if (data.success && data.html) {
        setPreviewHtml(data.html)
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true)
      setTestResult(null)

      const response = await fetchAuthenticatedAPI('/api/admin/send-test-listing-invitation', {
        method: 'POST',
        body: JSON.stringify({
          listingType: formData.listingType === 'all' ? 'hotel' : formData.listingType,
          emailSubject: formData.emailSubject,
          message: formData.message
        })
      })
      const data = await response.json()

      if (data.success) {
        setTestResult({
          success: true,
          message: 'Test email sent successfully to support@destinationkolkata.com'
        })
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Failed to send test email'
        })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setTestResult({
        success: false,
        message: 'Failed to send test email'
      })
    } finally {
      setSendingTest(false)
    }
  }

  const downloadReport = () => {
    if (!result || !result.results) return

    const csvContent = [
      ['Business Name', 'Email', 'Type', 'Status', 'Log ID'],
      ...result.results.map(r => [
        r.listing.name,
        r.listing.email,
        r.listing.type,
        r.emailSent ? 'Sent' : 'Failed',
        r.logId || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-campaign-report-${new Date().toISOString()}.csv`
    a.click()
  }

  // Calculate recipient count based on selected listing type
  const getRecipientCount = () => {
    if (!stats) return 0
    
    if (formData.listingType === 'all') {
      return stats.withEmail
    }
    
    const category = formData.listingType + 's' // e.g., 'hotel' -> 'hotels'
    return stats.breakdown[category]?.withEmail || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Marketing Campaign</h1>
        <p className="mt-2 text-gray-600">
          Send onboarding invitations to hotels and restaurants with valid email addresses
        </p>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalListings}</div>
                <p className="text-xs text-gray-500 mt-1">Across all categories</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">With Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.withEmail}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.withEmail / stats.totalListings) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Without Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.withoutEmail}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.withoutEmail / stats.totalListings) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ready to Send</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.withEmail}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={fetchStats}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
            <CardDescription>Email availability breakdown for each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.breakdown).map(([category, data]) => {
                const percentage = (data.withEmail / data.total) * 100
                const Icon = listingTypes.find(t => t.value === category.slice(0, -1))?.icon || Building2
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {data.withEmail} / {data.total}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium w-12 text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Email Campaign</CardTitle>
          <CardDescription>
            Configure and send onboarding invitation emails to your listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="listingType">Target Audience</Label>
              <Select
                value={formData.listingType}
                onValueChange={(value) => setFormData({ ...formData, listingType: value })}
              >
                <SelectTrigger id="listingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  {listingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                        {stats && type.value !== 'all' && (
                          <Badge variant="secondary" className="ml-2">
                            {stats.breakdown[type.value + 's']?.withEmail || 0}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="emailSubject">Email Subject</Label>
              <Input
                id="emailSubject"
                value={formData.emailSubject}
                onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                placeholder="Enter email subject line"
              />
            </div>

            <div>
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add a custom message to include in the email (optional)"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will be highlighted in the email template
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Email Content Includes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>About DestinationKolkata.com platform</li>
                <li>Benefits of onboarding (FREE listing)</li>
                <li>Complete registration process (3 steps)</li>
                <li>Support contact information</li>
                <li>Professional design with call-to-action button</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Email
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTest}
              variant="outline"
              className="flex-1"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={sending || !stats || stats.withEmail === 0}
              className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {getRecipientCount()} Recipients
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Result */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className="flex items-center space-x-2">
              {testResult.success ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-800">{testResult.message}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">{testResult.message}</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Campaign Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">Campaign Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-green-600">{result.totalSent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
                </div>
              </div>

              {result.results && result.results.length > 0 && (
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              )}

              {result.failedEmails && result.failedEmails.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Failed Emails:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.failedEmails.map((failed, idx) => (
                      <div key={idx} className="text-sm text-red-600 bg-white p-2 rounded">
                        {failed.listing.name} ({failed.listing.email}) - {failed.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how your email will appear to recipients
            </DialogDescription>
          </DialogHeader>
          <div 
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
