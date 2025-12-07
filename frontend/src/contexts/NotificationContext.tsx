"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchAPI } from '@/lib/backend-api'

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  refreshNotifications: () => Promise<void>
  addNotification: (notification: Omit<Notification, '_id' | 'read' | 'createdAt'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = async () => {
    try {
      const response = await fetchAPI('/api/customer/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  const addNotification = (notificationData: Omit<Notification, '_id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      _id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    addNotification
  }

  return (
    <NotificationContext.Provider value={value}>
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
