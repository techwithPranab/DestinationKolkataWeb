import React from 'react'
import { Metadata } from 'next'
import { HelpCircle, Search, MessageCircle, FileText, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Help Center | Destination Kolkata',
  description: 'Find answers to your questions and get help with using Destination Kolkata. Browse FAQs, guides, and contact support.',
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers to your questions and get the help you need.
              Browse our comprehensive guides and FAQs.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm shadow-lg rounded-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 bg-orange-100 rounded-full p-3 w-fit">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Learn the basics of using our platform
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 bg-orange-100 rounded-full p-3 w-fit">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Account & Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Manage your account and profile settings
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 bg-orange-100 rounded-full p-3 w-fit">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Finding Places</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Search and discover places in Kolkata
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 bg-orange-100 rounded-full p-3 w-fit">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">How to create an account</CardTitle>
                  <CardDescription>Step-by-step guide to setting up your account</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Finding the best restaurants</CardTitle>
                  <CardDescription>Tips for discovering great places to eat</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Booking hotels and accommodations</CardTitle>
                  <CardDescription>How to find and book the perfect stay</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Using the mobile app</CardTitle>
                  <CardDescription>Make the most of our mobile experience</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Writing reviews and ratings</CardTitle>
                  <CardDescription>How your feedback helps the community</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Managing your favorites</CardTitle>
                  <CardDescription>Save and organize your favorite places</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Troubleshooting common issues</CardTitle>
                  <CardDescription>Solutions to frequently encountered problems</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Privacy and security</CardTitle>
                  <CardDescription>How we protect your data and privacy</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is Destination Kolkata &ldquo;free to use&rdquo;?</h3>
                <p className="text-gray-600">Yes, browsing and searching for places is completely free. Some premium features may require payment.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I reset my password?</h3>
                <p className="text-gray-600">Click on &ldquo;Forgot Password&rdquo; on the login page and follow the instructions sent to your email.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I list my business &ldquo;for free&rdquo;?</h3>
                <p className="text-gray-600">Yes, basic business listings are free. Premium listings offer enhanced visibility and features.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I contact customer support?</h3>
                <p className="text-gray-600">You can reach us through the contact form, email, or phone. Our support team is available &ldquo;24/7&rdquo;.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my reviews &ldquo;anonymous&rdquo;?</h3>
                <p className="text-gray-600">You can choose to post reviews &ldquo;anonymously&rdquo; or with your profile name visible to other users.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I update my business information?</h3>
                <p className="text-gray-600">Business owners can log into their dashboard to update information, add photos, and manage their listings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="h-5 w-5 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
