'use client'

import { AlertTriangle, MapPin, Image, MessageSquare, Send, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function ReportPage() {
  const [formData, setFormData] = useState({
    reportType: '',
    businessName: '',
    location: '',
    description: '',
    evidence: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          reportType: '',
          businessName: '',
          location: '',
          description: '',
          evidence: '',
          email: ''
        })
      } else {
        const errorData = await response.json()
        setSubmitStatus('error')
        setErrorMessage(errorData.message || 'Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Report form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Report an Issue</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Help us maintain accurate and up-to-date information. Report any issues or concerns you encounter.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Types */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Report</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <MapPin className="h-5 w-5 text-red-500" aria-hidden="true" />
                    <span>Inaccurate Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    Wrong address, phone number, hours, or other business details.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Image className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    <span>Outdated Photos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    Photos that no longer represent the current state of the location.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    <span>Closed Business</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    Businesses that have permanently closed or moved.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Shield className="h-5 w-5 text-purple-500" aria-hidden="true" />
                    <span>Inappropriate Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    Offensive content, spam, or violations of our community guidelines.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-red-500" aria-hidden="true" />
                  <span>Submit a Report</span>
                </CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us investigate and resolve the issue quickly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Issue *
                    </label>
                    <select
                      id="reportType"
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                    >
                      <option value="">Select issue type</option>
                      <option value="inaccurate">Inaccurate Information</option>
                      <option value="outdated">Outdated Photos</option>
                      <option value="closed">Business Closed</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="spam">Spam or Fake Listing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business/Location Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                      placeholder="Name of the business or location"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location/URL (if applicable)
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                      placeholder="Address or page URL where the issue appears"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description of the Issue *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                      placeholder="Please describe the issue in detail. What did you find? What should it be?"
                    />
                  </div>

                  <div>
                    <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
                      Supporting Evidence (Optional)
                    </label>
                    <textarea
                      id="evidence"
                      name="evidence"
                      value={formData.evidence}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                      placeholder="Any additional information, links, or evidence that supports your report"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-red-500 focus:shadow-red-200 transition-all duration-200"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Provide your email if you&apos;d like us to follow up on your report.
                    </p>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                      <CheckCircle className="h-5 w-5" aria-hidden="true" />
                      <span>Thank you for your report! We&apos;ll review it within 24-48 hours.</span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-5 w-5" aria-hidden="true" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Important Notice
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            All reports are reviewed by our team within 24-48 hours. We may contact you for additional information if needed.
                            False reports may result in account restrictions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-red-500 hover:bg-red-600">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How We Handle Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Review Process</h4>
                <p className="text-gray-600 text-sm">
                  Each report is carefully reviewed by our quality assurance team within 24-48 hours.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-green-600" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Verification</h4>
                <p className="text-gray-600 text-sm">
                  We verify reports through multiple sources including official records and site visits when necessary.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Updates</h4>
                <p className="text-gray-600 text-sm">
                  Once verified, we update the information and notify you of the resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
