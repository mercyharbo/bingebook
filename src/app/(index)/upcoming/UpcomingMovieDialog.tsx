'use client'

import { Check, Loader2, Plus, Star } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Movie, MovieOnly } from '@/types/movie'

interface UpcomingMovieDialogProps {
  selectedMovie: MovieOnly | null
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  handleViewDetails: () => void
  addToWatchlist: (movie: Movie) => void
  isInWatchlist: (movieId: number) => boolean
  addingToWatchlist: boolean
}

export default function UpcomingMovieDialog({
  selectedMovie,
  isModalOpen,
  setIsModalOpen,
  handleViewDetails,
  addToWatchlist,
  isInWatchlist,
  addingToWatchlist,
}: UpcomingMovieDialogProps) {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className='lg:min-w-2xl w-[95%] max-h-[70vh] lg:max-h-[50vh] p-0 space-y-0 gap-0 scrollbar-hide overflow-y-auto lg:overflow-hidden'>
        {selectedMovie && (
          <div className='flex flex-col lg:flex-row gap-6 h-full'>
            <div className='flex justify-center lg:justify-start lg:flex-shrink-0'>
              <Image
                src={
                  selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                    : '/sample-poster.jpg'
                }
                alt={selectedMovie.title}
                width={150}
                height={200}
                className='rounded-t-lg lg:rounded-l-lg lg:rounded-t-none object-cover w-full h-[250px] lg:w-64 lg:h-full flex-shrink-0'
              />
            </div>

            <div className='flex-1 space-y-4 px-4 pb-10 lg:py-4 lg:overflow-y-auto lg:scrollbar-hide lg:max-h-[50vh]'>
              <div className='flex-1 space-y-3'>
                <DialogTitle className='text-lg font-bold'>
                  {selectedMovie?.title}
                </DialogTitle>

                <div className='flex flex-wrap gap-2'>
                  {selectedMovie.vote_average > 0 && (
                    <Badge className='bg-yellow-500 text-black text-xs'>
                      <Star className='h-3 w-3 fill-current mr-1' />
                      {selectedMovie.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  <Badge variant='outline' className='text-xs'>
                    {selectedMovie.original_language.toUpperCase()}
                  </Badge>
                  <Badge variant='secondary' className='text-xs'>
                    {new Date(selectedMovie.release_date).toLocaleDateString()}
                  </Badge>
                  {selectedMovie.adult && (
                    <Badge variant='destructive' className='text-xs'>
                      18+
                    </Badge>
                  )}
                </div>
              </div>

              <DialogDescription className='text-sm text-muted-foreground leading-relaxed'>
                {selectedMovie.overview || 'No description available.'}
              </DialogDescription>

              {/* Buttons */}
              <div className='flex flex-wrap gap-2 pt-2'>
                <Button
                  onClick={handleViewDetails}
                  className='flex-1 min-w-[150px]'
                >
                  View Full Details
                </Button>
                <Button
                  variant='outline'
                  onClick={() => addToWatchlist(selectedMovie)}
                  size='icon'
                  disabled={
                    isInWatchlist(selectedMovie.id) && addingToWatchlist
                  }
                >
                  {isInWatchlist(selectedMovie.id) ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <div className=''>
                      {addingToWatchlist ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Plus className='h-4 w-4' />
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
