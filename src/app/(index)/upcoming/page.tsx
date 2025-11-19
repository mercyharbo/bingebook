'use client'

import {
  Calendar,
  Check,
  Loader2,
  Plus,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import HeroSlider from '@/components/HeroSlider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUpcomingStore } from '@/lib/store/upcomingStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import type { Movie, MovieOnly } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import UpcomingFilterSheet from './UpcomingFilterSheet'
import UpcomingLoadingSkeleton from './UpcomingLoadingSkeleton'
import UpcomingPagination from './UpcomingPagination'

export default function UpcomingMoviesPage() {
  const router = useRouter()
  const supabase = createClient()

  // Store state
  const {
    upcomingMovies,
    selectedGenres,
    minDate,
    maxDate,
    searchQuery,
    sortBy,
    currentPage,
    totalPages,
    isFilterOpen,
    setUpcomingMovies,
    toggleGenre,
    setMinDate,
    setMaxDate,
    setSortBy,
    setCurrentPage,
    setTotalPages,
    setIsFilterOpen,
    clearAllFilters,
    resetPagination,
  } = useUpcomingStore()

  const [selectedMovie, setSelectedMovie] = useState<MovieOnly | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // HeroSlider state
  const [currentSlide, setCurrentSlide] = useState(0)

  const [watchlistIds, setWatchlistIds] = useState<number[]>([])
  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

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

  const queryParams = new URLSearchParams({
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: currentPage.toString(),
    sort_by: sortBy,
    with_release_type: '2|3',
    ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(',') }),
    ...(minDate && { 'release_date.gte': minDate }),
    ...(maxDate && { 'release_date.lte': maxDate }),
  })

  const { error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming?${queryParams}`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
        setTotalPages(data.total_pages || 1)
      },
    }
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
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMovieClick = (movie: MovieOnly) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleViewDetails = () => {
    if (selectedMovie) {
      router.push(`/movie/${selectedMovie.id}`)
    }
  }

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
      setCurrentSlide((prev) => (prev + 1) % 5)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 5)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 5) % 5)
  }

  if (isLoading) return <UpcomingLoadingSkeleton />

  return (
    <main className='-mt-16 space-y-5'>
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

      <div className='flex flex-col gap-5 w-full lg:w-full 3xl:w-[90%] px-5 pb-10 mx-auto lg:px-16'>
        {/* Header */}
        <header className='flex flex-col lg:flex-row justify-between items-center w-full gap-5 py-6'>
          <h1 className='text-2xl font-semibold flex items-center gap-2'>
            Upcoming Movies
          </h1>

          <UpcomingFilterSheet
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            selectedGenres={selectedGenres}
            minDate={minDate}
            maxDate={maxDate}
            sortBy={sortBy}
            setMinDate={(date) => {
              setMinDate(date)
              resetPagination()
            }}
            setMaxDate={(date) => {
              setMaxDate(date)
              resetPagination()
            }}
            setSortBy={(sort) => {
              setSortBy(sort)
              resetPagination()
            }}
            handleGenreToggle={handleGenreToggle}
            clearAllFilters={clearAllFilters}
          />

          <Button
            variant='outline'
            className=''
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className='h-4 w-4' />
            Filters
            {(selectedGenres.length > 0 || minDate || maxDate) && (
              <Badge variant='secondary' className='ml-2'>
                {selectedGenres.length + (minDate ? 1 : 0) + (maxDate ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </header>

        {/* No Results */}
        {!isLoading && !error && filteredMovies?.length === 0 && (
          <div className='text-center py-12'>
            <Calendar className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-xl font-semibold mb-2'>No movies found</h3>
            <p className='text-muted-foreground mb-4'>
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearAllFilters}>Clear Filters</Button>
          </div>
        )}

        <section
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 `}
        >
          {filteredMovies &&
            filteredMovies.map((movie: MovieOnly) => (
              <div
                key={movie.id}
                className='snap-start shrink-0 w-64 group cursor-pointer'
                onClick={() => handleMovieClick(movie)}
              >
                <div className='relative mb-3 overflow-hidden rounded-lg'>
                  <Image
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/placeholder.svg'
                    }
                    alt={movie.title || 'Movie poster'}
                    width={500}
                    height={750}
                    className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
                <div className='space-y-1'>
                  <h3 className='font-semibold text-base line-clamp-1'>
                    {movie.title}
                  </h3>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>
                      {movie.release_date
                        ? format(parseISO(movie.release_date), 'MMM d, yyyy')
                        : 'N/A'}
                    </span>
                    <span className='line-clamp-1'>
                      {movie.genre_ids
                        .slice(0, 2)
                        .map((id) => genreMap[id])
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </section>

        {/* Pagination */}
        {filteredMovies && filteredMovies.length > 0 && totalPages > 1 && (
          <UpcomingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Movie Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='lg:max-w-[500px] h-[60vh] overflow-y-auto scrollbar-hide'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              {selectedMovie?.title}
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              Quick Preview
            </DialogDescription>
          </DialogHeader>

          {selectedMovie && (
            <div className='space-y-4'>
              {/* Responsive poster and meta section */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-shrink-0 mx-auto sm:mx-0'>
                  <Image
                    src={
                      selectedMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                        : '/sample-poster.jpg'
                    }
                    alt={selectedMovie.title}
                    width={150}
                    height={200}
                    className='rounded-lg object-cover w-[150px] h-[200px]'
                  />
                </div>

                <div className='flex-1 space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {selectedMovie.vote_average > 0 && (
                      <Badge className='bg-yellow-500 text-black text-xs'>
                        <Star className='h-3 w-3 fill-current mr-1' />
                        {selectedMovie.vote_average.toFixed(1)}
                      </Badge>
                    )}
                    <Badge variant='outline' className='text-xs'>
                      {selectedMovie.original_language.toUpperCase()}
                    </Badge>
                    <Badge variant='secondary' className='text-xs'>
                      {new Date(
                        selectedMovie.release_date
                      ).toLocaleDateString()}
                    </Badge>
                    {selectedMovie.adult && (
                      <Badge variant='destructive' className='text-xs'>
                        18+
                      </Badge>
                    )}
                  </div>

                  <div className='space-y-1 text-xs sm:text-sm text-muted-foreground'>
                    <p>Popularity: {selectedMovie.popularity.toFixed(0)}</p>
                    <p>Votes: {selectedMovie.vote_count}</p>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className='font-semibold text-sm'>Overview</h4>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {selectedMovie.overview || 'No description available.'}
                </p>
              </div>

              {/* Buttons */}
              <div className='flex flex-wrap gap-2 pt-2'>
                <Button
                  onClick={handleViewDetails}
                  className='flex-1 min-w-[150px]'
                >
                  View Full Details
                </Button>
                <Button
                  variant='outline'
                  onClick={() => addToWatchlist(selectedMovie)}
                  size='icon'
                  disabled={
                    isInWatchlist(selectedMovie.id) && addingToWatchlist
                  }
                >
                  {isInWatchlist(selectedMovie.id) ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <div className=''>
                      {addingToWatchlist ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Plus className='h-4 w-4' />
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
