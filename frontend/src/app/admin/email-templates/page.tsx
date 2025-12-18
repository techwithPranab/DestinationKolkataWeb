"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor'

interface EmailTemplate {
  _id: string
  workflowType: string
  name: string
  subject: string
  isActive: boolean
  version: number
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  updatedBy: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

const workflowTypes = [
  { value: 'listing_invitation', label: 'Listing Invitation' },
  { value: 'registration_welcome', label: 'Registration Welcome' },
  { value: 'registration_admin_notification', label: 'Registration Admin Notification' },
  { value: 'submission_admin_notification', label: 'Submission Admin Notification' },
  { value: 'submission_approval', label: 'Submission Approval' },
  { value: 'submission_rejection', label: 'Submission Rejection' },
  { value: 'resource_assignment', label: 'Resource Assignment' },
  { value: 'verification_test', label: 'Verification Test' }
]

export default function EmailTemplatesAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  const searchParams = useSearchParams()
  const router = useRouter()

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWorkflow, setFilterWorkflow] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalTemplates, setTotalTemplates] = useState(0)

  // Form states
  const [formData, setFormData] = useState({
    workflowType: '',
    name: '',
    subject: '',
    htmlContent: '',
    plainTextContent: '',
    variables: [] as string[],
    isActive: true
  })

  // Handle query parameters for create workflow
  useEffect(() => {
    const create = searchParams.get('create')
    const workflow = searchParams.get('workflow')

    if (create === 'true' && workflow) {
      setFormData(prev => ({ ...prev, workflowType: workflow }))
      setIsCreateModalOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    fetchTemplates()
  }, [currentPage, searchTerm, filterWorkflow, filterStatus])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        workflowType: filterWorkflow || 'all',
        status: filterStatus || 'all'
      })

      const response = await fetchAuthenticatedAPI(`/api/admin/email-templates?${params}`)
      const data = await response.json()
      setTemplates(data.data || [])
      setTotalTemplates(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching email templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      workflowType: '',
      name: '',
      subject: '',
      htmlContent: '',
      plainTextContent: '',
      variables: [],
      isActive: true
    })
    setEditingTemplate(null)
  }

  const handleEdit = async (template: EmailTemplate) => {
    try {
      // Fetch the full template content
      const response = await fetchAuthenticatedAPI(`/api/admin/email-templates/${template._id}`)
      const fullTemplate = await response.json()

      setEditingTemplate(fullTemplate)
      setFormData({
        workflowType: fullTemplate.workflowType,
        name: fullTemplate.name,
        subject: fullTemplate.subject,
        htmlContent: fullTemplate.htmlContent || '',
        plainTextContent: fullTemplate.plainTextContent || '',
        variables: fullTemplate.variables || [],
        isActive: fullTemplate.isActive
      })
      setIsCreateModalOpen(true)
    } catch (error) {
      console.error('Error fetching template details:', error)
      alert('Failed to load template for editing')
    }
  }

  const handleView = (template: EmailTemplate) => {
    setViewingTemplate(template)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to archive this template?')) return

    try {
      const response = await fetchAuthenticatedAPI(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTemplates()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to archive template')
      }
    } catch (error) {
      console.error('Error archiving template:', error)
      alert('Failed to archive template')
    }
  }

  const getWorkflowLabel = (workflowType: string) => {
    const workflow = workflowTypes.find(w => w.value === workflowType)
    return workflow ? workflow.label : workflowType
  }

  const totalPages = Math.ceil(totalTemplates / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Manage email templates for different workflows</p>
        </div>
        <Button
          onClick={() => router.push('/admin/email-templates/create')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterWorkflow} onValueChange={setFilterWorkflow}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Workflows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                {workflowTypes.map((workflow) => (
                  <SelectItem key={workflow.value} value={workflow.value}>
                    {workflow.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Templates ({totalTemplates})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first email template.</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Workflow</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Version</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Modified</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {getWorkflowLabel(template.workflowType)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate" title={template.subject}>
                            {template.subject}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">v{template.version}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(template)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(template)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(template._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTemplates)} of {totalTemplates} templates
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update the email template using the editor below.'
                : 'Create a new email template for a specific workflow.'
              }
            </DialogDescription>
          </DialogHeader>

          {!editingTemplate && !formData.workflowType ? (
            // Workflow selection step for new templates
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Workflow Type
                </label>
                <Select
                  value={formData.workflowType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, workflowType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the workflow this template will be used for" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTypes.map((workflow) => (
                      <SelectItem key={workflow.value} value={workflow.value}>
                        {workflow.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Template editor
            <EmailTemplateEditor
              initialSubject={formData.subject}
              initialHtmlContent={formData.htmlContent}
              initialPlainTextContent={formData.plainTextContent}
              workflowType={formData.workflowType}
              onSave={async (templateData) => {
                try {
                  const url = editingTemplate
                    ? `/api/admin/email-templates/${editingTemplate._id}`
                    : `/api/admin/email-templates`

                  const method = editingTemplate ? 'PUT' : 'POST'

                  const payload = {
                    workflowType: formData.workflowType,
                    name: formData.name,
                    subject: templateData.subject,
                    htmlContent: templateData.htmlContent,
                    plainTextContent: templateData.plainTextContent,
                    isActive: formData.isActive
                  }

                  const response = await fetchAuthenticatedAPI(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                  })

                  if (response.ok) {
                    await fetchTemplates()
                    resetForm()
                    setIsCreateModalOpen(false)
                  } else {
                    const error = await response.json()
                    alert(error.message || 'Failed to save template')
                  }
                } catch (error) {
                  console.error('Error saving template:', error)
                  alert('Failed to save template')
                }
              }}
              onCancel={() => {
                setIsCreateModalOpen(false)
                resetForm()
              }}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>View Email Template</DialogTitle>
            <DialogDescription>
              Template details and content preview
            </DialogDescription>
          </DialogHeader>
          {viewingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Workflow Type</label>
                  <p className="text-sm text-gray-600">{getWorkflowLabel(viewingTemplate.workflowType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <Badge variant={viewingTemplate.isActive ? "default" : "secondary"}>
                    {viewingTemplate.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <p className="text-sm text-gray-600">v{viewingTemplate.version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Modified</label>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingTemplate.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingTemplate.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Preview</label>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: viewingTemplate.subject }} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
