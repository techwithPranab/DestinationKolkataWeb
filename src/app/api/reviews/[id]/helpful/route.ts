import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models/Review'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// POST /api/reviews/[id]/helpful - Vote review as helpful/unhelpful
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    const { helpful } = await request.json()

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to vote on their own review
    if (review.user?.toString() === user.userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot vote on your own review' },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const helpfulUsers = review.helpfulUsers || []
    const hasVoted = helpfulUsers.some(vote => 
      vote.user?.toString() === user.userId
    )

    if (hasVoted) {
      // Update existing vote
      const voteIndex = helpfulUsers.findIndex(vote => 
        vote.user?.toString() === user.userId
      )
      
      if (helpfulUsers[voteIndex].helpful === helpful) {
        // Remove vote if same vote type
        helpfulUsers.splice(voteIndex, 1)
      } else {
        // Update vote type
        helpfulUsers[voteIndex].helpful = helpful
      }
    } else {
      // Add new vote
      helpfulUsers.push({
        user: new mongoose.Types.ObjectId(user.userId),
        helpful,
        votedAt: new Date()
      })
    }

    // Update the review's helpfulUsers array
    review.helpfulUsers = helpfulUsers

    await review.save()

    // Calculate helpful stats
    const helpfulCount = helpfulUsers.filter(vote => vote.helpful).length
    const notHelpfulCount = helpfulUsers.filter(vote => !vote.helpful).length

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulCount,
      notHelpfulCount,
      totalVotes: helpfulUsers.length
    })
  } catch (error) {
    console.error('Error recording helpful vote:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to record vote' },
      { status: 500 }
    )
  }
}
