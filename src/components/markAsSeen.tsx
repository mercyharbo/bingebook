'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface MarkMovieSeenButtonProps {
  watchlistId: number
  isSeen: boolean
  title: string
  onToggle?: (newStatus: boolean) => void
}

export default function MarkMovieSeenButton({
  watchlistId,
  isSeen,
  title,
  onToggle,
}: MarkMovieSeenButtonProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleSeen = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('watchlist')
        .update({ is_seen: !isSeen, last_updated: new Date().toISOString() })
        .eq('id', watchlistId)
      if (error) {
        console.error('Error updating seen status:', error)
        toast.error('Failed to update movie status')
      } else {
        const newStatus = !isSeen
        toast.success(
          newStatus
            ? `"${title}" marked as seen!`
            : `"${title}" unmarked as seen`
        )
        onToggle?.(newStatus)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size='lg'
      onClick={handleToggleSeen}
      disabled={isLoading}
      className={cn(
        'w-full h-10 text-white',
        isSeen
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-600 hover:bg-blue-700'
      )}
    >
      <Check className='size-4' />
      {isSeen ? 'Marked as Seen' : 'Mark as Seen'}
    </Button>
  )
}
