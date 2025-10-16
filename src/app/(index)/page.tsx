'use client'

import { HeroSkeleton } from '@/app/(index)/loading-skeletons'
import HeroSlider from '@/components/HeroSlider'
import TopRatedTVShows from '@/components/TopRatedTVShows'
import TrendingMovies from '@/components/TrendingMovies'
import UpcomingReleases from '@/components/UpcomingReleases'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import type { Movie } from '@/types/movie'
import { isAfter, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function HomePageComp() {
  const supabase = createClient()
  const [topRated, setTopRated] = useState<Movie[] | null>(null)
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[] | null>(null)
  const [moviesList, setMoviesList] = useState<Movie[] | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [watchlistIds, setWatchlistIds] = useState<number[]>([])

  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

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

  if (moviesLoading || upcomingLoading || topRatedLoading) {
    return <HeroSkeleton />
  }

  return (
    <main className='space-y-10 pt-5'>
      {/* Hero Section */}
      {moviesList && moviesList.length > 0 && (
        <HeroSlider
          moviesList={moviesList}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
          addToWatchlist={addToWatchlist}
          isInWatchlist={isInWatchlist}
          addingToWatchlist={addingToWatchlist}
        />
      )}

      <div className='p-5 lg:p-10 space-y-10'>
        <TrendingMovies
          moviesList={moviesList}
          isInWatchlist={isInWatchlist}
          addToWatchlist={addToWatchlist}
          addingToWatchlist={addingToWatchlist}
        />

        <TopRatedTVShows
          topRated={topRated}
          isInWatchlist={isInWatchlist}
          addToWatchlist={addToWatchlist}
          addingToWatchlist={addingToWatchlist}
        />

        <UpcomingReleases
          unreleasedMovies={unreleasedMovies}
          isInWatchlist={isInWatchlist}
          addToWatchlist={addToWatchlist}
          addingToWatchlist={addingToWatchlist}
        />
      </div>
    </main>
  )
}
