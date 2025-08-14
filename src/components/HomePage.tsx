'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import type { Movie } from '@/types/movie'
import { format, isAfter, parseISO } from 'date-fns'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

// Hero Section Skeleton Component
const HeroSkeleton = () => (
  <section className='relative h-[70vh] overflow-hidden rounded-2xl mx-5 lg:mx-10'>
    <Skeleton className='absolute inset-0 w-full h-full rounded-2xl' />
    <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />
    <div className='absolute inset-0 flex items-center z-10'>
      <div className='container mx-auto px-8 lg:px-16'>
        <div className='max-w-2xl space-y-6'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-32 bg-white/20' />
            <Skeleton className='h-16 w-96 bg-white/20' />
          </div>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-6 w-16 bg-white/20' />
            <Skeleton className='h-6 w-24 bg-white/20' />
            <Skeleton className='h-6 w-12 bg-white/20' />
          </div>
          <Skeleton className='h-20 w-full max-w-xl bg-white/20' />
          <div className='flex gap-4'>
            <Skeleton className='h-12 w-40 bg-white/20' />
            <Skeleton className='h-12 w-32 bg-white/20' />
          </div>
        </div>
      </div>
    </div>
    {/* Navigation Arrows Skeletons */}
    <Skeleton className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-white/20' />
    <Skeleton className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-white/20' />
    {/* Slide Indicators Skeleton */}
    <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className='w-3 h-3 rounded-full bg-white/20' />
      ))}
    </div>
  </section>
)

