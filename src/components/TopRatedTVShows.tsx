'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Calendar, Info, Plus, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface TopRatedTVShowsProps {
  topRated: Movie[] | null
  isInWatchlist: (movieId: number) => boolean
  addToWatchlist: (movie: Movie) => void
  addingToWatchlist: boolean
}

export default function TopRatedTVShows({
  topRated,
  isInWatchlist,
  addToWatchlist,
  addingToWatchlist,
}: TopRatedTVShowsProps) {
  const [selectedShow, setSelectedShow] = useState<Movie | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = (show: Movie) => {
    setSelectedShow(show)
    setIsDialogOpen(true)
  }

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

  return (
    <section className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          Top Rated TV Shows
          <Star className='h-6 w-6 text-primary' />
        </h2>
        <Link href={'/discover'}>
          <Button variant='ghost' size='sm'>
            View All
          </Button>
        </Link>
      </div>
      <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto items-stretch'>
        {topRated?.slice(0, 10).map((item: Movie) => (
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
                alt={item.name || 'TV Show poster'}
                width={500}
                height={750}
                className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
              />
            </div>
            <div className='space-y-1'>
              <h3 className='font-semibold text-base line-clamp-1'>
                {item.name}
              </h3>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>
                  {item.first_air_date
                    ? format(parseISO(item.first_air_date), 'MMM d, yyyy')
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
        <DialogContent className='lg:min-w-2xl w-[95%] max-h-[70vh] overflow-y-auto scrollbar-hide'>
          {selectedShow && (
            <DialogHeader>
              <div className='flex flex-col md:flex-row gap-6'>
                <div className='flex justify-center md:justify-start'>
                  <Image
                    src={
                      selectedShow.poster_path
                        ? `https://image.tmdb.org/t/p/w300${selectedShow.poster_path}`
                        : '/placeholder.svg'
                    }
                    alt={selectedShow.name || 'TV Show poster'}
                    width={200}
                    height={300}
                    className='rounded-lg object-cover w-48 h-72 md:w-52 md:h-78 flex-shrink-0'
                  />
                </div>
                <div className='flex-1 space-y-4 text-center md:text-left'>
                  <div>
                    <DialogTitle className='text-2xl mb-2'>
                      {selectedShow.name}
                    </DialogTitle>
                    <div className='flex justify-center lg:justify-start items-center gap-4 text-sm text-muted-foreground mb-4'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                        <span className='font-medium'>
                          {selectedShow.vote_average.toFixed(1)}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {selectedShow.first_air_date
                            ? format(
                                parseISO(selectedShow.first_air_date),
                                'MMM d, yyyy'
                              )
                            : 'N/A'}
                        </span>
                      </div>
                      <Badge variant='outline'>
                        {selectedShow.original_language.toUpperCase()}
                      </Badge>
                    </div>
                    <DialogDescription className='text-base leading-relaxed'>
                      {selectedShow.overview}
                    </DialogDescription>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-3 pt-4 items-center md:items-start'>
                    <Button
                      size={'lg'}
                      className={`w-full sm:w-auto ${
                        isInWatchlist(selectedShow.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => addToWatchlist(selectedShow)}
                      disabled={
                        addingToWatchlist || isInWatchlist(selectedShow.id)
                      }
                    >
                      <Plus className='size-4' />
                      {addingToWatchlist
                        ? 'Adding...'
                        : isInWatchlist(selectedShow.id)
                        ? 'Added to Watchlist'
                        : 'Add to Watchlist'}
                    </Button>
                    <Button
                      size={'lg'}
                      variant='outline'
                      className='w-full sm:w-auto'
                      asChild
                    >
                      <Link href={`/tv/${selectedShow.id}`}>
                        <Info className='size-4' />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
