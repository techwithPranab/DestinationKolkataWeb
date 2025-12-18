"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Settings,
  TestTube
} from 'lucide-react'

interface WorkflowType {
  value: string
  label: string
  description: string
  icon: React.ReactNode
  variables: string[]
  example: string
}

const workflowTypes: WorkflowType[] = [
  {
    value: 'listing_invitation',
    label: 'Listing Invitation',
    description: 'Invite business owners to create listings on the platform',
    icon: <Mail className="w-8 h-8 text-blue-600" />,
    variables: ['businessName', 'businessEmail', 'listingType', 'registrationLink', 'message'],
    example: 'Welcome to Destination Kolkata! Create your business listing today.'
  },
  {
    value: 'registration_welcome',
    label: 'Registration Welcome',
    description: 'Welcome new users after successful registration',
    icon: <Users className="w-8 h-8 text-green-600" />,
    variables: ['userName', 'loginLink', 'verificationLink'],
    example: 'Welcome to Destination Kolkata! Your account has been created successfully.'
  },
  {
    value: 'registration_admin_notification',
    label: 'Registration Admin Notification',
    description: 'Notify admins when new users register',
    icon: <Settings className="w-8 h-8 text-purple-600" />,
    variables: ['userName', 'userEmail', 'registrationDate', 'adminDashboardLink'],
    example: 'New user registration: John Doe has joined the platform.'
  },
  {
    value: 'submission_admin_notification',
    label: 'Submission Admin Notification',
    description: 'Notify admins of new listing submissions',
    icon: <FileText className="w-8 h-8 text-orange-600" />,
    variables: ['submissionTitle', 'submissionType', 'submitterName', 'submitterEmail', 'submissionDate', 'adminReviewLink'],
    example: 'New restaurant submission: ABC Restaurant requires review.'
  },
  {
    value: 'submission_approval',
    label: 'Submission Approval',
    description: 'Notify users when their submissions are approved',
    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
    variables: ['userName', 'submissionTitle', 'approvalMessage', 'viewListingLink'],
    example: 'Congratulations! Your restaurant listing has been approved.'
  },
  {
    value: 'submission_rejection',
    label: 'Submission Rejection',
    description: 'Notify users when their submissions are rejected',
    icon: <XCircle className="w-8 h-8 text-red-600" />,
    variables: ['userName', 'submissionTitle', 'rejectionReason', 'resubmitLink'],
    example: 'Your submission requires additional information before approval.'
  },
  {
    value: 'resource_assignment',
    label: 'Resource Assignment',
    description: 'Notify users of resource assignments and access',
    icon: <Settings className="w-8 h-8 text-indigo-600" />,
    variables: ['userName', 'resourceType', 'resourceName', 'resourceDetails', 'completionLink'],
    example: 'You have been assigned access to Premium Restaurant Account.'
  },
  {
    value: 'verification_test',
    label: 'Verification Test',
    description: 'Test email verification and SMTP configuration',
    icon: <TestTube className="w-8 h-8 text-gray-600" />,
    variables: ['testTime', 'configName'],
    example: 'Email verification test completed successfully.'
  }
]

export default function CreateEmailTemplatePage() {
  const router = useRouter()
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null)

  const handleWorkflowSelect = (workflow: WorkflowType) => {
    setSelectedWorkflow(workflow)
  }

  const handleContinue = () => {
    if (selectedWorkflow) {
      // Navigate to the main templates page with the selected workflow
      // We'll pass the workflow type as a query parameter
      router.push(`/admin/email-templates?create=true&workflow=${selectedWorkflow.value}`)
    }
  }

  const handleBack = () => {
    router.push('/admin/email-templates')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Email Template</h1>
          <p className="text-gray-600 mt-1">Choose a workflow type to create a customized email template</p>
        </div>
      </div>

      {/* Workflow Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflowTypes.map((workflow) => (
          <Card
            key={workflow.value}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedWorkflow?.value === workflow.value
                ? 'ring-2 ring-orange-500 bg-orange-50'
                : 'hover:border-gray-300'
            }`}
            onClick={() => handleWorkflowSelect(workflow)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {workflow.icon}
                  <CardTitle className="text-lg">{workflow.label}</CardTitle>
                </div>
                {selectedWorkflow?.value === workflow.value && (
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{workflow.description}</p>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {workflow.variables.slice(0, 4).map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                  {workflow.variables.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{workflow.variables.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-gray-700 mb-1">Example:</p>
                <p className="text-xs text-gray-600 italic">&ldquo;{workflow.example}&rdquo;</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Workflow Details */}
      {selectedWorkflow && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <CheckCircle className="w-5 h-5" />
              Selected: {selectedWorkflow.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-700 mb-2">Description:</p>
              <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">All Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {selectedWorkflow.variables.map((variable) => (
                  <Badge key={variable} variant="outline" className="bg-white">
                    <code className="text-xs">{`{{${variable}}}`}</code>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleContinue} className="bg-orange-600 hover:bg-orange-700">
                Continue to Template Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How to Create Templates</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a workflow type that matches your email communication needs</li>
                <li>• Use variables like {`{{userName}}`} to personalize your emails</li>
                <li>• HTML formatting is supported for rich email content</li>
                <li>• Test your templates before activating them</li>
                <li>• Templates can be edited and versioned after creation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
