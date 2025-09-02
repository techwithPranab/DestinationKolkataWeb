import React from 'react'
import { Metadata } from 'next'
import { Handshake, Users, Globe, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Partnerships | Destination Kolkata',
  description: 'Partner with Destination Kolkata to expand your reach and grow your business. Join our network of trusted partners.',
}

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Handshake className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Partnership Opportunities
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our growing network of partners and unlock new opportunities for growth.
              Collaborate with us to reach more customers and create mutually beneficial relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Partnership Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="h-6 w-6 text-orange-500 mr-2" />
                Business Partners
              </CardTitle>
              <CardDescription>Hotels, restaurants, and service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Featured listings and promotions</li>
                <li>• Priority support and training</li>
                <li>• Exclusive partnership benefits</li>
                <li>• Joint marketing campaigns</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Become a Partner
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Globe className="h-6 w-6 text-orange-500 mr-2" />
                Technology Partners
              </CardTitle>
              <CardDescription>API integrations and tech solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• API access and integration support</li>
                <li>• Technical documentation</li>
                <li>• Co-development opportunities</li>
                <li>• Revenue sharing models</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Tech Partnership
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Award className="h-6 w-6 text-orange-500 mr-2" />
                Content Partners
              </CardTitle>
              <CardDescription>Content creators and media companies</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Content syndication opportunities</li>
                <li>• Cross-promotion campaigns</li>
                <li>• Exclusive content partnerships</li>
                <li>• Brand collaboration projects</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Content Partnership
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Partnership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Expanded Reach</h3>
                  <p className="text-gray-600">Access our network of thousands of users and businesses in Kolkata</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Handshake className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mutual Growth</h3>
                  <p className="text-gray-600">Collaborative opportunities that benefit both parties</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Exclusive Benefits</h3>
                  <p className="text-gray-600">Special perks and advantages available only to partners</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Globe className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Brand Visibility</h3>
                  <p className="text-gray-600">Increased brand recognition and market presence</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dedicated Support</h3>
                  <p className="text-gray-600">Personal account management and technical support</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Opportunities</h3>
                  <p className="text-gray-600">New income streams through partnership programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Partners */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-400 mb-2">Hotels</div>
              <div className="text-sm text-gray-600">50+ Partner Hotels</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-400 mb-2">Restaurants</div>
              <div className="text-sm text-gray-600">100+ Partner Restaurants</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-400 mb-2">Tour Operators</div>
              <div className="text-sm text-gray-600">25+ Tour Partners</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-400 mb-2">Tech Partners</div>
              <div className="text-sm text-gray-600">15+ Technology Partners</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-orange-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Partner Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our partnership program and unlock new opportunities for growth.
            Let&apos;s work together to create amazing experiences for Kolkata visitors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Apply for Partnership
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
