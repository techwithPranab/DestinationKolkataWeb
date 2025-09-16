"use client"

import React, { useState, useEffect } from 'react'
import { Search, HelpCircle, MessageSquare, Phone, Mail, ChevronRight, ChevronDown, Plus, Send, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useApi } from '@/lib/api-client'

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Status = 'open' | 'in-progress' | 'resolved' | 'closed'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  priority: Priority
  status: Status
  createdAt: string
  updatedAt: string
  responses?: Array<{
    id: string
    message: string
    sender: string
    timestamp: string
    isStaff: boolean
  }>
}

export default function HelpPage() {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [ticketResponse, setTicketResponse] = useState('')

  // Sample FAQ data
  const [faqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage. Fill in your details including name, email, and password. You will receive a verification email to activate your account.',
      category: 'account',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'How can I reset my password?',
      answer: 'If you forgot your password, click on "Forgot Password" on the login page. Enter your email address and we will send you a reset link. Follow the instructions in the email to create a new password.',
      category: 'account',
      helpful: 32,
      notHelpful: 1
    },
    {
      id: '3',
      question: 'How do I make a booking?',
      answer: 'To make a booking, navigate to the service you want (hotel, restaurant, event, etc.), select your preferred option, choose dates and times if applicable, and click "Book Now". Follow the checkout process to complete your booking.',
      category: 'booking',
      helpful: 67,
      notHelpful: 5
    },
    {
      id: '4',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel most bookings. Go to "My Bookings" in your customer dashboard, find the booking you want to cancel, and click "Cancel". Please note that cancellation policies vary by service provider.',
      category: 'booking',
      helpful: 28,
      notHelpful: 2
    },
    {
      id: '5',
      question: 'How do I leave a review?',
      answer: 'After completing a service, you can leave a review by going to "My Reviews" in your dashboard, or by visiting the service page and clicking "Write a Review". Your honest feedback helps other customers make informed decisions.',
      category: 'reviews',
      helpful: 41,
      notHelpful: 3
    },
    {
      id: '6',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, UPI, net banking, and digital wallets like PayPal, Google Pay, and Apple Pay.',
      category: 'payment',
      helpful: 55,
      notHelpful: 2
    }
  ])

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as Priority
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/customer/support/tickets')
      if (response.data) {
        setTickets((response.data as { tickets?: SupportTicket[] }).tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/api/customer/support/tickets', newTicket)
      
      if (response.data) {
        alert('Support ticket created successfully!')
        setNewTicket({
          subject: '',
          description: '',
          category: '',
          priority: 'medium'
        })
        setNewTicketOpen(false)
        fetchTickets()
      } else {
        alert('Failed to create ticket: ' + response.error)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleTicketResponse = async (ticketId: string) => {
    if (!ticketResponse.trim()) return

    try {
      setLoading(true)
      const response = await api.post(`/api/customer/support/tickets/${ticketId}/responses`, {
        message: ticketResponse
      })
      
      if (response.data) {
        setTicketResponse('')
        fetchTickets()
        // Refresh selected ticket
        if (selectedTicket) {
          const updatedTicket = tickets.find(t => t.id === ticketId)
          setSelectedTicket(updatedTicket || null)
        }
      }
    } catch (error) {
      console.error('Error sending response:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'account', label: 'Account & Profile' },
    { value: 'booking', label: 'Bookings & Reservations' },
    { value: 'payment', label: 'Payments & Billing' },
    { value: 'reviews', label: 'Reviews & Ratings' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'other', label: 'Other' }
  ]

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get help with your account, bookings, and more</p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-3">Available 24/7</p>
            <p className="font-medium">+91 33 1234-5678</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600 mb-3">Response within 24 hours</p>
            <p className="font-medium">support@destinationkolkata.com</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-3">Instant assistance</p>
            <Button className="bg-orange-600 hover:bg-orange-700">Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <Card key={faq.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </CardTitle>
                </CardHeader>
                {expandedFAQ === faq.id && (
                  <CardContent>
                    <p className="text-gray-700 mb-4">{faq.answer}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                        {faq.category}
                      </span>
                      <div className="flex items-center gap-4">
                        <span>Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            👍 {faq.helpful}
                          </Button>
                          <Button variant="outline" size="sm">
                            👎 {faq.notHelpful}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Support Tickets</h2>
            <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account & Profile</SelectItem>
                          <SelectItem value="booking">Bookings & Reservations</SelectItem>
                          <SelectItem value="payment">Payments & Billing</SelectItem>
                          <SelectItem value="technical">Technical Issues</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value: Priority) => 
                          setNewTicket(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewTicketOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Ticket'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Card 
                key={ticket.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-1 rounded-full ${statusColors[ticket.status]}`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${priorityColors[ticket.priority]}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
              <p className="text-gray-600 mb-4">You haven&apos;t created any support tickets yet</p>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => setNewTicketOpen(true)}
              >
                Create Your First Ticket
              </Button>
            </div>
          )}

          {/* Ticket Detail Modal */}
          {selectedTicket && (
            <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedTicket.subject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedTicket.status]}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedTicket.description}</p>
                  </div>

                  {/* Responses */}
                  {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Conversation</h4>
                      {selectedTicket.responses.map(response => (
                        <div 
                          key={response.id}
                          className={`p-3 rounded-lg ${response.isStaff ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">
                              {response.isStaff ? 'Support Staff' : 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Response */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="space-y-3">
                      <Label>Add Response</Label>
                      <Textarea
                        value={ticketResponse}
                        onChange={(e) => setTicketResponse(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                      />
                      <Button
                        onClick={() => handleTicketResponse(selectedTicket.id)}
                        disabled={loading || !ticketResponse.trim()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <HelpCircle className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-gray-600 mb-4">Learn the basics of using Destination Kolkata</p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="font-semibold mb-2">Booking Guide</h3>
                <p className="text-gray-600 mb-4">Step-by-step booking instructions</p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="font-semibold mb-2">Reviews & Ratings</h3>
                <p className="text-gray-600 mb-4">How to leave and manage reviews</p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
