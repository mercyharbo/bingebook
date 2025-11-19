'use client'

import HeroSlider from '@/components/HeroSlider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDiscoverStore } from '@/lib/store/discoverStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import type { Movie } from '@/types/movie'
import { format, parseISO } from 'date-fns'
import { Calendar, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import DiscoverLoadingSkeleton from './DiscoverLoadingSkeleton'
import DiscoverMovieDialog from './DiscoverMovieDialog'
import DiscoverPagination from './DiscoverPagination'
import FilterSheet from './FilterSheet'

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

export default function Discover() {
  const router = useRouter()
  const supabase = createClient()
  const [movieList, setMoviesList] = useState<Movie[] | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [watchlistIds, setWatchlistIds] = useState<number[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const { addingToWatchlist, setAddingToWatchlist } = useWatchlistStore()

  const {
    selectedGenres,
    dateRange,
    searchQuery,
    sortBy,
    mediaType,
    setSortBy,
    setIsFilterOpen,
    clearAllFilters,
  } = useDiscoverStore()

  const genres = mediaType === 'movie' ? movieGenres : tvGenres

  const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]))

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

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    {
      value:
        mediaType === 'movie' ? 'release_date.desc' : 'first_air_date.desc',
      label: 'Latest Release',
    },
    {
      value: mediaType === 'movie' ? 'release_date.asc' : 'first_air_date.asc',
      label: 'Earliest Release',
    },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
  ]

  const queryParams = new URLSearchParams({
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: currentPage.toString(),
    sort_by: sortBy,
    ...(mediaType === 'movie' ? { with_release_type: '2|3' } : {}),
    ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(',') }),
    ...(dateRange?.from && {
      [mediaType === 'movie' ? 'release_date.gte' : 'first_air_date.gte']:
        format(dateRange.from, 'yyyy-MM-dd'),
    }),
    ...(dateRange?.to && {
      [mediaType === 'movie' ? 'release_date.lte' : 'first_air_date.lte']:
        format(dateRange.to, 'yyyy-MM-dd'),
    }),
  })

  const { isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/discover/${mediaType}?${queryParams}`,
    fetcher,
    {
      onSuccess: (data) => {
        setMoviesList(data.results)
        setTotalPages(data.total_pages || 1)
      },
    }
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleClearAllFilters = () => {
    clearAllFilters()
    setCurrentPage(1)
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
      media_type: mediaType,
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

  const filteredMedia = movieList?.filter((item) => {
    if (mediaType === 'movie' && item.title) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase())
    } else if (mediaType === 'tv' && item.name) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return false
  })

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleViewDetails = () => {
    if (selectedMovie) {
      const path =
        mediaType === 'movie'
          ? `/movie/${selectedMovie.id}`
          : `/tv/${selectedMovie.id}`
      router.push(path)
    }
  }

  const nextSlide = () => {
    if (!movieList) return
    setCurrentSlide((prev) => (prev + 1) % Math.min(movieList.length, 5))
  }

  const prevSlide = () => {
    if (!movieList) return
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.min(movieList.length, 5)) %
        Math.min(movieList.length, 5)
    )
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Auto-slide functionality
  useEffect(() => {
    if (!movieList || movieList.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(movieList.length, 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [movieList])

  if (isLoading) return <DiscoverLoadingSkeleton />

  return (
    <main className='-mt-16 space-y-5'>
      {/* Hero Section */}
      {movieList && movieList.length > 0 && (
        <HeroSlider
          moviesList={movieList}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
          addToWatchlist={addToWatchlist}
          isInWatchlist={isInWatchlist}
          addingToWatchlist={addingToWatchlist}
        />
      )}

      <div className='flex flex-col gap-5 w-full lg:w-full 3xl:w-[90%] px-5 mx-auto pb-10 lg:px-16'>
        {/* Header */}
        <header className='flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-5'>
          <h1 className='text-2xl uppercase font-bold flex items-center gap-2'>
            {mediaType === 'movie' ? 'Discover Movies' : 'Discover TV Shows'}
          </h1>

          <div className='flex gap-2 w-full lg:w-auto'>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger
                size='lg'
                className='lg:w-[180px] py-2 border border-gray-400 '
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              onClick={() => setIsFilterOpen(true)}
              className='h-11'
            >
              <SlidersHorizontal className='size-4' />
              Filters
              {(selectedGenres.length > 0 || dateRange) && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedGenres.length + (dateRange ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        {filteredMedia?.length === 0 && (
          <div className='text-center py-12'>
            <Calendar className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-xl font-semibold mb-2'>
              No {mediaType === 'movie' ? 'movies' : 'TV shows'} found
            </h3>
            <p className='text-muted-foreground mb-4'>
              Try adjusting your filters or search terms
            </p>
            <Button onClick={handleClearAllFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Media Grid for discoveries */}
        {filteredMedia && filteredMedia.length > 1 && (
          <section
            className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6`}
          >
            {filteredMedia.map((item: Movie) => (
              <div
                key={item.id}
                className='group cursor-pointer'
                onClick={() => handleMovieClick(item)}
              >
                <div className='relative mb-3 overflow-hidden rounded-lg'>
                  <Image
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : '/sample-poster.jpg'
                    }
                    alt={
                      (mediaType === 'movie' ? item.title : item.name) ||
                      'Media item'
                    }
                    width={500}
                    height={750}
                    className={`object-cover w-full h-96 group-hover:scale-105 transition-transform duration-300 `}
                  />
                </div>

                <div className='space-y-1'>
                  <div>
                    <h3 className='font-semibold text-base line-clamp-1'>
                      {mediaType === 'movie' ? item.title : item.name}
                    </h3>
                  </div>

                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>
                      {(
                        mediaType === 'movie'
                          ? item.release_date
                          : item.first_air_date
                      )
                        ? format(
                            parseISO(
                              mediaType === 'movie'
                                ? item.release_date!
                                : item.first_air_date!
                            ),
                            'MMM d, yyyy'
                          )
                        : 'N/A'}
                    </span>
                    <span className='line-clamp-1'>
                      {item.genre_ids
                        ? item.genre_ids
                            .slice(0, 2)
                            .map((id) => genreMap[id])
                            .filter(Boolean)
                            .join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* pagination */}
        {filteredMedia && filteredMedia.length > 0 && totalPages > 1 && (
          <DiscoverPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        <FilterSheet />

        <DiscoverMovieDialog
          selectedMovie={selectedMovie}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleViewDetails={handleViewDetails}
          addToWatchlist={addToWatchlist}
          isInWatchlist={isInWatchlist}
          addingToWatchlist={addingToWatchlist}
          mediaType={mediaType}
        />
      </div>
    </main>
  )
}
