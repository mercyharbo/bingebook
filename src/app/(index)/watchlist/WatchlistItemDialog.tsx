'use client'

import MarkMovieSeenButton from '@/components/markAsSeen'
import TVProgressTracker from '@/components/TvProgressTracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetcher } from '@/lib/utils'
import { TMDBSeason, WatchlistItem } from '@/types/watchlist'
import { Calendar, Info, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface WatchlistItemDialogProps {
  selectedItem: WatchlistItem | null
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  removeFromWatchlist: (id: number) => void
  addToWatchlist: (item: WatchlistItem) => void
  handleMovieSeenToggle: (watchlistId: number, newStatus: boolean) => void
  handleTVProgressUpdate: (
    watchlistId: number,
    seenEpisodes: Record<string, string[]>,
    completedSeasons: number[]
  ) => void
  updateTVMetadata: (
    watchlistId: number,
    numberOfSeasons: number,
    seasons: TMDBSeason[]
  ) => void
  isRemovingFromWatchlist: boolean
  watchlistItems: WatchlistItem[]
}

export default function WatchlistItemDialog({
  selectedItem,
  isDialogOpen,
  setIsDialogOpen,
  removeFromWatchlist,
  addToWatchlist,
  handleMovieSeenToggle,
  handleTVProgressUpdate,
  updateTVMetadata,
  isRemovingFromWatchlist,
  watchlistItems,
}: WatchlistItemDialogProps) {
  const [tvSeasons, setTvSeasons] = useState<TMDBSeason[]>([])

  const isInWatchlist = selectedItem
    ? watchlistItems.some((item) => item.id === selectedItem.id)
    : false

  // Fetch TV show seasons when dialog opens for a TV show
  useEffect(() => {
    const fetchTVSeasons = async () => {
      if (
        selectedItem &&
        selectedItem.media_type === 'tv' &&
        isDialogOpen &&
        (!selectedItem.tmdb_data.seasons ||
          selectedItem.tmdb_data.seasons.length === 0)
      ) {
        try {
          const data = await fetcher(
            `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${selectedItem.tmdb_id}?language=en-US`
          )
          setTvSeasons(data.seasons || [])
          // Update the parent and database with the full TV metadata
          if (data.number_of_seasons && data.seasons) {
            updateTVMetadata(
              selectedItem.id,
              data.number_of_seasons,
              data.seasons
            )
          }
        } catch (error) {
          console.error('Error fetching TV seasons:', error)
          setTvSeasons([])
        } finally {
          // Loading complete
        }
      } else if (
        selectedItem &&
        selectedItem.media_type === 'tv' &&
        selectedItem.tmdb_data.seasons
      ) {
        setTvSeasons(selectedItem.tmdb_data.seasons)
      }
    }

    fetchTVSeasons()
  }, [selectedItem, isDialogOpen, updateTVMetadata])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='lg:min-w-2xl w-[95%] max-h-[70vh] lg:max-h-[50vh] p-0 space-y-0 gap-0 scrollbar-hide overflow-y-auto lg:overflow-hidden'>
        {selectedItem && (
          <div className='flex flex-col md:flex-row gap-6 h-full'>
            <div className='flex justify-center md:justify-start lg:flex-shrink-0'>
              <Image
                src={
                  selectedItem.poster_path
                    ? `https://image.tmdb.org/t/p/w300${selectedItem.poster_path}`
                    : '/placeholder.svg'
                }
                alt={
                  selectedItem.media_type === 'movie'
                    ? selectedItem.tmdb_data.title || 'Movie poster'
                    : selectedItem.tmdb_data.name || 'TV poster'
                }
                width={500}
                height={300}
                quality={100}
                className='rounded-t-lg md:rounded-l-lg lg:rounded-l-lg lg:rounded-t-none object-cover w-full h-72 md:w-52 md:h-78 lg:w-64 lg:h-full flex-shrink-0'
              />
            </div>

            <div className='flex-1 space-y-4 text-left px-4 pb-4 md:text-left lg:py-4 lg:overflow-y-auto lg:scrollbar-hide lg:max-h-[50vh]'>
              <div className='space-y-3'>
                <DialogTitle className='text-lg font-semibold'>
                  {selectedItem.media_type === 'movie'
                    ? selectedItem.tmdb_data.title || 'Untitled Movie'
                    : selectedItem.tmdb_data.name || 'Untitled Series'}
                </DialogTitle>

                <div className='flex justify-start items-start gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <Star className='size-4 fill-yellow-400 text-yellow-400' />
                    <span className='font-medium'>
                      {(selectedItem.tmdb_data.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='size-4' />
                    <span>
                      {new Date(
                        selectedItem.media_type === 'movie'
                          ? selectedItem.tmdb_data.release_date || ''
                          : selectedItem.tmdb_data.first_air_date || ''
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <Badge variant='outline'>
                    {(
                      selectedItem.tmdb_data.original_language || ''
                    ).toUpperCase()}
                  </Badge>
                </div>
                <DialogDescription className='text-sm leading-relaxed'>
                  {selectedItem.tmdb_data.overview}
                </DialogDescription>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {isInWatchlist ? (
                  <Button
                    size={'lg'}
                    variant='destructive'
                    onClick={() => removeFromWatchlist(selectedItem.id)}
                    disabled={isRemovingFromWatchlist}
                  >
                    {isRemovingFromWatchlist
                      ? 'Removing...'
                      : 'Remove from Watchlist'}
                  </Button>
                ) : (
                  <Button
                    size={'lg'}
                    variant='default'
                    onClick={() => addToWatchlist(selectedItem)}
                  >
                    Add to Watchlist
                  </Button>
                )}
                <Button size={'lg'} variant='outline' asChild>
                  <Link
                    href={`/${selectedItem.media_type}/${selectedItem.tmdb_id}`}
                  >
                    <Info className='size-4' />
                    View Details
                  </Link>
                </Button>
              </div>
              {isInWatchlist && (
                <>
                  {selectedItem.media_type === 'movie' ? (
                    <MarkMovieSeenButton
                      watchlistId={selectedItem.id}
                      isSeen={selectedItem.is_seen}
                      title={selectedItem.tmdb_data.title || 'Untitled Movie'}
                      onToggle={(newStatus) =>
                        handleMovieSeenToggle(selectedItem.id, newStatus)
                      }
                    />
                  ) : (
                    <TVProgressTracker
                      watchlistId={selectedItem.id}
                      tmdbId={selectedItem.tmdb_id}
                      seasons={tvSeasons}
                      seenEpisodes={selectedItem.seen_episodes}
                      completedSeasons={selectedItem.completed_seasons}
                      onProgressUpdate={(seenEpisodes, completedSeasons) =>
                        handleTVProgressUpdate(
                          selectedItem.id,
                          seenEpisodes,
                          completedSeasons
                        )
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
