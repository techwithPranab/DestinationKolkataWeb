"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

export interface FavoriteItem {
  type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  itemId: string
  itemName: string
  addedDate: string
  notes?: string
}

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const api = useApi()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setIsLoading(true)
      const result = await api.get('/api/customer/favorites')

      interface FavoritesResponse {
        data: {
          favorites: FavoriteItem[]
        }
      }
      
      if (result.data && (result.data as FavoritesResponse).data && (result.data as FavoritesResponse).data.favorites) {
        setFavorites((result.data as FavoritesResponse).data.favorites)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [api, isAuthenticated, user])

  const addToFavorites = useCallback(async (
    type: FavoriteItem['type'],
    itemId: string,
    itemName: string,
    notes?: string
  ) => {
    try {
      const result = await api.post('/api/customer/favorites', {
        type,
        itemId,
        itemName,
        notes
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Refresh favorites
      await fetchFavorites()
      return { success: true }
    } catch (error) {
      console.error('Failed to add to favorites:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add to favorites' }
    }
  }, [api, fetchFavorites])

  const removeFromFavorites = useCallback(async (type: FavoriteItem['type'], itemId: string) => {
    try {
      const result = await api.delete(`/api/customer/favorites?type=${type}&itemId=${itemId}`)

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setFavorites(prev => prev.filter(fav => !(fav.type === type && fav.itemId === itemId)))
      return { success: true }
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove from favorites' }
    }
  }, [api])

  const isFavorite = useCallback((type: FavoriteItem['type'], itemId: string) => {
    return favorites.some(fav => fav.type === type && fav.itemId === itemId)
  }, [favorites])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites: fetchFavorites
  }
}
