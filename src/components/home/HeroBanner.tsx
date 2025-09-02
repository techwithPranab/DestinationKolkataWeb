"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Users, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HeroBanner() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          Discover the City of{' '}
          <span className="text-orange-400">Joy</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 text-gray-200"
        >
          Experience the rich culture, delicious food, and warm hospitality of Kolkata
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
            <MapPin className="w-5 h-5 mr-2" />
            Explore Places
          </Button>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
            <Calendar className="w-5 h-5 mr-2" />
            Plan Your Trip
          </Button>
        </motion.div>

        {/* Quick Search */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
                  <select className="w-full p-3 rounded-md text-gray-900 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200">
                    <option>Hotels</option>
                    <option>Restaurants</option>
                    <option>Attractions</option>
                    <option>Events</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search area..."
                      className="w-full pl-10 pr-3 py-3 rounded-md text-gray-900 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-3 rounded-md text-gray-900 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-8 text-white"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">500+</div>
          <div className="text-sm text-gray-200">Places to Stay</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">1000+</div>
          <div className="text-sm text-gray-200">Restaurants</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">100+</div>
          <div className="text-sm text-gray-200">Attractions</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">50+</div>
          <div className="text-sm text-gray-200">Events/Month</div>
        </div>
      </motion.div>
    </section>
  )
}
