import { Metadata } from 'next'
import { Database, MapPin, Calendar, Users, ExternalLink, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Data Sources - Destination Kolkata',
  description: 'Learn about the data sources and attribution information for Destination Kolkata.',
}

export default function SourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Sources & Attribution</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Transparency is important to us. Learn about where our data comes from and how we attribute our sources.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-indigo-500" />
                <span>Our Data Philosophy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                At Destination Kolkata, we believe in transparency and accuracy. We aggregate information from multiple reliable sources to provide you with the most comprehensive and up-to-date information about Kolkata.
              </p>
              <p className="text-gray-700">
                All data is regularly verified and updated to ensure accuracy. When we use third-party data, we clearly attribute the sources and provide links for further information.
              </p>
            </CardContent>
          </Card>

          {/* Primary Data Sources */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Primary Data Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>OpenStreetMap</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Our primary mapping data source for location information, addresses, and geographic features.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Global coverage with local accuracy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Open-source and community-driven</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Regular updates from contributors</span>
                    </div>
                  </div>
                  <a
                    href="https://openstreetmap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-600 mt-3 text-sm"
                  >
                    <span>Visit OpenStreetMap</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span>Eventbrite</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Source for local events, festivals, and cultural activities happening in Kolkata.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time event information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified event organizers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ticket availability and pricing</span>
                    </div>
                  </div>
                  <a
                    href="https://eventbrite.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-green-500 hover:text-green-600 mt-3 text-sm"
                  >
                    <span>Visit Eventbrite</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span>Official Tourism Boards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Information from West Bengal Tourism and Kolkata Tourism Development Corporation.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Official government data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified attraction information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Historical and cultural accuracy</span>
                    </div>
                  </div>
                  <a
                    href="https://wbtourism.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-purple-500 hover:text-purple-600 mt-3 text-sm"
                  >
                    <span>Visit West Bengal Tourism</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-orange-500" />
                    <span>Public Datasets</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Open data from government portals and public domain sources for business listings.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Government open data portals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Public domain information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Community-verified data</span>
                    </div>
                  </div>
                  <a
                    href="https://data.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-orange-500 hover:text-orange-600 mt-3 text-sm"
                  >
                    <span>Visit Data.gov.in</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Collection Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-teal-500" />
                <span>How We Collect Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Automated Collection</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Web scraping from official sources</li>
                    <li>API integrations with verified providers</li>
                    <li>Regular data synchronization</li>
                    <li>Automated quality checks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Manual Verification</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Human review of all new listings</li>
                    <li>On-site verification when possible</li>
                    <li>Community feedback integration</li>
                    <li>Cross-reference with multiple sources</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Data Accuracy & Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We are committed to maintaining accurate and current information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-sm text-green-800">Automated monitoring</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Weekly</div>
                  <div className="text-sm text-blue-800">Data updates</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Monthly</div>
                  <div className="text-sm text-purple-800">Comprehensive review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attribution Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-6 w-6 text-indigo-500" />
                <span>Attribution & Licensing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We respect the licensing requirements of our data sources:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>OpenStreetMap:</strong> Data available under Open Database License (ODbL)</li>
                <li><strong>Government Data:</strong> Public domain or Creative Commons licenses</li>
                <li><strong>Eventbrite:</strong> Attribution required for event data usage</li>
                <li><strong>Third-party APIs:</strong> Compliance with provider terms of service</li>
              </ul>
              <p className="text-gray-700 mt-4">
                All attributions are displayed prominently in our footer and data source documentation.
              </p>
            </CardContent>
          </Card>

          {/* Report Inaccuracies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-orange-500" />
                <span>Report Data Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Help us maintain accurate information! If you notice any inaccuracies or outdated information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Use our &ldquo;Report an Issue&rdquo; feature on any listing page</li>
                <li>Contact us through the feedback form</li>
                <li>Email us directly with specific details</li>
                <li>Include links, screenshots, or reference sources when possible</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Community Contribution:</strong> Your feedback helps improve Destination Kolkata for everyone. We review all reports within 24-48 hours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Data Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Have questions about our data sources or attribution practices?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> data@destinationkolkata.com<br />
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
