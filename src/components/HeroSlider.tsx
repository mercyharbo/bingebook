'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Movie } from '@/types/movie'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
  Plus,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GENRE_MAP } from '@/lib/constants'

interface HeroSliderProps {
  moviesList: Movie[] | null
  currentSlide: number
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void
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
  const heroMovies = moviesList?.slice(0, 10) || []

  if (!moviesList || moviesList.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[600px] mt-4 px-6 lg:px-12 overflow-hidden">
      <div className="relative w-full h-full overflow-hidden rounded-lg group/slider">
        <div
          className="flex h-full gap-0 transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
          style={{ transform: `translate3d(calc(-100% * ${currentSlide}), 0, 0)` }}
        >
          {heroMovies.map((movie: Movie, index: number) => (
            <div
              key={movie.id}
              className="flex-none w-full min-w-full h-full relative overflow-hidden"
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                alt={movie.title || movie.name || 'Media backdrop'}
                fill
                className="object-cover scale-105 group-hover/slider:scale-100 transition-transform duration-[2s]"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-20 z-10 select-none">
                <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
                  <div className="space-y-4">
                    <Badge className="glass-dark px-4 py-1.5 rounded-full text-white font-medium border-white/10 gap-2">
                      <Flame className="size-4 text-orange-500 fill-orange-500" />
                      Now Trending
                    </Badge>
                    
                    <div className="flex gap-2">
                       {movie.genre_ids?.slice(0, 2).map(id => (
                         <span key={id} className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-white/80 font-medium">
                           {GENRE_MAP[id]}
                         </span>
                       ))}
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] text-glow line-clamp-2">
                      {movie.title || movie.name}
                    </h1>
                  </div>

                  <p className="text-lg text-white/70 leading-relaxed line-clamp-2 max-w-xl font-medium">
                    {movie.overview}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      size="lg"
                      className={`h-12 px-8 rounded-lg transition-all active:scale-95 shadow-2xl gap-3 font-medium text-base ${
                        isInWatchlist(movie.id)
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/40'
                      }`}
                      onClick={() => addToWatchlist(movie)}
                      disabled={addingToWatchlist || isInWatchlist(movie.id)}
                    >
                      {isInWatchlist(movie.id) ? (
                        <>
                          <Info className="size-5" />
                          In Watchlist
                        </>
                      ) : (
                        <>
                          <Plus className="size-5" />
                          {addingToWatchlist ? 'Adding...' : 'Add to Watchlist'}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="ghost"
                      className="h-12 px-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all active:scale-95 font-medium"
                      asChild
                    >
                      <Link href={`/${movie.title ? 'movie' : 'tv'}/${movie.id}`}>
                        <Info className="size-5" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Navigation */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-6 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-12 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/5 active:scale-90"
            onClick={prevSlide}
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-12 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/5 active:scale-90"
            onClick={nextSlide}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        {/* High-fidelity Slide Indicators */}
        <div className="absolute bottom-10 right-12 flex items-center gap-3 z-20">
          {heroMovies.map((_, index: number) => (
            <button
              key={index}
              className="group relative flex items-center h-4 transition-all"
              onClick={() => setCurrentSlide(index)}
            >
              <div 
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide 
                    ? 'w-10 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/30 group-hover:bg-white/50'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
