"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'

interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  businessName?: string
  businessType?: string
  city: string
  termsAccepted: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    city: '',
    termsAccepted: false
  })

  const businessTypes = [
    'hotel',
    'restaurant', 
    'attraction',
    'sports',
    'event_organizer',
    'other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required')
      return false
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required')
      return false
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      setError('Valid phone number is required')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Signup failed')
      }
      
      // Redirect to login with success message
      router.push('/auth/login?message=Account created successfully. Please login.')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await signIn('google', { 
        callbackUrl: '/auth/login?message=Account created successfully with Google. Please login.',
        redirect: true 
      })
      if (result?.error) {
        setError('Failed to sign up with Google')
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setError('Failed to sign up with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await signIn('facebook', { 
        callbackUrl: '/auth/login?message=Account created successfully with Facebook. Please login.',
        redirect: true 
      })
      if (result?.error) {
        setError('Failed to sign up with Facebook')
      }
    } catch (err) {
      console.error('Facebook signup error:', err)
      setError('Failed to sign up with Facebook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Destination Kolkata</h1>
          <p className="text-gray-600 text-lg">Create your account and discover the City of Joy</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Single Column: All Information */}
          <Card className="shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Create Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Message - Display at top if any */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                {/* <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Personal Info</h3> */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-9 text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                        placeholder="Kolkata"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* <h3 className="text-sm font-medium text-gray-700">Business Info <span className="text-xs text-gray-500">(Optional)</span></h3> */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm">Business Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                        placeholder="Your Business Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-sm">Business Type</Label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="">Select Business Type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-orange-600" />
                  Security
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-8 pr-8 h-9 text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-8 pr-8 h-9 text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <input
                      id="termsAccepted"
                      name="termsAccepted"
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      required
                    />
                    <Label htmlFor="termsAccepted" className="text-xs leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-orange-600 hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-orange-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white h-8 text-sm font-medium"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* OAuth Sign Up Options */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm font-medium"
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm font-medium"
                      onClick={handleFacebookSignUp}
                      disabled={loading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
