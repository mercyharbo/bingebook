'use client'

import { HeroSkeleton } from '@/app/(index)/loading-skeletons'
import HeroSlider from '@/components/HeroSlider'
import TrendingGrid from '@/components/TrendingGrid'
import { useHomeStore } from '@/lib/store/homeStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { useEffect } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function HomePageComp() {
  const supabase = createClient()
  
  const {
    currentSlide,
    setCurrentSlide,
    watchlistIds,
    setWatchlistIds,
    moviesList,
    setMoviesList,
  } = useHomeStore()

  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

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

      if (error) {
        console.error('Error fetching watchlist:', error)
        return
      }

      const ids = data.map((item: { tmdb_id: number }) => item.tmdb_id)
      setWatchlistIds(ids)
    }

    fetchWatchlist()
  }, [supabase, setWatchlistIds])

  // Auto-slide functionality
  useEffect(() => {
    if (!moviesList || moviesList.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(moviesList.length, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [moviesList, setCurrentSlide])

  const nextSlide = () => {
    if (!moviesList) return
    setCurrentSlide((prev) => (prev + 1) % Math.min(moviesList.length, 10))
  }

  const prevSlide = () => {
    if (!moviesList) return
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.min(moviesList.length, 10)) %
        Math.min(moviesList.length, 10)
    )
  }

  const addToWatchlist = async (movie: any) => {
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
      media_type: movie.media_type || (movie.title ? 'movie' : 'tv'),
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

  if (moviesLoading) {
    return <HeroSkeleton />
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden">
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

      <div className="flex flex-col gap-16 px-6 py-12 lg:px-12">
        <TrendingGrid
          isInWatchlist={isInWatchlist}
          addToWatchlist={addToWatchlist}
          addingToWatchlist={addingToWatchlist}
        />
      </div>
    </main>
  )
}
