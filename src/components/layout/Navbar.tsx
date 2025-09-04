"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { title: 'Places to Stay', href: '/places' },
  { title: 'Restaurants', href: '/restaurants' },
  { title: 'Visiting Places', href: '/visiting' },
  { title: 'Sports', href: '/sports' },
  { title: 'Travel', href: '/travel' },
  { title: 'Events', href: '/events' },
  { title: 'Promotions', href: '/promotions' }
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg shadow-orange-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/Logo2.png" alt="Destination Kolkata Logo" className="h-10 md:h-14 lg:h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {/* <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button> */}

            {/* User */}
            {/* <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button> */}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
