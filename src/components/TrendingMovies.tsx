'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Calendar, Info, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface TrendingMoviesProps {
  moviesList: Movie[] | null
  isInWatchlist: (movieId: number) => boolean
  addToWatchlist: (movie: Movie) => void
  addingToWatchlist: boolean
}

export default function TrendingMovies({
  moviesList,
  isInWatchlist,
  addToWatchlist,
  addingToWatchlist,
}: TrendingMoviesProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const genreMap: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
  }

  const openDialog = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsDialogOpen(true)
  }
  return (
    <section className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          Trending Movies
        </h2>
        <Link href={'/discover'}>
          <Button variant='ghost' size='sm'>
            View All
          </Button>
        </Link>
      </div>

      <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto items-stretch'>
        {moviesList?.slice(0, 20).map((item: Movie) => (
          <div
            key={item.id}
            className='snap-start shrink-0 w-64 group cursor-pointer'
            onClick={() => openDialog(item)}
          >
            <div className='relative mb-3 overflow-hidden rounded-lg'>
              <Image
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : '/placeholder.svg'
                }
                alt={item.title || 'Movie poster'}
                width={500}
                height={750}
                className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
              />
            </div>
            <div className='space-y-1'>
              <h3 className='font-semibold text-base line-clamp-1'>
                {item.title}
              </h3>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>
                  {item.release_date
                    ? format(parseISO(item.release_date), 'MMM d, yyyy')
                    : 'N/A'}
                </span>
                <span className='line-clamp-1'>
                  {item.genre_ids
                    .slice(0, 2)
                    .map((id) => genreMap[id])
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='lg:min-w-2xl w-[95%] max-h-[70vh] lg:max-h-[50vh] p-0 space-y-0 gap-0 overflow-y-auto lg:overflow-hidden scrollbar-hide'>
          {selectedMovie && (
            <div className='flex flex-col md:flex-row gap-6 h-full'>
              <div className='flex justify-center md:justify-start lg:flex-shrink-0'>
                <Image
                  src={
                    selectedMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                      : '/placeholder.svg'
                  }
                  alt={selectedMovie.title || 'Movie poster'}
                  width={200}
                  height={300}
                  className='rounded-t-lg md:rounded-l-lg lg:rounded-l-lg lg:rounded-t-none object-cover w-full h-72 md:w-52 md:h-78 lg:w-64 lg:h-full flex-shrink-0'
                />
              </div>
              <div className='flex-1 space-y-4 text-left px-4 pb-4 md:text-left lg:py-4 lg:overflow-y-auto lg:scrollbar-hide lg:max-h-[50vh]'>
                <div className='space-y-3'>
                  <DialogTitle className='text-lg font-semibold'>
                    {selectedMovie.title}
                  </DialogTitle>
                  <div className='flex justify-start items-start gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Star className='size-4 fill-yellow-400 text-yellow-400' />
                      <span className='font-medium'>
                        {selectedMovie.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Calendar className='size-4' />
                      <span>
                        {selectedMovie.release_date
                          ? format(
                              parseISO(selectedMovie.release_date),
                              'MMM d, yyyy'
                            )
                          : 'N/A'}
                      </span>
                    </div>
                    <Badge variant='outline'>
                      {selectedMovie.original_language.toUpperCase()}
                    </Badge>
                  </div>
                  <DialogDescription className='text-sm leading-relaxed'>
                    {selectedMovie.overview}
                  </DialogDescription>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <Button
                    size={'lg'}
                    variant='default'
                    onClick={() => addToWatchlist(selectedMovie)}
                    disabled={
                      addingToWatchlist || isInWatchlist(selectedMovie.id)
                    }
                  >
                    {addingToWatchlist
                      ? 'Adding...'
                      : isInWatchlist(selectedMovie.id)
                      ? 'Added to Watchlist'
                      : 'Add to Watchlist'}
                  </Button>
                  <Button size={'lg'} variant='outline' asChild>
                    <Link href={`/movie/${selectedMovie.id}`}>
                      <Info className='size-4' />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
