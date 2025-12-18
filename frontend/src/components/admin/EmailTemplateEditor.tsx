"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Eye,
  Code,
  Plus,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw
} from 'lucide-react'

interface EmailTemplateEditorProps {
  initialSubject?: string
  initialHtmlContent?: string
  initialPlainTextContent?: string
  workflowType?: string
  onSave: (data: {
    subject: string
    htmlContent: string
    plainTextContent: string
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

interface TemplateVariable {
  name: string
  description: string
  example: string
}

// Template variables for different workflow types
const getWorkflowVariables = (workflowType?: string): TemplateVariable[] => {
  const baseVariables: TemplateVariable[] = [
    { name: 'userName', description: 'User\'s full name', example: 'John Doe' },
    { name: 'userEmail', description: 'User\'s email address', example: 'john@example.com' },
    { name: 'currentDate', description: 'Current date', example: '2025-12-16' },
    { name: 'siteName', description: 'Website name', example: 'Destination Kolkata' },
    { name: 'siteUrl', description: 'Website URL', example: 'https://destinationkolkata.com' }
  ]

  const workflowSpecificVariables: Record<string, TemplateVariable[]> = {
    listing_invitation: [
      { name: 'businessName', description: 'Business/owner name', example: 'ABC Restaurant' },
      { name: 'businessEmail', description: 'Business contact email', example: 'contact@abc.com' },
      { name: 'listingType', description: 'Type of listing', example: 'restaurant' },
      { name: 'listingName', description: 'Name of the listing', example: 'ABC Restaurant' },
      { name: 'registrationLink', description: 'Registration/signup link', example: 'https://...' },
      { name: 'message', description: 'Custom message from admin', example: 'Welcome to our platform!' }
    ],
    registration_welcome: [
      { name: 'loginLink', description: 'Login page URL', example: 'https://destinationkolkata.com/auth/login' },
      { name: 'verificationLink', description: 'Email verification link', example: 'https://...' }
    ],
    registration_admin_notification: [
      { name: 'registrationDate', description: 'When user registered', example: '2025-12-16' },
      { name: 'adminDashboardLink', description: 'Admin dashboard URL', example: 'https://...' }
    ],
    submission_admin_notification: [
      { name: 'submissionTitle', description: 'Title of the submission', example: 'New Restaurant Listing' },
      { name: 'submissionType', description: 'Type of submission', example: 'restaurant' },
      { name: 'submissionDetails', description: 'Submission description', example: 'A great restaurant...' },
      { name: 'submitterName', description: 'Name of submitter', example: 'John Doe' },
      { name: 'submitterEmail', description: 'Email of submitter', example: 'john@example.com' },
      { name: 'submissionDate', description: 'Date of submission', example: '2025-12-16' },
      { name: 'adminReviewLink', description: 'Admin review URL', example: 'https://...' }
    ],
    submission_approval: [
      { name: 'submissionTitle', description: 'Title of the submission', example: 'New Restaurant Listing' },
      { name: 'approvalMessage', description: 'Approval message', example: 'Congratulations!' },
      { name: 'viewListingLink', description: 'View listing URL', example: 'https://...' }
    ],
    submission_rejection: [
      { name: 'submissionTitle', description: 'Title of the submission', example: 'New Restaurant Listing' },
      { name: 'rejectionReason', description: 'Reason for rejection', example: 'Missing required information' },
      { name: 'resubmitLink', description: 'Resubmit URL', example: 'https://...' }
    ],
    resource_assignment: [
      { name: 'resourceType', description: 'Type of resource', example: 'Business Account' },
      { name: 'resourceName', description: 'Name of resource', example: 'Premium Restaurant Account' },
      { name: 'resourceDetails', description: 'Resource details', example: 'Full access to...' },
      { name: 'completionLink', description: 'Completion/action URL', example: 'https://...' }
    ],
    verification_test: [
      { name: 'testTime', description: 'Test timestamp', example: '2025-12-16T10:30:00Z' },
      { name: 'configName', description: 'SMTP configuration name', example: 'Gmail SMTP' }
    ]
  }

  const specificVars = workflowSpecificVariables[workflowType || ''] || []
  return [...baseVariables, ...specificVars]
}

export function EmailTemplateEditor({
  initialSubject = '',
  initialHtmlContent = '',
  initialPlainTextContent = '',
  workflowType,
  onSave,
  onCancel,
  isLoading = false
}: EmailTemplateEditorProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent)
  const [plainTextContent, setPlainTextContent] = useState(initialPlainTextContent)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const variables = getWorkflowVariables(workflowType)

  // Update state when props change (for editing existing templates)
  useEffect(() => {
    setSubject(initialSubject)
    setHtmlContent(initialHtmlContent)
    setPlainTextContent(initialPlainTextContent)
  }, [initialSubject, initialHtmlContent, initialPlainTextContent])

  const insertVariable = (variableName: string) => {
    const variableTag = `{{${variableName}}}`
    const textarea = document.getElementById('html-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = htmlContent.substring(0, start) + variableTag + htmlContent.substring(end)
      setHtmlContent(newContent)

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variableTag.length, start + variableTag.length)
      }, 0)
    }
  }

  const validateTemplate = (): string[] => {
    const errors: string[] = []

    if (!subject.trim()) {
      errors.push('Subject line is required')
    }

    if (!htmlContent.trim()) {
      errors.push('HTML content is required')
    }

    // Check for unclosed HTML tags
    const openTags = htmlContent.match(/<[^\/][^>]*>/g) || []
    const closeTags = htmlContent.match(/<\/[^>]+>/g) || []
    if (openTags.length !== closeTags.length) {
      errors.push('HTML content has unmatched tags')
    }

    // Check for required variables based on workflow type
    const requiredVars: Record<string, string[]> = {
      listing_invitation: ['businessName', 'registrationLink'],
      registration_welcome: ['userName', 'loginLink'],
      submission_approval: ['userName', 'submissionTitle'],
      submission_rejection: ['userName', 'submissionTitle']
    }

    const required = requiredVars[workflowType || '']
    if (required) {
      for (const varName of required) {
        if (!htmlContent.includes(`{{${varName}}}`)) {
          errors.push(`Required variable {{${varName}}} is missing`)
        }
      }
    }

    return errors
  }

  const handleSave = () => {
    const errors = validateTemplate()
    setValidationErrors(errors)

    if (errors.length === 0) {
      onSave({
        subject: subject.trim(),
        htmlContent: htmlContent.trim(),
        plainTextContent: plainTextContent.trim()
      })
    }
  }

  const generatePreview = () => {
    let preview = htmlContent

    // Replace variables with sample data for preview
    variables.forEach(variable => {
      const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g')
      preview = preview.replace(regex, `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${variable.example}</span>`)
    })

    return preview
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Template Editor</h2>
          <p className="text-gray-600 mt-1">
            {workflowType ? `Editing template for ${workflowType.replace(/_/g, ' ')}` : 'Create or edit email template'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Available Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {variables.map((variable) => (
              <div
                key={variable.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => insertVariable(variable.name)}
              >
                <div>
                  <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {`{{${variable.name}}}`}
                  </code>
                  <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                  <p className="text-xs text-gray-500">{variable.example}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Click on any variable to insert it into your template content.
          </p>
        </CardContent>
      </Card>

      {/* Subject Line */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Line</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject line"
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content</span>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="edit" className="space-y-4">
              <div>
                <Label htmlFor="html-content">HTML Content</Label>
                <Textarea
                  id="html-content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Enter HTML email content..."
                  rows={20}
                  className="font-mono text-sm mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Use HTML tags for formatting. Variables like {`{{userName}}`} will be replaced with actual values.
                </p>
              </div>

              <div>
                <Label htmlFor="plain-text-content">Plain Text Content (Optional)</Label>
                <Textarea
                  id="plain-text-content"
                  value={plainTextContent}
                  onChange={(e) => setPlainTextContent(e.target.value)}
                  placeholder="Enter plain text version..."
                  rows={10}
                  className="font-mono text-sm mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Plain text version for email clients that don&apos;t support HTML.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Subject Preview</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(subject)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Subject
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <strong>{subject || 'No subject'}</strong>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>HTML Preview</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatePreview())}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy HTML
                  </Button>
                </div>
                <div
                  className="p-4 border rounded-lg bg-white max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Variables are highlighted in yellow. In actual emails, they will be replaced with real data.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
