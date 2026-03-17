'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GENRE_MAP } from '@/lib/constants'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Check, Plus, Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import MediaItemDialog from './MediaItemDialog'

interface MovieCardProps {
  movie: Movie
  isInWatchlist: boolean
  addToWatchlist: () => Promise<void>
  addingToWatchlist: boolean
}

export default function MovieCard({
  movie,
  isInWatchlist,
  addToWatchlist,
  addingToWatchlist,
}: MovieCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const title = movie.title || movie.name || 'Untitled'
  const date = movie.release_date || movie.first_air_date || 'N/A'
  const type = movie.title ? 'movie' : 'tv'

  return (
    <>
      <Card
        className='group relative gap-0 bg-white/5 rounded-md backdrop-blur-sm border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] py-0'
        onClick={() => setIsDialogOpen(true)}
      >
        <div className='relative aspect-[2/3] rounded-t-md overflow-hidden'>
          <Image
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '/placeholder.svg'
            }
            alt={title || 'Media poster'}
            fill
            className='object-cover transition-transform duration-700 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

          <div className='absolute top-4 right-4 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100'>
            <Button
              size='icon'
              className={`rounded-lg shadow-xl ${isInWatchlist ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
              onClick={(e) => {
                e.stopPropagation()
                if (!isInWatchlist) addToWatchlist()
              }}
              disabled={addingToWatchlist || isInWatchlist}
            >
              {isInWatchlist ? (
                <Check className='size-5' />
              ) : (
                <Plus className='size-5' />
              )}
            </Button>
          </div>

          <div className='absolute bottom-4 left-4 right-4 translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150'>
            <div className='flex items-center gap-3'>
              <div className='px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5'>
                <Star className='size-3.5 fill-yellow-400 text-yellow-400' />
                <span className='text-xs font-medium text-white'>
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              <Badge className='bg-primary/80 backdrop-blur-md text-[10px] uppercase font-medium border-none'>
                {type}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className='space-y-2 py-2 px-4 border-none'>
          <h3 className='font-medium text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors text-base'>
            {title}
          </h3>
          <div className='flex items-center justify-between text-[11px] font-medium text-white/40'>
            <span>{date ? format(parseISO(date), 'yyyy') : 'N/A'}</span>
            <span className='line-clamp-1 max-w-[60%]'>
              {movie.genre_ids
                ?.slice(0, 1)
                .map((id: number) => GENRE_MAP[id])
                .join('') || 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>

      <MediaItemDialog
        movie={movie}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isInWatchlist={isInWatchlist}
        addToWatchlist={addToWatchlist}
        addingToWatchlist={addingToWatchlist}
        type={type}
        title={title}
        date={date}
      />
    </>
  )
}
