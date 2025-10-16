'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface HeroSliderProps {
  moviesList: Movie[] | null
  currentSlide: number
  setCurrentSlide: (slide: number) => void
  nextSlide: () => void
  prevSlide: () => void
  addToWatchlist: (movie: Movie) => void
  isInWatchlist: (movieId: number) => boolean
  addingToWatchlist: boolean
}

export default function HeroSlider({
  moviesList,
  currentSlide,
  setCurrentSlide,
  nextSlide,
  prevSlide,
  addToWatchlist,
  isInWatchlist,
  addingToWatchlist,
}: HeroSliderProps) {
  const heroMovies = moviesList?.slice(0, 5) || []

  if (!moviesList || moviesList.length === 0) {
    return null
  }

  return (
    <section className='relative h-[70vh] overflow-hidden rounded-2xl'>
      <div className='relative w-full h-full'>
        <section className='relative h-[70vh] overflow-hidden rounded-2xl mx-5 lg:mx-10'>
          <div className='relative w-full h-full'>
            <div
              className='flex h-full transition-transform duration-700 ease-in-out'
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroMovies.map((movie: Movie, index: number) => (
                <div
                  key={movie.id}
                  className='flex-shrink-0 w-full h-full relative'
                >
                  <Image
                    src={
                      movie.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                        : '/placeholder.svg?height=600&width=1200&text=No+Image'
                    }
                    alt={movie.title || movie.name || 'Media backdrop'}
                    fill
                    className='object-cover'
                    priority={index === 0}
                  />
                  <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />

                  {/* Content */}
                  <div className='absolute inset-0 flex items-center z-10'>
                    <div className='container mx-auto px-8 lg:px-16'>
                      <div className='max-w-2xl space-y-6'>
                        <div className='space-y-2'>
                          <Badge className='bg-blue-600 hover:bg-blue-700 text-white rounded-3xl px-3 py-1'>
                            Trending Now
                          </Badge>
                          <h1 className='text-4xl lg:text-6xl font-bold text-white leading-tight'>
                            {movie.title || movie.name}
                          </h1>
                        </div>

                        <div className='flex items-center gap-4 text-white/90'>
                          <div className='flex items-center gap-1'>
                            <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                            <span className='font-semibold'>
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {movie.release_date || movie.first_air_date
                                ? format(
                                    parseISO(
                                      movie.release_date ||
                                        movie.first_air_date ||
                                        ''
                                    ),
                                    'MMM d, yyyy'
                                  )
                                : 'N/A'}
                            </span>
                          </div>
                          <Badge
                            variant='outline'
                            className='text-white border-white/30'
                          >
                            {movie.original_language.toUpperCase()}
                          </Badge>
                        </div>

                        <p className='text-lg text-white/90 leading-relaxed line-clamp-3 max-w-xl'>
                          {movie.overview}
                        </p>

                        <div className='flex gap-4'>
                          <Button
                            size='lg'
                            className={
                              isInWatchlist(movie.id)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                            onClick={() => addToWatchlist(movie)}
                            disabled={
                              addingToWatchlist || isInWatchlist(movie.id)
                            }
                          >
                            <Plus className='h-5 w-5' />
                            {addingToWatchlist
                              ? 'Adding...'
                              : isInWatchlist(movie.id)
                              ? 'Added to Watchlist'
                              : 'Add to Watchlist'}
                          </Button>
                          <Button
                            size='lg'
                            variant='outline'
                            className='text-black border-white/30 hover:bg-white/80'
                            asChild
                          >
                            <Link
                              href={`/${movie.title ? 'movie' : 'tv'}/${
                                movie.id
                              }`}
                              prefetch={false}
                            >
                              <Info className='h-5 w-5' />
                              More Info
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>{' '}
          {/* Navigation Arrows */}
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white hover:text-white cursor-pointer border-none z-20'
            onClick={prevSlide}
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white hover:text-white cursor-pointer border-none z-20'
            onClick={nextSlide}
          >
            <ChevronRight className='h-6 w-6' />
          </Button>
        </section>
      </div>

      {/* Slide Indicators */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'>
        {heroMovies.map((_, index) => (
          <button
            key={index}
            className={`relative transition-all duration-300 ease-in-out ${
              index === currentSlide
                ? 'w-8 h-3 bg-white shadow-lg'
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            } rounded-full overflow-hidden`}
            onClick={() => setCurrentSlide(index)}
          >
            {index === currentSlide && (
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse' />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
