import NextAuth, { NextAuthOptions, Account, User as NextAuthUser } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/index'
import mongoose from 'mongoose'

export const authOptions: NextAuthOptions = {
  // Remove MongoDBAdapter to handle database operations manually
  debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: NextAuthUser; account: Account | null }) {
      try {
        // Ensure mongoose is connected before using models
        if (mongoose.connection.readyState !== 1) {
          await connectDB()
        }

        // Check if user already exists
        const userQuery = User.findOne({ email: user.email })
        const existingUser = await Promise.race([
          userQuery, 
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timeout')), 12000))
        ]) as InstanceType<typeof User> | null

        if (existingUser) {
          // Update user with OAuth provider info if not already set
          if (!existingUser.provider) {
            existingUser.provider = account?.provider
            existingUser.providerId = user.id
            await existingUser.save()
          }
          // Existing user - allow sign in
          return true
        }

        // Create new user
        const newUser = new User({
          name: user.name,
          email: user.email,
          provider: account?.provider,
          providerId: user.id,
          role: 'customer',
          emailVerified: true,
          isActive: true,
        })

        await newUser.save()
        // New user created - allow sign in
        return true
      } catch (error) {
        console.error('OAuth sign-in error:', error)
        return false
      }
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
      }

      // Add user role to token - always fetch fresh from DB
      if (token?.email) {
        try {
          const dbUser = await User.findOne({ email: token.email }).select('role')
          if (dbUser) {
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as NextAuthUser & { id: string }).id = token?.id as string
      }

      // Add role to session if available
      if (token?.role && typeof token.role === 'string') {
        ;(session.user as NextAuthUser & { id: string; role: string }).role = token.role
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // If the URL is on the same domain, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Default to customer dashboard for OAuth logins
      return `${baseUrl}/customer/dashboard`
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
