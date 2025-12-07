'use client'
import { fetchAPI } from '@/lib/backend-api'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Loader2,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'

// Simple Progress component replacement
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ''}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

// Simple Separator component replacement
const Separator = () => <hr className="my-4 border-gray-200" />

interface IngestionStats {
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

interface IngestionResult {
  success: boolean
  message: string
  stats?: IngestionStats
  error?: string
  logs?: string[]
}

type IngestionStatus = 'idle' | 'running' | 'completed' | 'error'

export default function DataIngestionPage() {
  const [mode, setMode] = useState<'ingest-and-load' | 'load-existing'>('ingest-and-load')
  const [status, setStatus] = useState<IngestionStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<IngestionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleIngestion = async () => {
    setIsLoading(true)
    setStatus('running')
    setProgress(10)
    setResult(null)

    try {
      // Get authentication token
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setStatus('error')
        setProgress(0)
        setResult({
          success: false,
          message: 'Authentication required',
          error: 'No admin token found. Please login as an admin user.'
        })
        setIsLoading(false)
        return
      }

      const response = await fetchAPI('/api/admin/data-ingestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mode }),
      })

      setProgress(50)

      const data: IngestionResult = await response.json()

      if (response.ok && data.success) {
        setStatus('completed')
        setProgress(100)
        setResult(data)
      } else {
        setStatus('error')
        setProgress(0)
        setResult(data)
      }
    } catch (error) {
      setStatus('error')
      setProgress(0)
      setResult({
        success: false,
        message: 'Failed to connect to the server',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Database className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const renderStats = (stats: IngestionStats) => {
    const collections = [
      { name: 'Hotels', data: stats.collections.hotels, icon: '🏨' },
      { name: 'Restaurants', data: stats.collections.restaurants, icon: '🍽️' },
      { name: 'Attractions', data: stats.collections.attractions, icon: '🏛️' },
      { name: 'Sports Facilities', data: stats.collections.sports, icon: '⚽' },
      { name: 'Events', data: stats.collections.events, icon: '🎉' },
      { name: 'Promotions', data: stats.collections.promotions, icon: '💰' }
    ]

    return (
      <div className="space-y-6">
        {/* Overall Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Summary
            </CardTitle>
            <CardDescription>
              Processing completed in {formatTime(stats.processingTime)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalSuccessful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalPending}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Success Rate</div>
              <Progress
                value={(stats.totalSuccessful / stats.totalProcessed) * 100}
                className="h-2"
              />
              <div className="text-right text-sm text-gray-600 mt-1">
                {stats.totalProcessed > 0 ? ((stats.totalSuccessful / stats.totalProcessed) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Details */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
            <CardDescription>
              Breakdown by data type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collections.map((collection) => (
                <div key={collection.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{collection.icon}</span>
                    <div>
                      <div className="font-medium">{collection.name}</div>
                      <div className="text-sm text-gray-600">
                        {collection.data.total} records processed
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {collection.data.success} success
                    </Badge>
                    {collection.data.pending > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {collection.data.pending} pending
                      </Badge>
                    )}
                    {collection.data.failed > 0 && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {collection.data.failed} failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Ingestion</h1>
          <p className="text-gray-600 mt-2">
            Import data from OpenStreetMap and load it into the database
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {status === 'idle' && 'Ready'}
            {status === 'running' && 'Processing...'}
            {status === 'completed' && 'Completed'}
            {status === 'error' && 'Error'}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Ingestion Configuration
          </CardTitle>
          <CardDescription>
            Choose the ingestion mode and start the process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ingestion-mode" className="text-sm font-medium">Ingestion Mode</label>
              <Select value={mode} onValueChange={(value: "ingest-and-load" | "load-existing") => setMode(value)}>
                <SelectTrigger id="ingestion-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="ingest-and-load">
                    <div>
                      <div className="font-medium">Fresh Data Ingestion</div>
                      <div className="text-sm text-gray-600">
                        Fetch from OpenStreetMap and load into database
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="load-existing">
                    <div>
                      <div className="font-medium">Load Existing Data</div>
                      <div className="text-sm text-gray-600">
                        Load from existing JSON files
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-display" className="text-sm font-medium">Status</label>
              <div id="status-display" className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                {getStatusIcon()}
                <span className="text-sm">
                  {status === 'idle' && 'Ready to start ingestion'}
                  {status === 'running' && 'Ingestion in progress...'}
                  {status === 'completed' && 'Ingestion completed successfully'}
                  {status === 'error' && 'Ingestion failed'}
                </span>
              </div>
            </div>
          </div>

          {status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Separator />

          <div className="flex gap-4">
            <Button
              onClick={handleIngestion}
              disabled={isLoading || status === 'running'}
              className="flex items-center gap-2 bg-amber-600 text-white"

            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {status === 'running' ? 'Processing...' : 'Start Ingestion'}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStatus('idle')
                setProgress(0)
                setResult(null)
              }}
              disabled={status === 'running'}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {result.success ? 'Ingestion Successful' : 'Ingestion Failed'}
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent>
            {result.error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <div className="font-medium">Error Details</div>
                  <AlertDescription>{result.error}</AlertDescription>
                </div>
              </Alert>
            )}

            {result.stats && renderStats(result.stats)}

            {result.logs && result.logs.length > 0 && (
              <div className="mt-4">
                <details className="group">
                  <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    View Logs ({result.logs.length} entries)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {result.logs.join('\n')}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Processing Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• All new records are set to &quot;pending&quot; status</li>
              <li>• Admin approval is required before records become active</li>
              <li>• Duplicate records are automatically skipped</li>
              <li>• Process may take several minutes to complete</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Important
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Ensure MongoDB is running before starting</li>
              <li>• Check network connectivity for OSM API calls</li>
              <li>• Monitor server resources during large imports</li>
              <li>• Review failed records in the admin panel</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