// Card Skeleton Component
const CardSkeleton = () => (
  <div className='snap-start shrink-0 w-72'>
    <Card className='overflow-hidden p-0'>
      <Skeleton className='w-full h-48' />
      <CardContent className='p-2 space-y-2'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-8' />
            <Skeleton className='h-4 w-20' />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Section Skeleton Component
const SectionSkeleton = () => (
  <section className='space-y-5'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-6 w-40' />
        <Skeleton className='h-6 w-6 rounded' />
      </div>
      <Skeleton className='h-8 w-16' />
    </div>
    <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto'>
      {Array.from({ length: 5 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  </section>
)

export default function HomePageComp() {
  const supabase = createClient()
  const [topRated, setTopRated] = useState<Movie[] | null>(null)
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[] | null>(null)
  const [moviesList, setMoviesList] = useState<Movie[] | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [watchlistIds, setWatchlistIds] = useState<number[]>([])

  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

  // Fetch watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError || !sessionData.session) return

      const userId = sessionData.session.user.id
      const { data, error } = await supabase
        .from('watchlist')
        .select('tmdb_id')
        .eq('user_id', userId)
        .eq('media_type', 'movie')

      if (error) {
        console.error('Error fetching watchlist:', error)
        return
      }

      const ids = data.map((item: { tmdb_id: number }) => item.tmdb_id)
      setWatchlistIds(ids)
    }

    fetchWatchlist()
  }, [supabase])

  const { isLoading: topRatedLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/tv/top_rated`,
    fetcher,
    {
      onSuccess: (data) => {
        setTopRated(data.results)
      },
    }
  )

  const { isLoading: upcomingLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
      },
    }
  )

  const { isLoading: moviesLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/trending/movie/week`,
    fetcher,
    {
      onSuccess: (data) => {
        setMoviesList(data.results)
      },
    }
  )

  // Auto-slide functionality
  useEffect(() => {
    if (!moviesList || moviesList.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(moviesList.length, 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [moviesList])

  const nextSlide = () => {
    if (!moviesList) return
    setCurrentSlide((prev) => (prev + 1) % Math.min(moviesList.length, 5))
  }

  const prevSlide = () => {
    if (!moviesList) return
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.min(moviesList.length, 5)) %
        Math.min(moviesList.length, 5)
    )
  }

  const unreleasedMovies = (upcomingMovies ?? []).filter(
    (item: Movie): item is Movie & { release_date: string } =>
      item.release_date != null &&
      isAfter(
        parseISO(item.release_date),
        new Date('2025-08-06T02:49:00+01:00')
      )
  )

  const heroMovies = moviesList?.slice(0, 5) || []

  const addToWatchlist = async (movie: Movie) => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      toast.error('Please log in to add to watchlist')
      return
    }

    setAddingToWatchlist(true)

    const userId = sessionData.session.user.id
    const tmdbData = { ...movie }
    const { error } = await supabase.from('watchlist').insert({
      user_id: userId,
      tmdb_id: movie?.id,
      media_type: 'movie',
      tmdb_data: tmdbData,
      poster_path: movie?.poster_path,
      is_seen: false,
      seen_episodes: {},
      completed_seasons: [],
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })

    if (error) {
      console.error('Error adding to watchlist:', error)
      toast.error('Failed to add to watchlist')
      setAddingToWatchlist(false)
    } else {
      toast.success('Added to watchlist successfully')
      setWatchlistIds((prev) => [...prev, movie.id]) // Update watchlistIds locally
      setAddingToWatchlist(false)
    }
  }

  // Check if movie is in watchlist
  const isInWatchlist = (movieId: number) => watchlistIds.includes(movieId)

  return (
    <main className='space-y-10 pt-5'>
      {/* Hero Section */}
      {moviesLoading || !moviesList ? (
        <HeroSkeleton />
      ) : (
        moviesList &&
        moviesList.length > 0 && (
          <section className='relative h-[70vh] overflow-hidden rounded-2xl'>
            <div className='relative w-full h-full'>
              <section className='relative h-[70vh] overflow-hidden rounded-2xl mx-5 lg:mx-10'>
                <div className='relative w-full h-full'>
                  {heroMovies.map((movie: Movie, index: number) => (
                    <div
                      key={movie.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
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
                              <Badge className='bg-red-600 hover:bg-red-700 text-white'>
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
                                variant='destructive'
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
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
              {heroMovies.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </section>
        )
      )}

      <div className='p-5 lg:p-10 space-y-10'>
        {/* Trending Movies Section */}
        {moviesLoading ? (
          <SectionSkeleton />
        ) : (
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
            <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto'>
              {moviesList?.slice(0, 10).map((item: Movie) => (
                <Link
                  href={`/movie/${item.id}`}
                  key={item.id}
                  className='snap-start shrink-0 w-72'
                >
                  <Card className='group hover:shadow-lg transition-all h-full duration-300 overflow-hidden p-0 cursor-pointer'>
                    <div className='relative'>
                      <Image
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : '/placeholder.svg'
                        }
                        alt={item.title || 'Movie poster'}
                        width={500}
                        height={500}
                        className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
                    </div>
                    <CardContent className='p-2 space-y-2'>
                      <div className='flex items-start justify-between space-y-2'>
                        <div className='flex-1 space-y-2'>
                          <h3 className='font-semibold text-lg'>
                            {item.title}
                          </h3>
                          <p className='text-sm text-muted-foreground line-clamp-4'>
                            {item.overview}
                          </p>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              {item.original_language.toUpperCase()}
                            </Badge>
                            <span className='text-sm font-medium text-primary'>
                              {item.release_date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated TV Shows Section */}
        {topRatedLoading ? (
          <SectionSkeleton />
        ) : (
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
            <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto'>
              {topRated?.slice(0, 10).map((item: Movie) => (
                <Link
                  href={`/tv/${item.id}`}
                  key={item.id}
                  className='snap-start shrink-0 w-72'
                >
                  <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden p-0 cursor-pointer'>
                    <div className='relative'>
                      <Image
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : '/placeholder.svg'
                        }
                        alt={item.title || 'Movie poster'}
                        width={500}
                        height={500}
                        className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
                    </div>
                    <CardContent className='p-2 space-y-2'>
                      <div className='flex items-start justify-between space-y-2'>
                        <div className='flex-1 space-y-2'>
                          <h3 className='font-semibold text-lg'>{item.name}</h3>
                          <p className='text-sm text-muted-foreground line-clamp-4'>
                            {item.overview}
                          </p>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              {item.original_language.toUpperCase()}
                            </Badge>
                            <span className='text-sm font-medium text-primary'>
                              {item.release_date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Releases Section */}
        {upcomingLoading ? (
          <SectionSkeleton />
        ) : (
          unreleasedMovies.length > 0 && (
            <section className='space-y-5'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                  <Calendar className='h-6 w-6 text-primary' />
                  Upcoming Releases
                </h2>
                <Button variant='ghost' size='sm'>
                  View Calendar
                </Button>
              </div>
              <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto'>
                {unreleasedMovies?.map((item: Movie) => (
                  <Link
                    href={`/movie/${item.id}`}
                    key={item.id}
                    className='snap-start shrink-0 w-72'
                  >
                    <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden p-0 cursor-pointer'>
                      <div className='relative'>
                        <Image
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                              : '/placeholder.svg'
                          }
                          alt={item.title || 'Movie poster'}
                          width={500}
                          height={500}
                          className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
                      </div>
                      <CardContent className='p-2 space-y-2'>
                        <div className='flex items-start justify-between space-y-2'>
                          <div className='flex-1 space-y-2'>
                            <h3 className='font-semibold text-lg'>
                              {item.title}
                            </h3>
                            <p className='text-sm text-muted-foreground line-clamp-4'>
                              {item.overview}
                            </p>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {item.original_language.toUpperCase()}
                              </Badge>
                              <span className='text-sm font-medium text-primary'>
                                {item.release_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )
        )}
      </div>
    </main>
  )
}
