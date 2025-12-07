"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Star, 
  Check, 
  X,
  ArrowLeft,
  CreditCard,
  Zap,
  Users,
  BarChart3,
  Headphones,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const membershipPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Users,
    features: [
      { name: 'Up to 3 listings', included: true },
      { name: 'Basic listing visibility', included: true },
      { name: 'Standard support', included: true },
      { name: 'Analytics dashboard', included: false },
      { name: 'Priority approval', included: false },
      { name: 'Featured listings', included: false },
      { name: 'Custom branding', included: false },
      { name: 'API access', included: false }
    ],
    popular: false,
    current: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹999',
    period: 'month',
    description: 'Best for growing businesses',
    icon: Star,
    features: [
      { name: 'Up to 15 listings', included: true },
      { name: 'Enhanced visibility', included: true },
      { name: 'Priority support', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Priority approval', included: true },
      { name: 'Featured listings', included: true },
      { name: 'Custom branding', included: false },
      { name: 'API access', included: false }
    ],
    popular: true,
    current: false
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹2999',
    period: 'month',
    description: 'For established enterprises',
    icon: Crown,
    features: [
      { name: 'Unlimited listings', included: true },
      { name: 'Maximum visibility', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Instant approval', included: true },
      { name: 'Premium featured listings', included: true },
      { name: 'Custom branding', included: true },
      { name: 'API access', included: true }
    ],
    popular: false,
    current: false
  }
]

const additionalBenefits = [
  {
    icon: Zap,
    title: 'Faster Approval',
    description: 'Premium and Business members get priority review and faster approval times'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed insights into views, clicks, and customer engagement'
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Get faster responses and dedicated support channels'
  },
  {
    icon: Shield,
    title: 'Verified Badge',
    description: 'Build trust with customers through verified business badges'
  }
]

export default function MembershipPage() {
  const router = useRouter()

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return

    // Redirect to checkout page with plan parameter
    router.push(`/customer/checkout?plan=${planId}`)
  }

  const getButtonClass = (plan: typeof membershipPlans[0]) => {
    if (plan.popular) return 'bg-orange-600 hover:bg-orange-700 text-white'
    if (plan.current) return 'bg-green-600 hover:bg-green-700 text-white'
    return 'bg-gray-600 hover:bg-gray-700 text-white'
  }

  const getButtonText = (plan: typeof membershipPlans[0]) => {
    if (plan.current) return 'Current Plan'
    if (plan.id === 'free') return 'Free Forever'
    return (
      <>
        <CreditCard className="w-4 h-4 mr-2" />
        Upgrade Now
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Membership Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upgrade your account to unlock powerful features and grow your business with Destination Kolkata
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                <Card className={`h-full ${plan.popular ? 'border-orange-500 shadow-xl' : ''} ${plan.current ? 'bg-green-50 border-green-300' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {plan.current && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.popular ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`w-8 h-8 ${plan.popular ? 'text-orange-600' : 'text-gray-600'}`} />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period !== 'forever' && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${getButtonClass(plan)}`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={plan.current}
                    >
                      {getButtonText(plan)}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Upgrade Your Membership?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalBenefits.map((benefit) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + additionalBenefits.indexOf(benefit) * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-orange-100">
                      <IconComponent className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, UPI, and net banking through secure payment gateways.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No, there are no hidden fees or setup charges. You only pay the monthly subscription fee.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
