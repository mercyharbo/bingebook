'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Info, Plus, Star } from 'lucide-react'
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
            className='snap-start shrink-0 w-72'
            onClick={() => openDialog(item)}
          >
            <Card className='group gap-0 hover:shadow-lg transition-all h-full flex flex-col duration-300 overflow-hidden p-0 cursor-pointer'>
              <div className='relative'>
                <Image
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : '/placeholder.svg'
                  }
                  alt={item.name || 'TV Show poster'}
                  width={500}
                  height={500}
                  className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
              </div>
              <CardContent className='p-3 space-y-2 flex-1 flex flex-col justify-between'>
                <h3 className='font-semibold text-lg line-clamp-2 mb-1'>
                  {item.name}
                </h3>
                <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                  {item.overview}
                </p>
                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='font-medium'>
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span>
                      {item.first_air_date
                        ? format(parseISO(item.first_air_date), 'yyyy')
                        : 'N/A'}
                    </span>
                    <span className='text-xs bg-muted px-2 py-1 rounded'>
                      {item.original_language.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                        <span className='h-4 w-4' />
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
                      <Plus className='h-4 w-4 mr-2' />
                      {addingToWatchlist
                        ? 'Adding...'
                        : isInWatchlist(selectedShow.id)
                        ? 'Added to Watchlist'
                        : 'Add to Watchlist'}
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full sm:w-auto'
                      asChild
                    >
                      <Link href={`/tv/${selectedShow.id}`}>
                        <Info className='h-4 w-4 mr-2' />
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
