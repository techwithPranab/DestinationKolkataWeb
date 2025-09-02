import { Metadata } from 'next'
import { Shield, Eye, Lock, Users, Cookie, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Privacy Policy - Destination Kolkata',
  description: 'Learn about how Destination Kolkata collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
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

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-500" />
                <span>Privacy Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Destination Kolkata (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="text-gray-700">
                By using our website, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-green-500" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <p className="text-gray-700">
                    We may collect personal information that you provide directly to us, such as:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Business information for listings</li>
                    <li>Feedback and support requests</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                  <p className="text-gray-700">
                    We automatically collect certain information about your device and usage:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent</li>
                    <li>Device information and screen resolution</li>
                    <li>Referral sources</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cookies and Tracking</h4>
                  <p className="text-gray-700">
                    We use cookies and similar technologies to enhance your experience:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Essential cookies for website functionality</li>
                    <li>Analytics cookies to understand usage patterns</li>
                    <li>Preference cookies to remember your settings</li>
                    <li>Marketing cookies for targeted advertising</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-500" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">We use the information we collect for various purposes:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Provide Services:</strong> To operate and maintain our website and services</li>
                <li><strong>Improve Experience:</strong> To personalize content and improve user experience</li>
                <li><strong>Communication:</strong> To respond to your inquiries and provide customer support</li>
                <li><strong>Business Listings:</strong> To verify and publish business information</li>
                <li><strong>Analytics:</strong> To understand how our website is used and improve performance</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
                <li><strong>Marketing:</strong> To send promotional materials (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-6 w-6 text-red-500" />
                <span>Information Sharing and Disclosure</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our website</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Public Information:</strong> Business listings and public reviews as intended for public viewing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-green-500" />
                <span>Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure data storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-gray-700 mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Cookies Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="h-6 w-6 text-orange-500" />
                <span>Cookies and Tracking Technologies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your browsing experience. You can control cookie settings through your browser preferences.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  For more detailed information about our cookie practices, please see our{' '}
                  <a href="/cookies" className="text-orange-500 hover:underline">Cookie Policy</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-500" />
                <span>Your Rights and Choices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookies:</strong> Control cookie preferences through browser settings</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-purple-500" />
                <span>Contact Us</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
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

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
