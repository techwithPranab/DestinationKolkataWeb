import { Metadata } from 'next'
import { Cookie, Settings, BarChart3, Target, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cookie Policy - Destination Kolkata',
  description: 'Learn about how Destination Kolkata uses cookies and similar technologies to improve your browsing experience.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            We use cookies to enhance your experience on Destination Kolkata. Learn more about how we use them.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Last Updated */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500 text-center">
              Last updated: January 2024
            </p>
          </div>

          {/* What are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="h-6 w-6 text-orange-500" />
                <span>What are Cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our site.
              </p>
              <p className="text-gray-700">
                Cookies can be &ldquo;persistent&rdquo; (they remain on your device for a set period) or &ldquo;session&rdquo; (they are deleted when you close your browser).
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-blue-500" />
                <span>Types of Cookies We Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-2" />
                    Essential Cookies
                  </h4>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Session management</li>
                    <li>Security features</li>
                    <li>Load balancing</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    Analytics Cookies
                  </h4>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Settings className="h-5 w-5 text-purple-500 mr-2" />
                    Functional Cookies
                  </h4>
                  <p className="text-gray-700 mb-2">
                    These cookies enable the website to remember choices you make and provide enhanced features.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Language preferences</li>
                    <li>Location settings</li>
                    <li>Customized content</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Target className="h-5 w-5 text-red-500 mr-2" />
                    Marketing Cookies
                  </h4>
                  <p className="text-gray-700 mb-2">
                    These cookies are used to deliver advertisements that are more relevant to you and your interests.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Targeted advertising</li>
                    <li>Social media features</li>
                    <li>Retargeting campaigns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
                <span>Third-party Cookies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We may also use third-party services that set their own cookies. These include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Social Media Platforms:</strong> For social sharing and engagement features</li>
                <li><strong>Advertising Networks:</strong> For delivering relevant advertisements</li>
                <li><strong>Content Delivery Networks:</strong> For faster loading of website content</li>
              </ul>
              <p className="text-gray-700 mt-4">
                These third parties have their own privacy policies and cookie practices, which we encourage you to review.
              </p>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-green-500" />
                <span>Managing Your Cookie Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You have several options for managing cookies:
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Browser Settings</h4>
                  <p className="text-blue-800 text-sm">
                    Most web browsers allow you to control cookies through their settings. You can usually find these settings in the &lsquo;Options&rsquo; or &lsquo;Preferences&rsquo; menu of your browser.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Cookie Consent Banner</h4>
                  <p className="text-green-800 text-sm">
                    When you first visit our website, you&apos;ll see a cookie consent banner where you can choose which types of cookies to accept or reject.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Opt-out Links</h4>
                  <p className="text-purple-800 text-sm">
                    You can opt out of certain third-party cookies by visiting their respective opt-out pages or using tools like the Digital Advertising Alliance&apos;s opt-out tool.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and limit your user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Impact of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-orange-500" />
                <span>How Cookies Improve Your Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Cookies help us provide a better experience by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Remembering your preferences and settings</li>
                <li>Keeping you logged in during your session</li>
                <li>Understanding which pages are most popular</li>
                <li>Showing relevant content and advertisements</li>
                <li>Improving website performance and loading times</li>
                <li>Providing personalized recommendations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Updates to Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-500" />
                <span>Updates to This Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@destinationkolkata.com<br />
                  <strong>Phone:</strong> +91 33 1234 5678<br />
                  <strong>Address:</strong> Tourism Office, BBD Bagh, Kolkata, West Bengal 700001, India
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Settings Button */}
          <div className="text-center">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Settings className="h-4 w-4 mr-2" />
              Manage Cookie Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
