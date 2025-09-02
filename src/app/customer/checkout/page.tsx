"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CheckoutStep {
  id: string
  title: string
  description: string
}

const checkoutSteps: CheckoutStep[] = [
  { id: 'plan', title: 'Select Plan', description: 'Choose your membership plan' },
  { id: 'billing', title: 'Billing Info', description: 'Enter your billing details' },
  { id: 'payment', title: 'Payment', description: 'Choose payment method' },
  { id: 'confirm', title: 'Confirm', description: 'Review and confirm order' }
]

interface MembershipPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'month',
    description: 'Best for growing businesses',
    features: [
      'Up to 15 listings',
      'Enhanced visibility',
      'Priority support',
      'Analytics dashboard',
      'Priority approval',
      'Featured listings'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 2999,
    period: 'month',
    description: 'For established enterprises',
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
]

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber: string
}

interface PaymentInfo {
  method: 'card' | 'upi' | 'netbanking' | 'wallet'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardName?: string
  upiId?: string
  bankCode?: string
  walletType?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: ''
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    if (planId) {
      const plan = membershipPlans.find(p => p.id === planId)
      if (plan) {
        setSelectedPlan(plan)
      }
    }
  }, [planId])

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setCurrentStep(1)
  }

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || !billingInfo.phone) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setCurrentStep(2)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Please accept the terms and conditions')
      return
    }
    setError('')
    setCurrentStep(3)
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/customer/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan?.id,
          billingInfo,
          paymentInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url

    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateBillingInfo = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }))
  }

  const updatePaymentInfo = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    if (!selectedPlan) return 0
    const subtotal = selectedPlan.price
    const gst = subtotal * 0.18 // 18% GST
    return subtotal + gst
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {checkoutSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index <= currentStep ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < checkoutSteps.length - 1 && (
              <div className={`w-12 h-1 ${
                index < currentStep ? 'bg-orange-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        {checkoutSteps.map((step, index) => (
          <div key={step.id} className="text-center mx-4">
            <p className={`text-sm font-medium ${
              index <= currentStep ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {step.title}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the membership plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {membershipPlans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className={`cursor-pointer transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-orange-500 shadow-lg scale-105'
                : 'hover:shadow-md'
            }`} onClick={() => handlePlanSelect(plan)}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{plan.price}
                  <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlanSelect(plan)
                  }}
                >
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderBillingForm = () => (
    <form onSubmit={handleBillingSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Information</h2>
        <p className="text-gray-600">Please provide your billing details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={billingInfo.firstName}
            onChange={(e) => updateBillingInfo('firstName', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={billingInfo.lastName}
            onChange={(e) => updateBillingInfo('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={billingInfo.email}
            onChange={(e) => updateBillingInfo('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={billingInfo.phone}
            onChange={(e) => updateBillingInfo('phone', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company Name</Label>
        <Input
          id="company"
          value={billingInfo.company}
          onChange={(e) => updateBillingInfo('company', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={billingInfo.address}
          onChange={(e) => updateBillingInfo('address', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={billingInfo.city}
            onChange={(e) => updateBillingInfo('city', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={billingInfo.state}
            onChange={(e) => updateBillingInfo('state', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={billingInfo.pincode}
            onChange={(e) => updateBillingInfo('pincode', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstNumber">GST Number (Optional)</Label>
        <Input
          id="gstNumber"
          value={billingInfo.gstNumber}
          onChange={(e) => updateBillingInfo('gstNumber', e.target.value)}
          placeholder="22AAAAA0000A1Z5"
        />
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(0)}
        >
          Back
        </Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
          Continue to Payment
        </Button>
      </div>
    </form>
  )

  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600">Choose how you&apos;d like to pay</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="card"
            name="paymentMethod"
            value="card"
            checked={paymentInfo.method === 'card'}
            onChange={(e) => updatePaymentInfo('method', e.target.value as PaymentInfo['method'])}
            className="text-orange-600 focus:ring-orange-500"
          />
          <Label htmlFor="card" className="flex items-center cursor-pointer">
            <CreditCard className="w-4 h-4 mr-2" />
            Credit/Debit Card
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="upi"
            name="paymentMethod"
            value="upi"
            checked={paymentInfo.method === 'upi'}
            onChange={(e) => updatePaymentInfo('method', e.target.value as PaymentInfo['method'])}
            className="text-orange-600 focus:ring-orange-500"
          />
          <Label htmlFor="upi" className="flex items-center cursor-pointer">
            <IndianRupee className="w-4 h-4 mr-2" />
            UPI
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="netbanking"
            name="paymentMethod"
            value="netbanking"
            checked={paymentInfo.method === 'netbanking'}
            onChange={(e) => updatePaymentInfo('method', e.target.value as PaymentInfo['method'])}
            className="text-orange-600 focus:ring-orange-500"
          />
          <Label htmlFor="netbanking" className="flex items-center cursor-pointer">
            <Building className="w-4 h-4 mr-2" />
            Net Banking
          </Label>
        </div>
      </div>

      {paymentInfo.method === 'card' && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentInfo.cardNumber || ''}
              onChange={(e) => updatePaymentInfo('cardNumber', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={paymentInfo.expiryDate || ''}
                onChange={(e) => updatePaymentInfo('expiryDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={paymentInfo.cvv || ''}
                onChange={(e) => updatePaymentInfo('cvv', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={paymentInfo.cardName || ''}
              onChange={(e) => updatePaymentInfo('cardName', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentInfo.method === 'upi' && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={paymentInfo.upiId || ''}
              onChange={(e) => updatePaymentInfo('upiId', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
        />
        <Label htmlFor="terms" className="text-sm">
          I agree to the{' '}
          <a href="/terms" className="text-orange-600 hover:underline">Terms and Conditions</a>{' '}
          and{' '}
          <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>
        </Label>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
          Review Order
        </Button>
      </div>
    </form>
  )

  const renderOrderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h2>
        <p className="text-gray-600">Please review your order details before confirming</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{selectedPlan?.name} Plan</span>
              <span>₹{selectedPlan?.price}/{selectedPlan?.period}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{(selectedPlan?.price || 0) * 0.18}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Billing & Payment Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{billingInfo.firstName} {billingInfo.lastName}</p>
              <p>{billingInfo.email}</p>
              <p>{billingInfo.phone}</p>
              <p>{billingInfo.address}</p>
              <p>{billingInfo.city}, {billingInfo.state} {billingInfo.pincode}</p>
              {billingInfo.company && <p>{billingInfo.company}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="capitalize">{paymentInfo.method}</p>
              {paymentInfo.method === 'card' && paymentInfo.cardNumber && (
                <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
              )}
              {paymentInfo.method === 'upi' && paymentInfo.upiId && (
                <p>{paymentInfo.upiId}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
        >
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Complete Purchase
            </>
          )}
        </Button>
      </div>
    </div>
  )

  if (!planId && currentStep === 0) {
    return renderPlanSelection()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 0 && renderPlanSelection()}
        {currentStep === 1 && renderBillingForm()}
        {currentStep === 2 && renderPaymentForm()}
        {currentStep === 3 && renderOrderConfirmation()}
      </div>
    </div>
  )
}
