'use client'

import { Check, Loader2, Plus, Star } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
      <DialogContent className='lg:max-w-[500px] h-[60vh] p-0 overflow-y-auto scrollbar-hide'>
        {selectedMovie && (
          <div className='space-y-4'>
            <div className='flex-shrink-0 mx-auto sm:mx-0 w-full'>
              <Image
                src={
                  selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                    : '/sample-poster.jpg'
                }
                alt={selectedMovie.title}
                width={150}
                height={200}
                className='rounded-t-lg object-cover w-full h-[250px]'
              />
            </div>

            <div className='space-y-4 px-4 pb-10'>
              <div className='flex-1 space-y-3'>
                <DialogTitle className='text-2xl font-bold'>
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

              <p className='text-sm text-muted-foreground leading-relaxed'>
                {selectedMovie.overview || 'No description available.'}
              </p>

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
