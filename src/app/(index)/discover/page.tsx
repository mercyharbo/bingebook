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
import { format } from 'date-fns'
import { Calendar, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import DiscoverLoadingSkeleton from '@/components/DiscoverLoadingSkeleton'
import MovieCard from '@/components/MovieCard'
import DiscoverPagination from '@/components/DiscoverPagination'
import FilterSheet from '@/components/DiscoverFilterSheet'

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
  
  const {
    movieList,
    setMoviesList,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    setSelectedMovie,
    watchlistIds,
    setWatchlistIds,
    currentSlide,
    setCurrentSlide,
    selectedGenres,
    dateRange,
    searchQuery,
    sortBy,
    mediaType,
    setSortBy,
    setIsFilterOpen,
    clearAllFilters,
  } = useDiscoverStore()

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

      if (error) {
        console.error('Error fetching watchlist:', error)
        return
      }

      const ids = data.map((item: { tmdb_id: number }) => item.tmdb_id)
      setWatchlistIds(ids)
    }

    fetchWatchlist()
  }, [supabase, setWatchlistIds])

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

  const nextSlide = () => {
    if (!movieList) return
    setCurrentSlide((prev) => (prev + 1) % Math.min(movieList.length, 10))
  }

  const prevSlide = () => {
    if (!movieList) return
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.min(movieList.length, 10)) %
        Math.min(movieList.length, 10)
    )
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Auto-slide functionality
  useEffect(() => {
    if (!movieList || movieList.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(movieList.length, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [movieList, setCurrentSlide])

  if (isLoading) return <DiscoverLoadingSkeleton />

  return (
    <main className="flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden">
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

      <div className="flex flex-col gap-8 px-6 py-12 lg:px-12">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-glow uppercase italic">
              {mediaType === 'movie' ? 'Discover Movies' : 'Discover TV Shows'}
            </h1>
            <p className="text-muted-foreground font-medium">
              Explore thousands of titles tailored for you.
            </p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger
                size="lg"
                className="h-11 lg:w-[200px] rounded-lg bg-white/5 border-white/10 hover:bg-white/10 transition-all font-medium"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10 rounded-lg">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              onClick={() => setIsFilterOpen(true)}
              className="h-11 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-2"
            >
              <SlidersHorizontal className="size-4" />
              <span className="font-medium">Filters</span>
              {(selectedGenres.length > 0 || dateRange?.from || dateRange?.to) && (
                <Badge className="ml-1 bg-primary text-primary-foreground size-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                  {selectedGenres.length + (dateRange?.from ? 1 : 0) + (dateRange?.to ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        {filteredMedia?.length === 0 && (
          <div className="text-center py-24 glass rounded-lg border-dashed">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-2xl font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              We couldn't find any {mediaType === 'movie' ? 'movies' : 'TV shows'} matching your criteria.
            </p>
            <Button onClick={handleClearAllFilters} className="rounded-lg h-11 px-6">Clear All Filters</Button>
          </div>
        )}

        {/* Media Grid */}
        {filteredMedia && filteredMedia.length > 0 && (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            {filteredMedia.map((item: Movie) => (
              <MovieCard
                key={item.id}
                movie={item}
                isInWatchlist={isInWatchlist(item.id)}
                addToWatchlist={() => addToWatchlist(item)}
                addingToWatchlist={addingToWatchlist}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredMedia && filteredMedia.length > 0 && totalPages > 1 && (
          <div className="pt-8 flex justify-center">
            <DiscoverPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <FilterSheet />
      </div>
    </main>
  )
}
