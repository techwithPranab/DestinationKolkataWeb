"use client"

import { usePathname } from 'next/navigation'
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthProvider } from "@/contexts/AuthContext"

interface ClientLayoutProps {
  readonly children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Don't show navbar and footer for admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <AuthProvider>
      {!isAdminPage && <Navbar />}
      {children}
      {!isAdminPage && <Footer />}
    </AuthProvider>
  )
}
