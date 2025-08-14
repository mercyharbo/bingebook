'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import LoadingSpinner from './ui/loading-spinner'

interface TVProgressTrackerProps {
  watchlistId: number
  tmdbId: number
  seasons: { season_number: number; episode_count: number; name: string }[]
  seenEpisodes: Record<string, string[]>
  completedSeasons: number[]
}

interface Episode {
  episode_number: number
  name: string
}

export default function TVProgressTracker({
  watchlistId,
  tmdbId,
  seasons,
  seenEpisodes: initialSeenEpisodes,
  completedSeasons: initialCompletedSeasons,
}: TVProgressTrackerProps) {
  const supabase = createClient()
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons[0]?.season_number.toString() || '1'
  )

  // Local state to track seen episodes and completed seasons
  const [seenEpisodes, setSeenEpisodes] =
    useState<Record<string, string[]>>(initialSeenEpisodes)
  const [completedSeasons, setCompletedSeasons] = useState<number[]>(
    initialCompletedSeasons
  )

  const { loadingEpisodes, setLoadingEpisode } = useWatchlistStore()

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tmdbId}/season/${selectedSeason}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const episodes: Episode[] = data?.episodes || []

  const toggleEpisode = async (episode: string) => {
    setLoadingEpisode(episode, true)
    try {
      const seasonKey = `season_${selectedSeason}`
      const currentEpisodes = seenEpisodes[seasonKey] || []
      const newEpisodes = currentEpisodes.includes(episode)
        ? currentEpisodes.filter((ep) => ep !== episode)
        : [...currentEpisodes, episode]

      const updatedSeenEpisodes = {
        ...seenEpisodes,
        [seasonKey]: newEpisodes,
      }

      const seasonEpisodes = episodes.length
      const isSeasonComplete = newEpisodes.length === seasonEpisodes
      const newCompletedSeasons = isSeasonComplete
        ? [...new Set([...completedSeasons, parseInt(selectedSeason)])]
        : completedSeasons.filter((s) => s !== parseInt(selectedSeason))

      // Update local state immediately for instant UI feedback
      setSeenEpisodes(updatedSeenEpisodes)
      setCompletedSeasons(newCompletedSeasons)

      const { error } = await supabase
        .from('watchlist')
        .update({
          seen_episodes: updatedSeenEpisodes,
          completed_seasons: newCompletedSeasons,
          last_updated: new Date().toISOString(),
        })
        .eq('id', watchlistId)

      if (error) {
        console.error('Error updating episode:', error)
        // Revert local state on error
        setSeenEpisodes(seenEpisodes)
        setCompletedSeasons(completedSeasons)
        toast.error('Failed to update episode')
      } else {
        toast.success(
          `Episode ${episode} marked as ${
            newEpisodes.includes(episode) ? 'seen' : 'unseen'
          }`
        )
        // Optional: You can still call router.refresh() if you need to update other parts of the page
        // but remove window.location.reload()
        // router.refresh()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      // Revert local state on error
      setSeenEpisodes(seenEpisodes)
      setCompletedSeasons(completedSeasons)
      toast.error('An unexpected error occurred')
    } finally {
      setLoadingEpisode(episode, false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline' className='w-full h-8'>
          Manage Episodes
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Episode Progress - Season {selectedSeason}</DialogTitle>
          <DialogDescription>
            Mark episodes as seen or unseen for this season.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <Select
            value={selectedSeason}
            onValueChange={setSelectedSeason}
            disabled={isLoading}
          >
            <SelectTrigger className='w-full h-8 text-xs'>
              <SelectValue placeholder='Select season' />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem
                  key={season.season_number}
                  value={season.season_number.toString()}
                >
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading ? (
            <LoadingSpinner size={40} />
          ) : error ? (
            <div className='text-center text-sm text-red-600 dark:text-red-400'>
              Failed to load episodes
            </div>
          ) : episodes.length === 0 ? (
            <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
              No episodes available
            </div>
          ) : (
            <div className='grid grid-cols-4 gap-2'>
              {episodes.map((episode) => {
                const episodeCode = `S${selectedSeason.padStart(
                  2,
                  '0'
                )}E${episode.episode_number.toString().padStart(2, '0')}`
                const isSeen =
                  seenEpisodes[`season_${selectedSeason}`]?.includes(
                    episodeCode
                  )
                const isLoadingEpisode = loadingEpisodes[episodeCode] || false
                return (
                  <Button
                    key={episodeCode}
                    size='sm'
                    variant={isSeen ? 'default' : 'outline'}
                    onClick={() => toggleEpisode(episodeCode)}
                    disabled={isLoadingEpisode || isLoading}
                    className='text-xs'
                  >
                    {isLoadingEpisode ? (
                      <div className='flex justify-center items-center gap-1'>
                        <LoadingSpinner size={17} />
                        {episodeCode}
                      </div>
                    ) : (
                      episodeCode
                    )}{' '}
                    {isSeen ? '✓' : ''}
                  </Button>
                )
              })}
            </div>
          )}
          {completedSeasons.includes(parseInt(selectedSeason)) && (
            <Badge className='bg-green-500 text-white text-xs'>
              Season Completed
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
