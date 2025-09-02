"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  CreditCard,
  ArrowRight,
  Home,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderDetails {
  sessionId: string
  planId: string
  amount: number
  createdAt: string
  customerEmail: string
}

const membershipDetails = {
  premium: {
    name: 'Premium',
    price: 999,
    features: [
      'Up to 15 listings',
      'Enhanced visibility',
      'Priority support',
      'Analytics dashboard',
      'Priority approval',
      'Featured listings'
    ]
  },
  business: {
    name: 'Business',
    price: 2999,
    features: [
      'Unlimited listings',
      'Maximum visibility',
      'Dedicated support',
      'Advanced analytics',
      'Instant approval',
      'Premium featured listings',
      'Custom branding',
      'API access'
    ]
  }
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      router.push('/customer/membership')
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/customer/membership/verify?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify payment')
        }

        setOrderDetails(data)
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Failed to verify payment')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Unable to verify your payment. Please contact support.'}
          </p>
          <Button
            onClick={() => router.push('/customer/membership')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Back to Membership
          </Button>
        </div>
      </div>
    )
  }

  const plan = orderDetails.planId ? membershipDetails[orderDetails.planId as keyof typeof membershipDetails] : null

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleDownloadInvoice = () => {
    // In a real app, this would download the invoice
    alert('Invoice download functionality would be implemented here')
  }

  const handleGoToDashboard = () => {
    router.push('/customer/dashboard')
  }

  const handleCreateListing = () => {
    router.push('/customer/create/hotel')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to {plan.name} membership! Your account has been upgraded and you now have access to all premium features.
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Membership Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{orderDetails.amount}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{orderDetails.sessionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What&apos;s Included</h3>
                  <ul className="space-y-1 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create Your First Listing</h3>
                  <p className="text-sm text-gray-600">
                    Start showcasing your business with a premium listing
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Explore Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your listing performance and customer engagement
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Priority Support</h3>
                  <p className="text-sm text-gray-600">
                    Contact our support team for any assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleCreateListing}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Create Your First Listing
          </Button>

          <Button
            onClick={handleGoToDashboard}
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>

          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </motion.div>

        {/* Email Confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Mail className="w-4 h-4 mr-2" />
            A confirmation email has been sent to your registered email address
          </div>
        </motion.div>

        {/* Support Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our premium support team is here to help you make the most of your membership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
