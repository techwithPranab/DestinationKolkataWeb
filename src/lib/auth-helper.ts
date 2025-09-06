import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'

interface AuthUser {
  userId: string
  role: string
  email: string
  name?: string
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthUser> {
  // Try NextAuth session first (for OAuth users)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      // For OAuth users, we need to get the user data from database
      const { db } = await connectToDatabase()
      const user = await db.collection('users').findOne({ email: session.user.email })
      
      if (user) {
        return {
          userId: user._id.toString(),
          role: user.role || 'customer',
          email: user.email,
          name: user.name
        }
      }
    }
  } catch (sessionError) {
    console.log('NextAuth session not found, trying JWT token...', sessionError instanceof Error ? sessionError.message : 'Unknown error')
  }

  // Try JWT token (for form-based auth)
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                req.cookies.get('authToken')?.value ||
                req.cookies.get('adminToken')?.value

  if (!token) {
    throw new Error('No authentication found')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { 
      userId: string
      role: string
      email: string
      name?: string
    }
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid token')
  }
}
