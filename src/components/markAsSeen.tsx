'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface MarkMovieSeenButtonProps {
  watchlistId: number
  isSeen: boolean
  title: string
}

export default function MarkMovieSeenButton({
  watchlistId,
  isSeen,
  title,
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
        toast.error(`Failed to mark ${title} as ${isSeen ? 'unseen' : 'seen'}`)
      } else {
        toast.success(`${title} marked as ${isSeen ? 'unseen' : 'seen'}`)
        window.location.reload() // Refresh to update UI
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
      size='sm'
      variant={isSeen ? 'default' : 'outline'}
      onClick={handleToggleSeen}
      disabled={isLoading}
      className='w-full h-8'
    >
      <Check className='h-4 w-4 mr-2' />
      {isSeen ? 'Marked as Seen' : 'Mark as Seen'}
    </Button>
  )
}
