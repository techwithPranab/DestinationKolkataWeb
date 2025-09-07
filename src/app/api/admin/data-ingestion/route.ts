import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import jwt from 'jsonwebtoken'

async function getUserFromToken(req: NextRequest): Promise<{ userId: string; role: string; email: string }> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string; email: string }
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid token')
  }
}

interface IngestionResult {
  success: boolean
  message: string
  stats?: {
    totalProcessed: number
    totalSuccessful: number
    totalFailed: number
    totalPending: number
    processingTime: number
    collections: {
      hotels: { total: number; success: number; failed: number; pending: number }
      restaurants: { total: number; success: number; failed: number; pending: number }
      attractions: { total: number; success: number; failed: number; pending: number }
      sports: { total: number; success: number; failed: number; pending: number }
      events: { total: number; success: number; failed: number; pending: number }
      promotions: { total: number; success: number; failed: number; pending: number }
    }
  }
  error?: string
  logs?: string[]
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication using JWT token
    const user = await getUserFromToken(request)

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { mode = 'ingest-and-load' } = await request.json()

    // Validate mode
    if (!['ingest-and-load', 'load-existing'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "ingest-and-load" or "load-existing".' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting data ingestion with mode: ${mode}`)

    // Execute the data manager script
    const scriptPath = path.join(process.cwd(), 'scripts', 'data-manager.ts')
    const logs: string[] = []
    let isCompleted = false

    return new Promise((resolve) => {
      const child = spawn('npx', ['tsx', scriptPath, mode], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        const output = data.toString()
        stdout += output
        logs.push(`[STDOUT] ${output.trim()}`)
        console.log(`[Data Ingestion] ${output.trim()}`)
      })

      child.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output
        logs.push(`[STDERR] ${output.trim()}`)
        console.error(`[Data Ingestion Error] ${output.trim()}`)
      })

      child.on('close', (code) => {
        isCompleted = true

        if (code === 0) {
          // Parse the output to extract statistics
          const result = parseIngestionOutput(stdout, stderr, logs)
          resolve(NextResponse.json(result))
        } else {
          resolve(NextResponse.json({
            success: false,
            message: 'Data ingestion failed',
            error: stderr || 'Unknown error occurred',
            logs
          }, { status: 500 }))
        }
      })

      child.on('error', (error) => {
        isCompleted = true
        resolve(NextResponse.json({
          success: false,
          message: 'Failed to start data ingestion process',
          error: error.message,
          logs
        }, { status: 500 }))
      })

      // Timeout after 10 minutes
      setTimeout(() => {
        if (!isCompleted) {
          child.kill('SIGTERM')
          resolve(NextResponse.json({
            success: false,
            message: 'Data ingestion timed out',
            error: 'Process took longer than 10 minutes',
            logs
          }, { status: 408 }))
        }
      }, 10 * 60 * 1000)
    })

  } catch (error) {
    console.error('Data ingestion API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function parseIngestionOutput(stdout: string, stderr: string, logs: string[]): IngestionResult {
  try {
    // Extract statistics from the output
    const lines = stdout.split('\n')
    let totalProcessed = 0
    let totalSuccessful = 0
    let totalFailed = 0
    let totalPending = 0
    let processingTime = 0

    const collections = {
      hotels: { total: 0, success: 0, failed: 0, pending: 0 },
      restaurants: { total: 0, success: 0, failed: 0, pending: 0 },
      attractions: { total: 0, success: 0, failed: 0, pending: 0 },
      sports: { total: 0, success: 0, failed: 0, pending: 0 },
      events: { total: 0, success: 0, failed: 0, pending: 0 },
      promotions: { total: 0, success: 0, failed: 0, pending: 0 }
    }

    // Parse collection statistics
    lines.forEach(line => {
      // Parse individual collection stats
      const hotelMatch = line.match(/Hotels:\s*(\d+)\/(\d+)\s*loaded.*?(\d+)\s*skipped.*?(\d+)\s*failed/)
      if (hotelMatch) {
        collections.hotels.total = parseInt(hotelMatch[2])
        collections.hotels.success = parseInt(hotelMatch[1])
        collections.hotels.failed = parseInt(hotelMatch[4])
      }

      const restaurantMatch = line.match(/Restaurants:\s*(\d+)\/(\d+)\s*loaded.*?(\d+)\s*skipped.*?(\d+)\s*failed/)
      if (restaurantMatch) {
        collections.restaurants.total = parseInt(restaurantMatch[2])
        collections.restaurants.success = parseInt(restaurantMatch[1])
        collections.restaurants.failed = parseInt(restaurantMatch[4])
      }

      const attractionMatch = line.match(/Attractions:\s*(\d+)\/(\d+)\s*loaded.*?(\d+)\s*skipped.*?(\d+)\s*failed/)
      if (attractionMatch) {
        collections.attractions.total = parseInt(attractionMatch[2])
        collections.attractions.success = parseInt(attractionMatch[1])
        collections.attractions.failed = parseInt(attractionMatch[4])
      }

      const sportsMatch = line.match(/Sports Facilities:\s*(\d+)\/(\d+)\s*loaded.*?(\d+)\s*skipped.*?(\d+)\s*failed/)
      if (sportsMatch) {
        collections.sports.total = parseInt(sportsMatch[2])
        collections.sports.success = parseInt(sportsMatch[1])
        collections.sports.failed = parseInt(sportsMatch[4])
      }

      // Parse overall statistics
      const totalProcessedMatch = line.match(/Total Records Processed:\s*(\d+)/)
      if (totalProcessedMatch) {
        totalProcessed = parseInt(totalProcessedMatch[1])
      }

      const totalSuccessfulMatch = line.match(/Successfully Loaded:\s*(\d+)/)
      if (totalSuccessfulMatch) {
        totalSuccessful = parseInt(totalSuccessfulMatch[1])
      }

      const totalFailedMatch = line.match(/Failed:\s*(\d+)/)
      if (totalFailedMatch) {
        totalFailed = parseInt(totalFailedMatch[1])
      }

      const totalPendingMatch = line.match(/Total Pending Status:\s*(\d+)/)
      if (totalPendingMatch) {
        totalPending = parseInt(totalPendingMatch[1])
      }

      const processingTimeMatch = line.match(/Processing Time:\s*([\d.]+)\s*seconds/)
      if (processingTimeMatch) {
        processingTime = parseFloat(processingTimeMatch[1])
      }
    })

    // Set pending counts (assuming all successful are pending)
    collections.hotels.pending = collections.hotels.success
    collections.restaurants.pending = collections.restaurants.success
    collections.attractions.pending = collections.attractions.success
    collections.sports.pending = collections.sports.success
    collections.events.pending = collections.events.success
    collections.promotions.pending = collections.promotions.success

    return {
      success: true,
      message: 'Data ingestion completed successfully',
      stats: {
        totalProcessed,
        totalSuccessful,
        totalFailed,
        totalPending,
        processingTime,
        collections
      },
      logs
    }

  } catch (parseError) {
    console.error('Error parsing ingestion output:', parseError)
    return {
      success: true, // Process completed but parsing failed
      message: 'Data ingestion completed but statistics parsing failed',
      error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
      logs
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Data Ingestion API',
    endpoints: {
      POST: 'Trigger data ingestion process',
      modes: ['ingest-and-load', 'load-existing']
    },
    usage: {
      method: 'POST',
      body: { mode: 'ingest-and-load' },
      headers: { 'Content-Type': 'application/json' }
    }
  })
}
