'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { GENRE_MAP } from '@/lib/constants'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Calendar, Info, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface MediaItemDialogProps {
  movie: Movie
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  isInWatchlist: boolean
  addToWatchlist: () => Promise<void>
  addingToWatchlist: boolean
  type: 'movie' | 'tv'
  title: string
  date: string
}

export default function MediaItemDialog({
  movie,
  isDialogOpen,
  setIsDialogOpen,
  isInWatchlist,
  addToWatchlist,
  addingToWatchlist,
  type,
  title,
  date,
}: MediaItemDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='max-w-4xl sm:max-w-2xl w-[95%] sm:w-full p-0 overflow-hidden bg-zinc-950 border-white/10 '>
        <div className='flex flex-col md:flex-row h-full max-h-[50dvh]'>
          <div className='relative w-full md:w-2/5 aspect-[16/9] md:aspect-auto h-48 md:h-auto overflow-hidden'>
            <Image
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : '/placeholder.svg'
              }
              alt={title || 'Media poster'}
              fill
              className='object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent' />
          </div>

          <div className='flex-1 p-5 md:p-12 overflow-y-auto scrollbar-hide space-y-6 md:space-y-8'>
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center gap-2 md:gap-3'>
                <Badge className='bg-primary text-white border-none px-2 md:px-3 py-1 text-xs capitalize font-medium '>
                  {type}
                </Badge>
                {movie.genre_ids?.slice(0, 3).map((id: number) => (
                  <Badge
                    key={id}
                    variant='outline'
                    className='border-white/10 text-gray-300 capitalize text-xs font-medium px-2 md:px-3 py-1'
                  >
                    {GENRE_MAP[id]}
                  </Badge>
                ))}
              </div>

              <DialogTitle className='text-xl md:text-3xl lg:text-4xl font-semibold italic text-white'>
                {title}
              </DialogTitle>

              <div className='flex flex-wrap items-center gap-4 md:gap-6 text-xs text-gray-300'>
                <div className='flex items-center gap-2'>
                  <Star className='size-3 md:size-4 fill-yellow-400 text-yellow-400' />
                  <span className='text-white font-medium'>
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='size-3 md:size-4' />
                  <span>
                    {date ? format(parseISO(date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='border-white/20 uppercase rounded-md font-medium text-[10px] md:text-xs h-5 md:h-6 px-1.5 md:px-2'
                >
                  {movie.original_language?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <DialogDescription className='text-sm text-gray-300 leading-relaxed line-clamp-4 md:line-clamp-none'>
              {movie.overview}
            </DialogDescription>

            <div className='flex flex-col sm:grid sm:grid-cols-2 gap-3 md:gap-4'>
              <Button
                size='lg'
                className={` transition-all active:scale-95 ${isInWatchlist ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20'}`}
                onClick={() => {
                  if (!isInWatchlist) addToWatchlist()
                }}
                disabled={addingToWatchlist || isInWatchlist}
              >
                {addingToWatchlist
                  ? 'Adding...'
                  : isInWatchlist
                    ? 'In Watchlist'
                    : 'Add to Watchlist'}
              </Button>
              <Button
                size='lg'
                variant='outline'
                className=' text-white border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95'
                asChild
              >
                <Link href={`/${type}/${movie.id}`}>
                  <Info className='mr-2 size-4 md:size-5' />
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
