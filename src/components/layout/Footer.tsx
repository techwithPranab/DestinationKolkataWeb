"use client"

import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">Destination Kolkata</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your ultimate guide to exploring the City of Joy. Discover the best hotels, 
              restaurants, attractions, and cultural experiences Kolkata has to offer.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Businesses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-orange-500 transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Advertising
                </Link>
              </li>
              <li>
                <Link href="/partnerships" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/business-resources" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Business Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">+91 33 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">info@destinationkolkata.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-orange-500 mt-1" />
                <span className="text-gray-300">
                  Tourism Office, Kolkata<br />
                  West Bengal, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="shadow-sm mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2024 Destination Kolkata. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-orange-500 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/sources" className="hover:text-orange-500 transition-colors">
              Data Sources
            </Link>
          </div>
        </div>

        {/* Attribution */}
        <div className="shadow-sm bg-gray-50 mt-6 pt-4 text-xs text-gray-500 text-center hidden">
          <p>
            Map data © <a href="https://openstreetmap.org" className="hover:text-orange-500">OpenStreetMap</a> contributors. 
            Restaurant data sourced from public datasets. 
            Event information from <a href="https://eventbrite.com" className="hover:text-orange-500">Eventbrite</a> and local sources.
          </p>
        </div>
      </div>
    </footer>
  )
}
