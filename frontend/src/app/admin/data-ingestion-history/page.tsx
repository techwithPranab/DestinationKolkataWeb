'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface IngestionHistory {
  _id: string
  dataType: string
  operation: string
  status: 'success' | 'partial' | 'failed'
  recordsProcessed: number
  recordsSuccessful: number
  recordsFailed: number
  errorList: {
    record?: string
    error: string
    timestamp: Date
  }[]
  metadata: {
    source?: string
    initiatedBy?: string
    fileName?: string
    [key: string]: unknown
  }
  startTime: Date
  endTime?: Date
  duration?: number
  createdAt: Date
  updatedAt: Date
}

interface Stats {
  overall: {
    totalOperations: number
    totalProcessed: number
    totalSuccessful: number
    totalFailed: number
    avgDuration: number
  }
  byDataType: {
    _id: string
    count: number
    totalProcessed: number
  }[]
  byStatus: {
    _id: string
    count: number
  }[]
}

export default function DataIngestionHistoryPage() {
  const [history, setHistory] = useState<IngestionHistory[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<IngestionHistory | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    dataType: '',
    operation: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchHistory()
    fetchStats()
  }, [page, filters])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.dataType && { dataType: filters.dataType }),
        ...(filters.operation && { operation: filters.operation }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetchAuthenticatedAPI(
        `/api/data-ingestion-history?${queryParams}`
      )

      if (response.ok) {
        const data = await response.json()
        setHistory(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching ingestion history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetchAuthenticatedAPI('/api/data-ingestion-history/stats/summary')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingestion history record?')) {
      return
    }

    try {
      const response = await fetchAuthenticatedAPI(`/api/data-ingestion-history/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchHistory()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting history:', error)
    }
  }

  const viewDetails = (item: IngestionHistory) => {
    setSelectedHistory(item)
    setIsDetailModalOpen(true)
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="w-3 h-3 mr-1" />,
      partial: <AlertTriangle className="w-3 h-3 mr-1" />,
      failed: <XCircle className="w-3 h-3 mr-1" />
    }

    return (
      <Badge className={variants[status] || ''}>
        <span className="flex items-center">
          {icons[status]}
          {status.toUpperCase()}
        </span>
      </Badge>
    )
  }

  const clearFilters = () => {
    setFilters({
      dataType: '',
      operation: '',
      status: '',
      startDate: '',
      endDate: ''
    })
    setPage(1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Ingestion History</h1>
          <p className="text-gray-500 mt-1">Track and monitor all data ingestion operations</p>
        </div>
        <Button onClick={() => fetchHistory()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.totalOperations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Records Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.overall.totalProcessed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.overall.totalSuccessful}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overall.totalFailed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Data Type</Label>
              <Select 
                value={filters.dataType} 
                onValueChange={(value) => setFilters({ ...filters, dataType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="hotels">Hotels</SelectItem>
                  <SelectItem value="restaurants">Restaurants</SelectItem>
                  <SelectItem value="attractions">Attractions</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="promotions">Promotions</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Operation</Label>
              <Select 
                value={filters.operation} 
                onValueChange={(value) => setFilters({ ...filters, operation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Operations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Operations</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="ingest">Ingest</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ingestion History ({total} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ingestion history found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(item.startTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{item.dataType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{item.operation}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{item.recordsProcessed}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{item.recordsSuccessful}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{item.recordsFailed}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(item.duration)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDetails(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ingestion History Details</DialogTitle>
            <DialogDescription>
              Detailed information about this ingestion operation
            </DialogDescription>
          </DialogHeader>

          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Data Type</Label>
                  <div className="mt-1">{selectedHistory.dataType}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Operation</Label>
                  <div className="mt-1">{selectedHistory.operation}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedHistory.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Duration</Label>
                  <div className="mt-1">{formatDuration(selectedHistory.duration)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Records Processed</Label>
                  <div className="mt-1 text-lg font-semibold">{selectedHistory.recordsProcessed}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Successful</Label>
                  <div className="mt-1 text-lg font-semibold text-green-600">{selectedHistory.recordsSuccessful}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Failed</Label>
                  <div className="mt-1 text-lg font-semibold text-red-600">{selectedHistory.recordsFailed}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Start Time</Label>
                  <div className="mt-1">{new Date(selectedHistory.startTime).toLocaleString()}</div>
                </div>
              </div>

              {selectedHistory.metadata && Object.keys(selectedHistory.metadata).length > 0 && (
                <div>
                  <Label className="text-gray-500">Metadata</Label>
                  <div className="mt-1 bg-gray-50 p-3 rounded text-sm">
                    <pre>{JSON.stringify(selectedHistory.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}

              {selectedHistory.errorList && selectedHistory.errorList.length > 0 && (
                <div>
                  <Label className="text-gray-500">Errors ({selectedHistory.errorList.length})</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {selectedHistory.errorList.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        {error.record && (
                          <div className="text-sm font-medium mb-1">Record: {error.record}</div>
                        )}
                        <div className="text-sm text-red-800">{error.error}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
