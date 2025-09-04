'use client'

import React, { useState } from 'react'
import { HelpCircle, Search, MessageCircle, FileText, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Article {
  id: string
  title: string
  description: string
  content: string
  category: string
}

const articles: Article[] = [
  {
    id: 'create-account',
    title: 'How to create an account',
    description: 'Step-by-step guide to setting up your account',
    category: 'Getting Started',
    content: `
      <h3>Creating Your Account</h3>
      <p>Getting started with Destination Kolkata is easy! Follow these simple steps to create your account:</p>
      
      <h4>Step 1: Navigate to Sign Up</h4>
      <p>Click on the "Sign Up" button in the top navigation bar or visit our registration page.</p>
      
      <h4>Step 2: Enter Your Information</h4>
      <p>Fill in your basic information including:</p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Password (minimum 8 characters)</li>
        <li>Phone number (optional)</li>
      </ul>
      
      <h4>Step 3: Verify Your Email</h4>
      <p>Check your email for a verification link and click it to activate your account.</p>
      
      <h4>Step 4: Complete Your Profile</h4>
      <p>Add a profile picture and tell us about your interests in Kolkata to get personalized recommendations.</p>
      
      <h3>Account Benefits</h3>
      <p>With your account, you can:</p>
      <ul>
        <li>Save favorite places</li>
        <li>Write reviews and ratings</li>
        <li>Access exclusive deals</li>
        <li>Receive personalized recommendations</li>
        <li>Track your visit history</li>
      </ul>
    `
  },
  {
    id: 'find-restaurants',
    title: 'Finding the best restaurants',
    description: 'Tips for discovering great places to eat',
    category: 'Finding Places',
    content: `
      <h3>Discovering Great Restaurants in Kolkata</h3>
      <p>Kolkata is a food lover's paradise! Here's how to find the best dining experiences:</p>
      
      <h4>Using Our Search Features</h4>
      <p>Our platform offers multiple ways to find restaurants:</p>
      <ul>
        <li><strong>Search by Cuisine:</strong> Filter by Bengali, Chinese, Continental, etc.</li>
        <li><strong>Location-based Search:</strong> Find restaurants near you or in specific areas</li>
        <li><strong>Price Range:</strong> Filter by budget-friendly to fine dining</li>
        <li><strong>Ratings & Reviews:</strong> Sort by customer ratings and read reviews</li>
      </ul>
      
      <h4>Popular Restaurant Categories</h4>
      <p>Explore these beloved Kolkata dining experiences:</p>
      <ul>
        <li><strong>Street Food:</strong> Try puchkas, jhalmuri, and roll at local stalls</li>
        <li><strong>Bengali Cuisine:</strong> Authentic Bengali thali at traditional restaurants</li>
        <li><strong>Fine Dining:</strong> Modern restaurants with fusion cuisine</li>
        <li><strong>Cafe Culture:</strong> Coffee shops and casual dining spots</li>
      </ul>
      
      <h4>Pro Tips for Food Lovers</h4>
      <ul>
        <li>Visit during lunch hours for authentic local experiences</li>
        <li>Try seasonal specials and festival-specific dishes</li>
        <li>Read recent reviews to ensure quality</li>
        <li>Book reservations for popular restaurants during weekends</li>
      </ul>
    `
  },
  {
    id: 'book-hotels',
    title: 'Booking hotels and accommodations',
    description: 'How to find and book the perfect stay',
    category: 'Travel Planning',
    content: `
      <h3>Finding Your Perfect Stay in Kolkata</h3>
      <p>From luxury hotels to budget guesthouses, Kolkata offers accommodations for every traveler:</p>
      
      <h4>Types of Accommodations</h4>
      <ul>
        <li><strong>Luxury Hotels:</strong> 5-star properties in central locations</li>
        <li><strong>Business Hotels:</strong> Modern amenities for corporate travelers</li>
        <li><strong>Boutique Hotels:</strong> Unique, themed accommodations</li>
        <li><strong>Budget Hotels:</strong> Affordable options with basic amenities</li>
        <li><strong>Guesthouses:</strong> Homely stays with local flavor</li>
      </ul>
      
      <h4>How to Book</h4>
      <p>Follow these steps for a smooth booking experience:</p>
      <ol>
        <li>Specify your dates and number of guests</li>
        <li>Choose your preferred location in Kolkata</li>
        <li>Filter by price range, amenities, and ratings</li>
        <li>Read reviews and check photos</li>
        <li>Select your room type and confirm booking</li>
      </ol>
      
      <h4>Popular Areas for Accommodation</h4>
      <ul>
        <li><strong>South City:</strong> Modern hotels and shopping</li>
        <li><strong>Salt Lake:</strong> Business district with IT hubs</li>
        <li><strong>Central Kolkata:</strong> Historic charm and proximity to attractions</li>
        <li><strong>Howrah:</strong> Budget options near railway station</li>
      </ul>
      
      <h4>Booking Tips</h4>
      <ul>
        <li>Book in advance during peak seasons (October-February)</li>
        <li>Check for cancellation policies</li>
        <li>Look for hotels with free WiFi and breakfast</li>
        <li>Consider proximity to metro stations for easy travel</li>
      </ul>
    `
  },
  {
    id: 'mobile-app',
    title: 'Using the mobile app',
    description: 'Make the most of our mobile experience',
    category: 'Mobile Features',
    content: `
      <h3>Getting Started with Our Mobile App</h3>
      <p>Our mobile app brings Kolkata's best experiences to your fingertips:</p>
      
      <h4>Download & Installation</h4>
      <ul>
        <li>Available on iOS App Store and Google Play Store</li>
        <li>Search for "Destination Kolkata"</li>
        <li>Free download with no in-app purchases required</li>
      </ul>
      
      <h4>Key Features</h4>
      <p>Make the most of these mobile-exclusive features:</p>
      <ul>
        <li><strong>GPS Navigation:</strong> Real-time directions to places</li>
        <li><strong>Offline Maps:</strong> Download maps for offline use</li>
        <li><strong>Photo Upload:</strong> Share your experiences with photos</li>
        <li><strong>Push Notifications:</strong> Get alerts for deals and events</li>
        <li><strong>Voice Search:</strong> Search places using voice commands</li>
      </ul>
      
      <h4>Mobile App Advantages</h4>
      <ul>
        <li>Faster search with location-based results</li>
        <li>One-tap calling and navigation</li>
        <li>Instant booking for hotels and events</li>
        <li>Exclusive mobile-only deals</li>
        <li>Battery-efficient design for all-day use</li>
      </ul>
      
      <h4>Troubleshooting</h4>
      <p>Common issues and solutions:</p>
      <ul>
        <li>Enable location services for accurate results</li>
        <li>Update to the latest version for new features</li>
        <li>Clear cache if the app is running slowly</li>
        <li>Restart your device if experiencing crashes</li>
      </ul>
    `
  },
  {
    id: 'reviews-ratings',
    title: 'Writing reviews and ratings',
    description: 'How your feedback helps the community',
    category: 'Community',
    content: `
      <h3>Share Your Experiences</h3>
      <p>Your reviews help fellow travelers make informed decisions about places in Kolkata:</p>
      
      <h4>How to Write a Review</h4>
      <ol>
        <li>Visit a place and experience it firsthand</li>
        <li>Go to the place's page on our platform</li>
        <li>Click "Write a Review" button</li>
        <li>Rate the place (1-5 stars)</li>
        <li>Write your detailed review</li>
        <li>Add photos if available</li>
        <li>Submit your review</li>
      </ol>
      
      <h4>Review Guidelines</h4>
      <p>To maintain quality, please follow these guidelines:</p>
      <ul>
        <li>Be honest and specific about your experience</li>
        <li>Include both positive and constructive feedback</li>
        <li>Mention specific dishes, services, or attractions</li>
        <li>Avoid offensive language or personal attacks</li>
        <li>Focus on facts rather than opinions</li>
      </ul>
      
      <h4>Rating Categories</h4>
      <p>We use a comprehensive rating system:</p>
      <ul>
        <li><strong>Overall Rating:</strong> Your general satisfaction (1-5 stars)</li>
        <li><strong>Food Quality:</strong> For restaurants and cafes</li>
        <li><strong>Service:</strong> Staff friendliness and efficiency</li>
        <li><strong>Value:</strong> Price relative to quality</li>
        <li><strong>Atmosphere:</strong> Ambiance and setting</li>
      </ul>
      
      <h4>Benefits of Reviewing</h4>
      <ul>
        <li>Earn points towards exclusive rewards</li>
        <li>Help improve businesses in Kolkata</li>
        <li>Build credibility in the community</li>
        <li>Get featured in our "Top Reviewers" section</li>
        <li>Receive personalized recommendations based on your preferences</li>
      </ul>
    `
  },
  {
    id: 'manage-favorites',
    title: 'Managing your favorites',
    description: 'Save and organize your favorite places',
    category: 'Account Management',
    content: `
      <h3>Organize Your Favorite Places</h3>
      <p>Keep track of places you love and want to visit again:</p>
      
      <h4>Adding Favorites</h4>
      <p>Save places in three simple ways:</p>
      <ul>
        <li>Click the heart icon on any place's page</li>
        <li>Tap "Add to Favorites" from search results</li>
        <li>Use the "Save" button in detailed listings</li>
      </ul>
      
      <h4>Creating Collections</h4>
      <p>Organize your favorites into themed collections:</p>
      <ul>
        <li><strong>Restaurants:</strong> Your favorite dining spots</li>
        <li><strong>Attractions:</strong> Must-visit places</li>
        <li><strong>Hotels:</strong> Preferred accommodations</li>
        <li><strong>Hidden Gems:</strong> Off-the-beaten-path discoveries</li>
        <li><strong>Custom Lists:</strong> Create your own categories</li>
      </ul>
      
      <h4>Managing Your Favorites</h4>
      <p>Access and organize your saved places:</p>
      <ul>
        <li>View all favorites in your profile</li>
        <li>Sort by category, rating, or date added</li>
        <li>Share collections with friends</li>
        <li>Export your lists for offline use</li>
        <li>Set reminders for places you want to visit</li>
      </ul>
      
      <h4>Favorites Features</h4>
      <ul>
        <li>Get notified about deals at favorite places</li>
        <li>Receive recommendations based on your preferences</li>
        <li>Quick access from mobile app</li>
        <li>Sync across all your devices</li>
        <li>Backup your collections to the cloud</li>
      </ul>
    `
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting common issues',
    description: 'Solutions to frequently encountered problems',
    category: 'Support',
    content: `
      <h3>Common Issues & Solutions</h3>
      <p>Find quick solutions to frequently encountered problems:</p>
      
      <h4>Account Issues</h4>
      <ul>
        <li><strong>Forgot Password:</strong> Use "Forgot Password" link and check your email</li>
        <li><strong>Can't Sign In:</strong> Clear browser cache or try incognito mode</li>
        <li><strong>Email Verification:</strong> Check spam folder for verification emails</li>
        <li><strong>Account Locked:</strong> Contact support for account recovery</li>
      </ul>
      
      <h4>Search & Navigation</h4>
      <ul>
        <li><strong>No Search Results:</strong> Try different keywords or broader search terms</li>
        <li><strong>Wrong Location:</strong> Enable location services or enter city manually</li>
        <li><strong>App Crashing:</strong> Update to latest version or restart your device</li>
        <li><strong>Slow Loading:</strong> Check internet connection or clear app cache</li>
      </ul>
      
      <h4>Booking Problems</h4>
      <ul>
        <li><strong>Payment Failed:</strong> Check card details or try different payment method</li>
        <li><strong>Booking Not Confirmed:</strong> Wait a few minutes or contact the business directly</li>
        <li><strong>Can't Cancel:</strong> Review cancellation policy or contact support</li>
        <li><strong>Wrong Dates:</strong> Contact the business immediately for corrections</li>
      </ul>
      
      <h4>Technical Issues</h4>
      <ul>
        <li><strong>Website Not Loading:</strong> Try different browser or clear cache</li>
        <li><strong>Images Not Showing:</strong> Enable images in browser settings</li>
        <li><strong>Mobile App Issues:</strong> Update app or reinstall if problems persist</li>
        <li><strong>Notifications Not Working:</strong> Check notification settings in device and app</li>
      </ul>
      
      <h4>Getting Help</h4>
      <p>If you can't find a solution:</p>
      <ul>
        <li>Check our FAQ section for more answers</li>
        <li>Contact our support team via email or chat</li>
        <li>Visit our community forums for user discussions</li>
        <li>Report bugs through the app's feedback feature</li>
      </ul>
    `
  },
  {
    id: 'privacy-security',
    title: 'Privacy and security',
    description: 'How we protect your data and privacy',
    category: 'Privacy',
    content: `
      <h3>Your Privacy & Security Matters</h3>
      <p>We are committed to protecting your personal information and ensuring a safe experience:</p>
      
      <h4>Data Protection</h4>
      <p>How we safeguard your information:</p>
      <ul>
        <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
        <li><strong>Secure Servers:</strong> Hosted on enterprise-grade secure infrastructure</li>
        <li><strong>Regular Audits:</strong> Independent security audits conducted annually</li>
        <li><strong>Access Controls:</strong> Strict access controls for employee data access</li>
      </ul>
      
      <h4>Information We Collect</h4>
      <p>We only collect information necessary for service:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, email, phone (provided by you)</li>
        <li><strong>Usage Data:</strong> How you interact with our platform</li>
        <li><strong>Location Data:</strong> With your permission for location-based features</li>
        <li><strong>Device Information:</strong> For app performance and security</li>
      </ul>
      
      <h4>Your Privacy Rights</h4>
      <p>You have control over your data:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Correction:</strong> Update or correct your information</li>
        <li><strong>Deletion:</strong> Request deletion of your account and data</li>
        <li><strong>Portability:</strong> Export your data in a usable format</li>
        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
      </ul>
      
      <h4>Security Measures</h4>
      <ul>
        <li>Two-factor authentication for enhanced security</li>
        <li>Regular security updates and patches</li>
        <li>Monitoring for suspicious activities</li>
        <li>Secure payment processing with PCI compliance</li>
        <li>Data backup and disaster recovery systems</li>
      </ul>
      
      <h4>Contact Us</h4>
      <p>For privacy concerns, contact our Data Protection Officer at privacy@destinationkolkata.com</p>
    `
  }
]

export default function HelpCenterPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[0])}>
                <CardHeader>
                  <CardTitle className="text-lg">How to create an account</CardTitle>
                  <CardDescription>Step-by-step guide to setting up your account</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[1])}>
                <CardHeader>
                  <CardTitle className="text-lg">Finding the best restaurants</CardTitle>
                  <CardDescription>Tips for discovering great places to eat</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[2])}>
                <CardHeader>
                  <CardTitle className="text-lg">Booking hotels and accommodations</CardTitle>
                  <CardDescription>How to find and book the perfect stay</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[3])}>
                <CardHeader>
                  <CardTitle className="text-lg">Using the mobile app</CardTitle>
                  <CardDescription>Make the most of our mobile experience</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[4])}>
                <CardHeader>
                  <CardTitle className="text-lg">Writing reviews and ratings</CardTitle>
                  <CardDescription>How your feedback helps the community</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[5])}>
                <CardHeader>
                  <CardTitle className="text-lg">Managing your favorites</CardTitle>
                  <CardDescription>Save and organize your favorite places</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[6])}>
                <CardHeader>
                  <CardTitle className="text-lg">Troubleshooting common issues</CardTitle>
                  <CardDescription>Solutions to frequently encountered problems</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openArticle(articles[7])}>
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
            <Button size="lg" className=" text-white bg-orange-600 hover:bg-orange-700">
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

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] bg-white border-0 shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              {selectedArticle?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            <div
              className="text-gray-700 leading-relaxed"
              style={{
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{
                __html: selectedArticle?.content?.replace(
                  /<h3>/g, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-1">'
                ).replace(
                  /<\/h3>/g, '</h3>'
                ).replace(
                  /<h4>/g, '<h4 class="text-base font-medium text-gray-800 mt-4 mb-2">'
                ).replace(
                  /<\/h4>/g, '</h4>'
                ).replace(
                  /<p>/g, '<p class="mb-3 text-gray-700">'
                ).replace(
                  /<\/p>/g, '</p>'
                ).replace(
                  /<ul>/g, '<ul class="list-disc list-inside mb-3 ml-4 space-y-1">'
                ).replace(
                  /<\/ul>/g, '</ul>'
                ).replace(
                  /<ol>/g, '<ol class="list-decimal list-inside mb-3 ml-4 space-y-1">'
                ).replace(
                  /<\/ol>/g, '</ol>'
                ).replace(
                  /<li>/g, '<li class="text-gray-700">'
                ).replace(
                  /<\/li>/g, '</li>'
                ).replace(
                  /<strong>/g, '<strong class="font-semibold text-gray-900">'
                ).replace(
                  /<\/strong>/g, '</strong>'
                ) || ''
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
