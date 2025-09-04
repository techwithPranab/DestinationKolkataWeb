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

  // Don't show navbar and footer for admin, customer, and auth pages
  const isAdminPage = pathname?.startsWith('/admin')
  const isCustomerPage = pathname?.startsWith('/customer')
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <AuthProvider>
      {!isAdminPage && !isCustomerPage && !isAuthPage && <Navbar />}
      {children}
      {!isAdminPage && !isCustomerPage && !isAuthPage && <Footer />}
    </AuthProvider>
  )
}
