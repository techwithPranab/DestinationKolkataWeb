"use client"

import React from 'react'

interface AdminLoginLayoutProps {
  readonly children: React.ReactNode
}

export default function AdminLoginLayout({ children }: AdminLoginLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {children}
    </div>
  )
}
