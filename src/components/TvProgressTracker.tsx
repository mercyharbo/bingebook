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
import { cn, fetcher } from '@/lib/utils'
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
  const [isMarkingAll, setIsMarkingAll] = useState(false)

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
        // Only show toast for season completion or when unmarking episodes
        if (
          isSeasonComplete &&
          !completedSeasons.includes(parseInt(selectedSeason))
        ) {
          toast.success(`Season ${selectedSeason} completed! 🎉`)
        } else if (currentEpisodes.includes(episode)) {
          // Only show toast when unmarking (less common action)
          toast.success(`Episode ${episode} unmarked`)
        }
        // Don't show toast when marking episodes as seen to avoid spam
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

  const markAllEpisodesAsSeen = async () => {
    setIsMarkingAll(true)
    const seasonKey = `season_${selectedSeason}`
    const allEpisodeCodes = episodes.map(
      (episode) =>
        `S${selectedSeason.padStart(2, '0')}E${episode.episode_number
          .toString()
          .padStart(2, '0')}`
    )

    // Set loading state for all episodes
    allEpisodeCodes.forEach((code) => setLoadingEpisode(code, true))

    try {
      const updatedSeenEpisodes = {
        ...seenEpisodes,
        [seasonKey]: allEpisodeCodes,
      }

      const newCompletedSeasons = [
        ...new Set([...completedSeasons, parseInt(selectedSeason)]),
      ]

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
        console.error('Error marking all episodes as seen:', error)
        // Revert local state on error
        setSeenEpisodes(seenEpisodes)
        setCompletedSeasons(completedSeasons)
        toast.error('Failed to mark all episodes as seen')
      } else {
        toast.success(
          `All episodes in Season ${selectedSeason} marked as seen! 🎉`
        )
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      // Revert local state on error
      setSeenEpisodes(seenEpisodes)
      setCompletedSeasons(completedSeasons)
      toast.error('An unexpected error occurred')
    } finally {
      setIsMarkingAll(false)
      // Clear loading state for all episodes
      allEpisodeCodes.forEach((code) => setLoadingEpisode(code, false))
    }
  }

  const allSeasonsCompleted = seasons.every((season) =>
    completedSeasons.includes(season.season_number)
  )

  const allEpisodesInSeasonSeen =
    episodes.length > 0 &&
    (seenEpisodes[`season_${selectedSeason}`]?.length || 0) === episodes.length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={allSeasonsCompleted ? 'default' : 'outline'}
          className={cn(
            'w-full h-10 transition-all duration-300',
            allSeasonsCompleted &&
              'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          )}
        >
          {allSeasonsCompleted ? 'Seen all seasons' : 'Manage Episodes'}
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
          <div className='flex flex-col sm:flex-row gap-3'>
            <Select
              value={selectedSeason}
              onValueChange={setSelectedSeason}
              disabled={isLoading}
            >
              <SelectTrigger size='lg' className='w-full h-8 text-xs'>
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
            <Button
              onClick={markAllEpisodesAsSeen}
              disabled={
                isLoading ||
                episodes.length === 0 ||
                isMarkingAll ||
                allEpisodesInSeasonSeen
              }
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs h-11 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isMarkingAll ? (
                <div className='flex items-center gap-2'>
                  <LoadingSpinner size={14} />
                  <span>Marking...</span>
                </div>
              ) : allEpisodesInSeasonSeen ? (
                'All Seen ✓'
              ) : (
                'Mark All as Seen'
              )}
            </Button>
          </div>

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
                    size='lg'
                    variant={isSeen ? 'default' : 'outline'}
                    onClick={() => toggleEpisode(episodeCode)}
                    disabled={isLoadingEpisode || isLoading}
                    className={cn(
                      'text-xs relative transition-all duration-200',
                      isLoadingEpisode && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {isLoadingEpisode ? (
                      <div className='flex items-center justify-center gap-2 py-1'>
                        <LoadingSpinner size={20} />
                        <span className='text-[10px] leading-tight opacity-75'>
                          {episodeCode}
                        </span>
                      </div>
                    ) : (
                      <div className='flex  items-center justify-center gap-0.5'>
                        <span className='leading-tight'>{episodeCode}</span>
                        {isSeen && <span className='text-[10px]'>✓</span>}
                      </div>
                    )}
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
