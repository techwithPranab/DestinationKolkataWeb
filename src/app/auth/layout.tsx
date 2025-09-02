"use client"

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

interface AuthLayoutProps {
  readonly children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </AuthProvider>
  )
}
