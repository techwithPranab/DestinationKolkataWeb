"use client"

import React, { useState, useEffect } from 'react'
import {
  Send,
  Search,
  Plus,
  MessageCircle,
  RefreshCw,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

interface Message {
  _id: string
  content: string
  timestamp: string
  sender: {
    _id: string
    name: string
    role: string
  }
  isRead: boolean
}

interface Conversation {
  _id: string
  title: string
  subject: string
  status: 'open' | 'closed' | 'pending'
  priority: 'low' | 'medium' | 'high'
  category: 'general' | 'technical' | 'billing' | 'listing' | 'account'
  participants: Array<{
    _id: string
    name: string
    role: string
  }>
  messages: Message[]
  createdAt: string
  updatedAt: string
  lastMessage?: string
  unreadCount?: number
}

export default function CustomerMessaging() {
  const { user, isAuthenticated } = useAuth()
  const api = useApi()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [newConversation, setNewConversation] = useState({
    title: '',
    subject: '',
    category: 'general' as 'general' | 'technical' | 'billing' | 'listing' | 'account',
    priority: 'medium' as 'low' | 'medium' | 'high',
    initialMessage: ''
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations()
    }
  }, [isAuthenticated, user])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const result = await api.get<{ conversations: Conversation[] }>('/api/customer/messages')

      if (result.data) {
        const data = result.data as { conversations?: Conversation[] }
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async () => {
    try {
      const result = await api.post('/api/customer/messages', {
        title: newConversation.title,
        subject: newConversation.subject,
        category: newConversation.category,
        priority: newConversation.priority,
        initialMessage: newConversation.initialMessage
      })

      if (result.data) {
        setIsNewConversationOpen(false)
        setNewConversation({
          title: '',
          subject: '',
          category: 'general',
          priority: 'medium',
          initialMessage: ''
        })
        await fetchConversations()
      } else {
        alert('Failed to create conversation: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error creating conversation')
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !messageText.trim()) return

    try {
      setSending(true)
      const result = await api.post(`/api/customer/messages/${selectedConversation._id}/reply`, {
        content: messageText.trim()
      })

      if (result.data) {
        setMessageText('')
        await fetchConversations()
        // Refresh the selected conversation
        const updated = conversations.find(c => c._id === selectedConversation._id)
        if (updated) {
          setSelectedConversation(updated)
        }
      } else {
        alert('Failed to send message: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      await api.post(`/api/customer/messages/${conversationId}/read`)
      await fetchConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const closeConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to close this conversation?')) return

    try {
      const result = await api.put(`/api/customer/messages/${conversationId}`, {
        status: 'closed'
      })

      if (result.data) {
        await fetchConversations()
        if (selectedConversation && selectedConversation._id === conversationId) {
          setSelectedConversation(null)
        }
      } else {
        alert('Failed to close conversation')
      }
    } catch (error) {
      console.error('Error closing conversation:', error)
      alert('Error closing conversation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '🔧'
      case 'billing':
        return '💳'
      case 'listing':
        return '📋'
      case 'account':
        return '👤'
      default:
        return '💬'
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || conv.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your messages...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your messages.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/auth/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (user && user.role !== 'customer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to customers.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>
                    Reach out to our support team for assistance.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newConversation.title}
                      onChange={(e) => setNewConversation(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief title for your inquiry"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newConversation.subject}
                      onChange={(e) => setNewConversation(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newConversation.category} onValueChange={(value) => 
                      setNewConversation(prev => ({ ...prev, category: value as typeof newConversation.category }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Payment</SelectItem>
                        <SelectItem value="listing">Listing Help</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newConversation.priority} onValueChange={(value) => 
                      setNewConversation(prev => ({ ...prev, priority: value as typeof newConversation.priority }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initialMessage">Message</Label>
                    <Textarea
                      id="initialMessage"
                      value={newConversation.initialMessage}
                      onChange={(e) => setNewConversation(prev => ({ ...prev, initialMessage: e.target.value }))}
                      placeholder="Describe your inquiry in detail..."
                      rows={4}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewConversationOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createConversation}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!newConversation.title || !newConversation.subject || !newConversation.initialMessage}
                  >
                    Start Conversation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found</p>
              <Button
                size="sm"
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setIsNewConversationOpen(true)}
              >
                Start your first conversation
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                role="button"
                tabIndex={0}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id ? 'bg-orange-50 border-orange-200' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conversation)
                  if (conversation.unreadCount && conversation.unreadCount > 0) {
                    markAsRead(conversation._id)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedConversation(conversation)
                    if (conversation.unreadCount && conversation.unreadCount > 0) {
                      markAsRead(conversation._id)
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {getCategoryIcon(conversation.category)} {conversation.title}
                  </h3>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge className="bg-orange-600 text-white text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">
                  {conversation.lastMessage || conversation.subject}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    <Badge className={getPriorityColor(conversation.priority)}>
                      {conversation.priority}
                    </Badge>
                  </div>
                  <span className="text-gray-500">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getCategoryIcon(selectedConversation.category)} {selectedConversation.title}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedConversation.priority)}>
                    {selectedConversation.priority} priority
                  </Badge>
                  {selectedConversation.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeConversation(selectedConversation._id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender.role === 'customer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.role === 'customer'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.sender.name}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            {selectedConversation.status === 'open' && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {sending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
