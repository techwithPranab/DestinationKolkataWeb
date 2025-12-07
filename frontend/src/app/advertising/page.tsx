import React from 'react'
import { Metadata } from 'next'
import { TrendingUp, Target, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Advertising | Destination Kolkata',
  description: 'Promote your business with targeted advertising on Destination Kolkata. Reach thousands of potential customers in Kolkata.',
}

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Target className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Advertising Solutions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reach thousands of potential customers in Kolkata with our targeted advertising solutions.
              Drive more traffic to your business and increase your revenue.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Advertising Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
                Premium Listing
              </CardTitle>
              <CardDescription>Get featured placement and enhanced visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Top search results placement</li>
                <li>• Featured badge on listings</li>
                <li>• Priority customer support</li>
                <li>• Detailed analytics dashboard</li>
              </ul>
              {/* <div className="text-2xl font-bold text-orange-600 mb-4">₹2,999/month</div> */}
              <Button className="w-full text-white   bg-orange-600 hover:bg-orange-700">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="h-6 w-6 text-orange-500 mr-2" />
                Targeted Campaigns
              </CardTitle>
              <CardDescription>Reach specific customer segments</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Location-based targeting</li>
                <li>• Interest-based campaigns</li>
                <li>• Custom audience creation</li>
                <li>• Real-time performance tracking</li>
              </ul>
              {/* <div className="text-2xl font-bold text-orange-600 mb-4">₹1,499/month</div> */}
              <Button className="w-full text-white bg-orange-600 hover:bg-orange-700">
                Start Campaign
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart3 className="h-6 w-6 text-orange-500 mr-2" />
                Banner Advertising
              </CardTitle>
              <CardDescription>Display ads across our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Homepage banner placement</li>
                <li>• Category page ads</li>
                <li>• Mobile-optimized banners</li>
                <li>• Detailed impression reports</li>
              </ul>
              {/* <div className="text-2xl font-bold text-orange-600 mb-4">₹999/month</div> */}
              <Button className="w-full text-white bg-orange-600 hover:bg-orange-700">
                Book Ad Space
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Advertise With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Large Audience</h3>
              <p className="text-gray-600">Reach thousands of active users searching for services in Kolkata</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeted Reach</h3>
              <p className="text-gray-600">Connect with customers actively looking for your type of business</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Track performance with comprehensive reporting and insights</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">Join hundreds of businesses that have grown with our platform</p>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16 hidden">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hotel Paradise</CardTitle>
                <CardDescription>Luxury Hotel in South Kolkata</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  &ldquo;Since advertising with Destination Kolkata, our bookings have increased by 40%.
                  The targeted reach helped us connect with the right customers.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">- Rajesh Kumar, Owner</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spice Garden Restaurant</CardTitle>
                <CardDescription>Authentic Bengali Cuisine</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  &ldquo;The premium listing feature helped us stand out from competitors.
                  Our footfall increased significantly within the first month.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">- Priya Sharma, Manager</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">City Tours Kolkata</CardTitle>
                <CardDescription>Guided City Tours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  &ldquo;Advertising campaigns helped us reach tourists planning their Kolkata visit.
                  We&apos;ve seen a 60% increase in tour bookings.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">- Amit Singh, Founder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-orange-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start advertising today and reach more customers in Kolkata.
            Our team will help you create the perfect advertising strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Sales Team
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
