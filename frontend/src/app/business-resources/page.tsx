import React from 'react'
import { Metadata } from 'next'
import { BookOpen, Download, Video, FileText, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Business Resources | Destination Kolkata',
  description: 'Access valuable resources to grow your business in Kolkata. Guides, templates, and tools for business success.',
}

export default function BusinessResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Business Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access valuable resources, guides, and tools to help you grow your business in Kolkata.
              From marketing tips to operational guides, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
                Marketing & Sales
              </CardTitle>
              <CardDescription>Strategies to attract and retain customers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Digital Marketing Guide</li>
                <li>• Customer Acquisition Strategies</li>
                <li>• Social Media Marketing Tips</li>
                <li>• Email Marketing Templates</li>
                <li>• SEO Best Practices</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                View Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="h-6 w-6 text-orange-500 mr-2" />
                Operations & Management
              </CardTitle>
              <CardDescription>Tools for efficient business operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Business Plan Templates</li>
                <li>• Staff Management Guide</li>
                <li>• Inventory Management Tips</li>
                <li>• Quality Control Standards</li>
                <li>• Risk Management Strategies</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                View Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-6 w-6 text-orange-500 mr-2" />
                Legal & Compliance
              </CardTitle>
              <CardDescription>Legal requirements and compliance guides</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Business Registration Guide</li>
                <li>• Tax Compliance Checklist</li>
                <li>• Food Safety Standards</li>
                <li>• Employment Law Basics</li>
                <li>• Insurance Requirements</li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                View Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Complete Guide to Starting a Business in Kolkata</CardTitle>
                <CardDescription>A comprehensive guide covering everything from registration to marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-gray-600">PDF Guide</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-gray-600">2.3 MB</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Updated 2024</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Digital Marketing Masterclass</CardTitle>
                <CardDescription>Learn effective digital marketing strategies for your Kolkata business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-gray-600">Video Series</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-gray-600">12 Lessons</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">3 hours</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Video className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tools & Templates */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Tools & Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Plan Template</h3>
                <p className="text-gray-600 text-sm mb-4">Professional template for your business plan</p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Calendar</h3>
                <p className="text-gray-600 text-sm mb-4">Plan your marketing activities effectively</p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Survey</h3>
                <p className="text-gray-600 text-sm mb-4">Gather valuable customer feedback</p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Tracker</h3>
                <p className="text-gray-600 text-sm mb-4">Monitor your business finances</p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">From Startup to Success</h3>
              <p className="text-gray-600 mb-4">
                &ldquo;The business resources and templates helped me launch my restaurant successfully.
                The marketing guide alone saved me thousands in consulting fees.&rdquo;
              </p>
              <div className="text-sm text-gray-500">- Restaurant Owner, Kolkata</div>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scaling with Confidence</h3>
              <p className="text-gray-600 mb-4">
                &ldquo;Using the operational guides, I was able to scale my business from 1 to 3 locations
                while maintaining quality and customer satisfaction.&rdquo;
              </p>
              <div className="text-sm text-gray-500">- Retail Chain Owner, Kolkata</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-orange-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our business experts are here to help you succeed. Get personalized guidance
            and support for your Kolkata business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Business Advisor
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
