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
    completedSeasons: number[],
  ) => void
  updateTVMetadata: (
    watchlistId: number,
    numberOfSeasons: number,
    seasons: TMDBSeason[],
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
            `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${selectedItem.tmdb_id}?language=en-US`,
          )
          setTvSeasons(data.seasons || [])
          // Update the parent and database with the full TV metadata
          if (data.number_of_seasons && data.seasons) {
            updateTVMetadata(
              selectedItem.id,
              data.number_of_seasons,
              data.seasons,
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
      <DialogContent className='max-w-4xl sm:max-w-2xl w-[95%] sm:w-full shadow-2xl p-0 overflow-hidden bg-zinc-950 border-white/10'>
        {selectedItem && (
          <div className='flex flex-col md:flex-row h-full max-h-[50dvh]'>
            <div className='relative w-full md:w-2/5 aspect-[16/9] md:aspect-auto h-48 md:h-auto overflow-hidden'>
              <Image
                src={
                  selectedItem.poster_path
                    ? `https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`
                    : '/placeholder.svg'
                }
                alt={
                  selectedItem.media_type === 'movie'
                    ? selectedItem.tmdb_data.title || 'Movie poster'
                    : selectedItem.tmdb_data.name || 'TV poster'
                }
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent' />
            </div>

            <div className='flex-1 p-5 md:p-12 overflow-y-auto scrollbar-hide space-y-4'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center gap-2 md:gap-3'>
                  <Badge className='bg-primary text-white border-none px-2 md:px-3 py-1 text-xs md:text-xs font-medium '>
                    {selectedItem.media_type}
                  </Badge>
                  {selectedItem.tmdb_data.genres?.slice(0, 3).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant='outline'
                      className='border-white/10 text-gray-300 text-[10px] md:text-xs font-medium px-2 md:px-3 py-1'
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <DialogTitle className='text-xl md:text-3xl lg:text-4xl font-semibold italic text-white leading-tight'>
                  {selectedItem.media_type === 'movie'
                    ? selectedItem.tmdb_data.title || 'Untitled Movie'
                    : selectedItem.tmdb_data.name || 'Untitled Series'}
                </DialogTitle>

                <div className='flex flex-wrap items-center gap-4 md:gap-6 text-xs text-gray-300'>
                  <div className='flex items-center gap-2'>
                    <Star className='size-3 md:size-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-white font-medium'>
                      {(selectedItem.tmdb_data.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='size-3 md:size-4' />
                    <span>
                      {new Date(
                        selectedItem.media_type === 'movie'
                          ? selectedItem.tmdb_data.release_date || ''
                          : selectedItem.tmdb_data.first_air_date || '',
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <Badge
                    variant='outline'
                    className='border-white/20 uppercase rounded-md font-medium text-[10px] md:text-xs h-5 md:h-6 px-1.5 md:px-2'
                  >
                    {(
                      selectedItem.tmdb_data.original_language || ''
                    ).toUpperCase()}
                  </Badge>
                </div>
              </div>

              <DialogDescription className='text-sm text-gray-300 leading-relaxed line-clamp-4'>
                {selectedItem.tmdb_data.overview}
              </DialogDescription>

              <div className='flex flex-col gap-4'>
                <div className='flex flex-col sm:grid sm:grid-cols-2 gap-3 md:gap-4'>
                  {isInWatchlist ? (
                    <Button
                      size='lg'
                      variant='destructive'
                      className='bg-red-600 hover:bg-red-700 transition-all active:scale-95'
                      onClick={() => removeFromWatchlist(selectedItem.id)}
                      disabled={isRemovingFromWatchlist}
                    >
                      {isRemovingFromWatchlist ? 'Removing...' : 'Remove'}
                    </Button>
                  ) : (
                    <Button
                      size='lg'
                      className='bg-primary hover:bg-primary-hover transition-all active:scale-95'
                      onClick={() => addToWatchlist(selectedItem)}
                    >
                      Add to Watchlist
                    </Button>
                  )}
                  <Button
                    size='lg'
                    variant='outline'
                    className='text-white border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95'
                    asChild
                  >
                    <Link
                      href={`/${selectedItem.media_type}/${selectedItem.tmdb_id}`}
                    >
                      <Info className='mr-2 size-4 md:size-5' />
                      Details
                    </Link>
                  </Button>
                </div>

                {isInWatchlist && (
                  <div className=''>
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
                            completedSeasons,
                          )
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
