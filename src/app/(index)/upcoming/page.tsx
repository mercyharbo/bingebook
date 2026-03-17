'use client'

import { Calendar, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'

import HeroSlider from '@/components/HeroSlider'
import MovieCard from '@/components/MovieCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UpcomingFilterSheet from '@/components/UpcomingFilterSheet'
import UpcomingLoadingSkeleton from '@/components/UpcomingLoadingSkeleton'
import UpcomingPagination from '@/components/UpcomingPagination'
import { useUpcomingStore } from '@/lib/store/upcomingStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import type { Movie, MovieOnly } from '@/types/movie'
import { toast } from 'react-toastify'

export default function UpcomingMoviesPage() {
  const supabase = createClient()

  const {
    upcomingMovies,
    selectedGenres,
    dateRange,
    searchQuery,
    sortBy,
    currentPage,
    totalPages,
    isFilterOpen,
    selectedMovie,
    currentSlide,
    watchlistIds,
    setUpcomingMovies,
    toggleGenre,
    setDateRange,
    setSortBy,
    setCurrentPage,
    setTotalPages,
    setIsFilterOpen,
    setSelectedMovie,
    setCurrentSlide,
    setWatchlistIds,
    clearAllFilters,
    resetPagination,
  } = useUpcomingStore()

  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

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
  }, [supabase, setWatchlistIds])

  const queryParams = new URLSearchParams({
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: currentPage.toString(),
    sort_by: sortBy,
    with_release_type: '2|3',
    ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(',') }),
    ...(dateRange?.from && { 'release_date.gte': format(dateRange.from, 'yyyy-MM-dd') }),
    ...(dateRange?.to && { 'release_date.lte': format(dateRange.to, 'yyyy-MM-dd') }),
  })

  const { error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming?${queryParams}`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
        setTotalPages(data.total_pages || 1)
      },
    },
  )

  const handleGenreToggle = (genreId: string) => {
    toggleGenre(genreId)
    resetPagination()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const filteredMovies = upcomingMovies?.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const isInWatchlist = (movieId: number) => watchlistIds.includes(movieId)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 10)
    }, 8000)
    return () => clearInterval(interval)
  }, [setCurrentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 10)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 10) % 10)
  }

  if (isLoading) return <UpcomingLoadingSkeleton />

  return (
    <main className='flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden'>
      {/* Hero Slider */}
      <HeroSlider
        moviesList={upcomingMovies}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
        addToWatchlist={addToWatchlist}
        isInWatchlist={isInWatchlist}
        addingToWatchlist={addingToWatchlist}
      />

      <div className='flex flex-col gap-8 px-6 py-12 lg:px-12'>
        {/* Header */}
        <header className='flex flex-col lg:flex-row justify-between items-center w-full gap-6'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-medium text-glow uppercase italic'>Upcoming Movies</h1>
            <p className='text-muted-foreground font-medium'>
              Stay ahead of the trend with these upcoming releases.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <UpcomingFilterSheet />

            <Button
              variant='ghost'
              className='h-11 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-2 px-6'
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className='size-4' />
              <span className='font-medium'>Filters</span>
              {(selectedGenres.length > 0 || dateRange?.from || dateRange?.to) && (
                <Badge className='ml-1 bg-primary text-primary-foreground size-5 p-0 flex items-center justify-center rounded-full text-[10px]'>
                  {selectedGenres.length +
                    (dateRange?.from ? 1 : 0) +
                    (dateRange?.to ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        {/* No Results */}
        {!isLoading && !error && filteredMovies?.length === 0 && (
          <div className='text-center py-24 glass rounded-lg border-dashed'>
            <Calendar className='h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20' />
            <h3 className='text-2xl font-medium mb-2'>No movies found</h3>
            <p className='text-muted-foreground mb-6 max-w-xs mx-auto'>
              No upcoming releases match your current filters.
            </p>
            <Button onClick={clearAllFilters} className='rounded-lg h-11 px-6'>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Media Grid */}
        {filteredMovies && filteredMovies.length > 0 && (
          <div className='grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6'>
            {filteredMovies.map((movie: MovieOnly) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isInWatchlist={isInWatchlist(movie.id)}
                addToWatchlist={() => addToWatchlist(movie as any)}
                addingToWatchlist={addingToWatchlist}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredMovies && filteredMovies.length > 0 && totalPages > 1 && (
          <div className='pt-8 flex justify-center'>
            <UpcomingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  )
}
