"use client"

import { usePathname } from 'next/navigation'
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthProvider } from "@/contexts/AuthContext"

interface ConditionalLayoutProps {
  readonly children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Don't show navbar and footer for admin and customer pages
  const isAdminPage = pathname?.startsWith('/admin')
  const isCustomerPage = pathname?.startsWith('/customer')

  return (
    <AuthProvider>
      {!isAdminPage && !isCustomerPage && <Navbar />}
      {children}
      {!isAdminPage && !isCustomerPage && <Footer />}
    </AuthProvider>
  )
}
