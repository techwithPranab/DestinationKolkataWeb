"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

export interface Notification {
  id: string
  type: 'submission_status' | 'message' | 'system' | 'payment'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isAuthenticated } = useAuth()
  const api = useApi()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return

    try {
      setIsLoading(true)
      const result = await api.get<{ notifications: Notification[] }>('/api/customer/notifications')

      if (result.data) {
        const data = result.data as { notifications?: Notification[] }
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/customer/notifications/${id}/read`, {})
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/api/customer/notifications/mark-all-read', {})
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
    } else {
      setNotifications([])
    }
  }, [isAuthenticated, user])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(fetchNotifications, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  return (
    <NotificationContext.Provider
      value={useMemo(() => ({
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        isLoading
      }), [notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, isLoading])}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
