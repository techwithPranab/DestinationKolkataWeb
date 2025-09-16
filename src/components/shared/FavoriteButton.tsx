"use client"

import React from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  readonly type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  readonly itemId: string
  readonly itemName: string
  readonly size?: 'sm' | 'default' | 'lg'
  readonly showText?: boolean
}

export function FavoriteButton({
  type,
  itemId,
  itemName,
  size = 'sm',
  showText = false
}: FavoriteButtonProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isFavorited = isFavorite(type, itemId)

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        const result = await removeFromFavorites(type, itemId)
        if (result.success) {
          toast.success(`Removed ${itemName} from favorites`)
        } else {
          toast.error(result.error || 'Failed to remove from favorites')
        }
      } else {
        const result = await addToFavorites(type, itemId, itemName)
        if (result.success) {
          toast.success(`Added ${itemName} to favorites`)
        } else {
          toast.error(result.error || 'Failed to add to favorites')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('An error occurred while updating favorites')
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggleFavorite}
      className={`hover:bg-red-50 hover:text-red-600 ${
        isFavorited ? 'text-red-600' : 'text-gray-400'
      }`}
    >
      <Heart
        className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`}
      />
      {showText && (
        <span className="ml-2">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  )
}
