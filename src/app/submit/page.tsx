import React from 'react'
import { Metadata } from 'next'
import { Building2, Plus, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'List Your Business | Destination Kolkata',
  description: 'Add your business to Destination Kolkata and reach more customers. Join our network of trusted businesses in Kolkata.',
}

export default function SubmitBusinessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              List Your Business
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses in Kolkata and reach more customers through our platform.
              Get discovered by travelers and locals looking for your services.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why List Your Business?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Increase Visibility</h3>
                  <p className="text-gray-600">Get discovered by thousands of potential customers searching for your services in Kolkata.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Build Trust</h3>
                  <p className="text-gray-600">Display customer reviews, ratings, and detailed information to build credibility.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Easy Management</h3>
                  <p className="text-gray-600">Update your business information, add photos, and respond to reviews from your dashboard.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                  <p className="text-gray-600">Track views, clicks, and customer engagement to understand your audience better.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Types */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Perfect For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Hotels & Accommodations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Showcase your rooms, amenities, and packages to travelers.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Restaurants & Cafes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Display your menu, photos, and customer reviews.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Tour & Travel Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Promote your tours, packages, and travel expertise.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Local Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Taxi services, guides, and other local businesses.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Attractions & Venues</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Museums, parks, and entertainment venues.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Sports & Recreation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gyms, sports clubs, and recreational facilities.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of successful businesses in Kolkata. It&apos;s free to list your business and start attracting customers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-5 w-5 mr-2" />
              List Your Business Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is it free to list my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, basic listing is completely free. We also offer premium features for enhanced visibility.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does it take to get listed?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Most businesses are approved and live within 24-48 hours after submission and verification.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I update my business information?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, you can update your business details, add photos, and manage your listing anytime.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you verify businesses?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, we verify all businesses to ensure quality and authenticity for our users.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
