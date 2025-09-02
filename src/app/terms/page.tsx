import { Metadata } from 'next'
import { FileText, Users, Shield, AlertTriangle, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service - Destination Kolkata',
  description: 'Read the terms and conditions for using Destination Kolkata website and services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Please read these terms carefully before using Destination Kolkata.
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

          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-green-500" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                By accessing and using Destination Kolkata (&ldquo;the Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-500" />
                <span>Use License</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials (information or software) on Destination Kolkata&apos;s website for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-gray-700 mb-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-purple-500" />
                <span>User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">By using our Service, you agree to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete information when creating an account or submitting content</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the Service in accordance with applicable laws and regulations</li>
                <li>Respect the rights of other users and third parties</li>
                <li>Not engage in any harmful, fraudulent, or illegal activities</li>
                <li>Report any violations of these terms or inappropriate content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Content Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <span>Content Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                When submitting content to Destination Kolkata, you agree that the content will not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Violate any intellectual property rights</li>
                <li>Contain harmful, offensive, or inappropriate material</li>
                <li>Include false or misleading information</li>
                <li>Promote illegal activities or discrimination</li>
                <li>Contain spam, viruses, or malicious code</li>
                <li>Infringe on privacy rights of others</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We reserve the right to remove any content that violates these guidelines without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Business Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-indigo-500" />
                <span>Business Listings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For businesses submitting listings to Destination Kolkata:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You must be authorized to represent the business</li>
                <li>All information provided must be accurate and up-to-date</li>
                <li>You are responsible for maintaining your listing information</li>
                <li>We may verify business information through various means</li>
                <li>Paid advertising does not guarantee placement or ranking</li>
                <li>We reserve the right to remove or modify listings at our discretion</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-red-500" />
                <span>Intellectual Property</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Destination Kolkata and its licensors.
              </p>
              <p className="text-gray-700 mb-4">
                The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <span>Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                The information on this website is provided on an &ldquo;as is&rdquo; basis. To the fullest extent permitted by law, Destination Kolkata:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Does not guarantee the accuracy, completeness, or timeliness of information</li>
                <li>Is not responsible for any errors, omissions, or inaccuracies in the content</li>
                <li>Does not warrant that the website will be uninterrupted or error-free</li>
                <li>Is not liable for any direct, indirect, or consequential damages</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-gray-500" />
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                In no event shall Destination Kolkata, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-red-500" />
                <span>Termination</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-blue-500" />
                <span>Governing Law</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of West Bengal, India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@destinationkolkata.com<br />
                  <strong>Phone:</strong> +91 33 1234 5678<br />
                  <strong>Address:</strong> Tourism Office, BBD Bagh, Kolkata, West Bengal 700001, India
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
