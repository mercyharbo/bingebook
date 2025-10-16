'use client'

import MarkMovieSeenButton from '@/components/markAsSeen'
import TVProgressTracker from '@/components/TvProgressTracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination' // Import shadcn Pagination components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, Check, Clock, Eye, Search, Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import EmptyState from './empty-state'
import WatchlistLoadingSkeleton from './loading-skeleton'

interface TMDBGenre {
  id: number
  name: string
}

interface TMDBSeason {
  id: number
  season_number: number
  episode_count: number
  name: string
}

interface TMDBData {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  genres?: TMDBGenre[]
  vote_average?: number
  vote_count?: number
  popularity?: number
  original_language?: string
  original_title?: string
  original_name?: string
  adult?: boolean
  budget?: number
  revenue?: number
  status?: string
  tagline?: string
  homepage?: string
  number_of_seasons?: number
  number_of_episodes?: number
  in_production?: boolean
  episode_run_time?: number[]
  seasons?: TMDBSeason[]
}

export interface WatchlistItem {
  id: number
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  tmdb_data: TMDBData
  poster_path: string | null
  is_seen: boolean
  seen_episodes: Record<string, string[]>
  completed_seasons: number[]
  created_at: string
  last_updated: string
}

export default function WatchlistPage() {
  const supabase = createClient()
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('added_date')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1) // New state for current page
  const itemsPerPage = 25 // Constant for items per page

  const { isRemovingFromWatchlist, setIsRemovingFromWatchlist } =
    useWatchlistStore()

  useEffect(() => {
    const fetchWatchlist = async () => {
      setIsLoading(true)
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()
        if (sessionError || !sessionData.session) {
          toast.error('Please log in to view your watchlist')
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching watchlist:', error)
          toast.error('Failed to load watchlist')
        } else {
          setWatchlistItems(data)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchWatchlist()
  }, [supabase])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchQuery, sortBy])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  /* The above code is creating an array of filter objects for a watchlist. Each filter object represents
a different category of items in the watchlist, such as 'All', 'Movies', 'TV Shows', 'Watching',
'Watched', and 'Planned'. */
  const filters = [
    { id: 'all', label: 'All', count: watchlistItems.length },
    {
      id: 'movies',
      label: 'Movies',
      count: watchlistItems.filter((item) => item.media_type === 'movie')
        .length,
    },
    {
      id: 'tv',
      label: 'TV Shows',
      count: watchlistItems.filter((item) => item.media_type === 'tv').length,
    },
    {
      id: 'watching',
      label: 'Watching',
      count: watchlistItems.filter(
        (item) =>
          item.media_type === 'tv' &&
          Object.keys(item.seen_episodes).length > 0 &&
          Object.values(item.seen_episodes).reduce(
            (sum: number, eps: string[]) => sum + eps.length,
            0
          ) < (item.tmdb_data.number_of_episodes || Infinity)
      ).length,
    },
    {
      id: 'watched',
      label: 'Watched',
      count: watchlistItems.filter(
        (item) =>
          item.is_seen ||
          (item.media_type === 'tv' &&
            Object.values(item.seen_episodes).reduce(
              (sum: number, eps: string[]) => sum + eps.length,
              0
            ) === item.tmdb_data.number_of_episodes)
      ).length,
    },
    {
      id: 'planned',
      label: 'Planned',
      count: watchlistItems.filter(
        (item) =>
          !item.is_seen &&
          (!item.seen_episodes || Object.keys(item.seen_episodes).length === 0)
      ).length,
    },
  ]

  const removeFromWatchlist = async (id: number) => {
    setIsRemovingFromWatchlist(true)
    try {
      const { error } = await supabase.from('watchlist').delete().eq('id', id)
      if (error) {
        console.error('Error removing item:', error)
        toast.error('Failed to remove item')
      } else {
        setWatchlistItems((prev) => prev.filter((item) => item.id !== id))
        toast.success('Item removed from watchlist')
        setIsRemovingFromWatchlist(false)
        // Adjust current page if necessary
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages)
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleMovieSeenToggle = (watchlistId: number, newStatus: boolean) => {
    setWatchlistItems((prev) =>
      prev.map((item) =>
        item.id === watchlistId
          ? {
              ...item,
              is_seen: newStatus,
              last_updated: new Date().toISOString(),
            }
          : item
      )
    )
  }

  const filteredItems = watchlistItems
    .filter((item) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'movies') return item.media_type === 'movie'
      if (activeFilter === 'tv') return item.media_type === 'tv'
      if (activeFilter === 'watching')
        return (
          item.media_type === 'tv' &&
          Object.keys(item.seen_episodes).length > 0 &&
          Object.values(item.seen_episodes).reduce(
            (sum: number, eps: string[]) => sum + eps.length,
            0
          ) < (item.tmdb_data.number_of_episodes || Infinity)
        )
      if (activeFilter === 'watched')
        return (
          item.is_seen ||
          (item.media_type === 'tv' &&
            Object.values(item.seen_episodes).reduce(
              (sum: number, eps: string[]) => sum + eps.length,
              0
            ) === item.tmdb_data.number_of_episodes)
        )
      if (activeFilter === 'planned')
        return (
          !item.is_seen &&
          (!item.seen_episodes || Object.keys(item.seen_episodes).length === 0)
        )
      return true
    })
    .filter((item) => {
      const title =
        item.media_type === 'movie'
          ? item.tmdb_data.title || 'Untitled'
          : item.tmdb_data.name || 'Untitled'
      return title.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      const aTitle =
        a.media_type === 'movie'
          ? a.tmdb_data.title || ''
          : a.tmdb_data.name || ''
      const bTitle =
        b.media_type === 'movie'
          ? b.tmdb_data.title || ''
          : b.tmdb_data.name || ''
      const aReleaseDate =
        a.media_type === 'movie'
          ? a.tmdb_data.release_date || '1970-01-01'
          : a.tmdb_data.first_air_date || '1970-01-01'
      const bReleaseDate =
        b.media_type === 'movie'
          ? b.tmdb_data.release_date || '1970-01-01'
          : b.tmdb_data.first_air_date || '1970-01-01'
      switch (sortBy) {
        case 'title':
          return aTitle.localeCompare(bTitle)
        case 'release_date':
          return (
            new Date(bReleaseDate).getTime() - new Date(aReleaseDate).getTime()
          )
        case 'rating':
          return (
            (b.tmdb_data.vote_average || 0) - (a.tmdb_data.vote_average || 0)
          )
        case 'added_date':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
      }
    })

  // Pagination logic
  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return <WatchlistLoadingSkeleton />
  }

  return (
    <main className='min-h-screen dark:bg-background p-5 lg:p-10 space-y-5'>
      <header className='relative flex flex-col justify-center items-center gap-8 py-5 lg:py-8'>
        {/* Hero Section */}
        <div className='text-center space-y-4 px-4 max-w-3xl mx-auto'>
          <div className='inline-flex items-center justify-center size-14 bg-blue-600 rounded-2xl shadow-lg mb-4'>
            <Eye className='size-6 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white leading-tight'>
            Your Watchlist
          </h1>
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed'>
            Keep track of your movies and TV shows. Discover, organize, and
            never miss your favorites.
          </p>
        </div>

        {/* Controls Section */}
        <div className='w-full max-w-4xl mx-auto space-y-6'>
          {/* Search and Sort */}
          <div className='flex flex-col lg:flex-row gap-4 max-w-2xl mx-auto'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                placeholder='Search your watchlist...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-12 h-11 text-base border-border dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl'
              />
            </div>
            <div className='flex gap-3 w-full lg:w-auto'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  size='lg'
                  className='h-12 w-full lg:w-auto px-4 py-3 text-base border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-xl'
                >
                  <SelectValue placeholder='Sort by...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='added_date'>Sort by Added Date</SelectItem>
                  <SelectItem value='title'>Sort by Title</SelectItem>
                  <SelectItem value='release_date'>
                    Sort by Release Date
                  </SelectItem>
                  <SelectItem value='rating'>Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className='flex flex-wrap justify-center gap-2 sm:gap-3'>
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter.id)}
                className={`text-sm px-4 py-2.5 h-auto min-h-[40px] rounded-full transition-all duration-200 ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <span className='font-medium'>{filter.label}</span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeFilter === filter.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {paginatedItems.map((item) => (
              <Card
                key={item.id}
                className='group hover:shadow-xl transition-all duration-300 overflow-hidden p-2 gap-2 cursor-pointer'
              >
                <div className='relative'>
                  <Image
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : '/sample-poster.jpg'
                    }
                    alt={
                      item.media_type === 'movie'
                        ? item.tmdb_data.title || 'Untitled Movie'
                        : item.tmdb_data.name || 'Untitled Series'
                    }
                    width={500}
                    height={300}
                    className='object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300 w-full h-72'
                  />
                  <div className='absolute top-2 right-2 flex flex-row gap-2'>
                    <Badge
                      className={cn(
                        'text-white text-xs rounded-3xl',
                        item.is_seen ||
                          (item.media_type === 'tv' &&
                            Object.values(item.seen_episodes).reduce(
                              (sum: number, eps: string[]) => sum + eps.length,
                              0
                            ) === item.tmdb_data.number_of_episodes)
                          ? 'bg-green-500 hover:bg-green-600'
                          : item.media_type === 'tv' &&
                            Object.keys(item.seen_episodes).length > 0
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                      )}
                    >
                      {item.is_seen ||
                      (item.media_type === 'tv' &&
                        Object.values(item.seen_episodes).reduce(
                          (sum: number, eps: string[]) => sum + eps.length,
                          0
                        ) === item.tmdb_data.number_of_episodes) ? (
                        <Check className='size-3' />
                      ) : item.media_type === 'tv' &&
                        Object.keys(item.seen_episodes).length > 0 ? (
                        <Eye className='size-3' />
                      ) : (
                        <Clock className='size-3' />
                      )}
                      <span className='ml-1 capitalize'>
                        {item.is_seen ||
                        (item.media_type === 'tv' &&
                          Object.values(item.seen_episodes).reduce(
                            (sum: number, eps: string[]) => sum + eps.length,
                            0
                          ) === item.tmdb_data.number_of_episodes)
                          ? 'Watched'
                          : item.media_type === 'tv' &&
                            Object.keys(item.seen_episodes).length > 0
                          ? 'Watching'
                          : 'Planned'}
                      </span>
                    </Badge>
                    <Badge variant='secondary' className='text-xs'>
                      {item.media_type === 'movie' ? 'Movie' : 'TV'}
                    </Badge>
                  </div>
                  <div className='absolute bottom-2 right-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex justify-center items-center gap-1 sm:gap-2 w-full px-2'>
                    <Button
                      variant={'outline'}
                      size='sm'
                      className='h-8 sm:h-10 px-2 text-xs sm:text-sm flex-1 sm:w-[80%] bg-black/50 text-white hover:bg-black/80 hover:text-white'
                      asChild
                    >
                      <Link href={`/${item.media_type}/${item.tmdb_id}`}>
                        <span className=''>View Details</span>
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='h-8 sm:h-10 w-8 sm:w-12 p-0 flex-shrink-0'
                        >
                          <Trash2 className='size-3' />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove from Watchlist</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove{' '}
                            <span className='font-semibold'>
                              {item.media_type === 'movie'
                                ? item.tmdb_data.title || 'Untitled Movie'
                                : item.tmdb_data.name || 'Untitled Series'}
                            </span>
                            from your watchlist?
                          </DialogDescription>
                        </DialogHeader>
                        <div className='flex gap-2 justify-end'>
                          <Button
                            variant='destructive'
                            onClick={() => removeFromWatchlist(item.id)}
                            disabled={isRemovingFromWatchlist}
                          >
                            {isRemovingFromWatchlist ? (
                              <div className='flex items-center gap-2'>
                                <LoadingSpinner />
                                <span>Removing</span>
                              </div>
                            ) : (
                              'Remove'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <CardContent className='space-y-2 sm:space-y-3 px-2 sm:px-4 pb-4'>
                  <div className='space-y-1.5 sm:space-y-2'>
                    <h1 className='font-semibold text-base sm:text-lg line-clamp-1 leading-tight'>
                      {item.media_type === 'movie'
                        ? item.tmdb_data.title || 'Untitled Movie'
                        : item.tmdb_data.name || 'Untitled Series'}
                    </h1>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='size-3 flex-shrink-0' />
                        <span className='truncate'>
                          {new Date(
                            item.media_type === 'movie'
                              ? item.tmdb_data.release_date || ''
                              : item.tmdb_data.first_air_date || ''
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='size-3 flex-shrink-0 fill-yellow-400 text-yellow-400' />
                        <span>
                          {(item.tmdb_data.vote_average || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.media_type === 'movie' ? (
                    <MarkMovieSeenButton
                      watchlistId={item.id}
                      isSeen={item.is_seen}
                      title={item.tmdb_data.title || 'Untitled Movie'}
                      onToggle={(newStatus) =>
                        handleMovieSeenToggle(item.id, newStatus)
                      }
                    />
                  ) : (
                    <TVProgressTracker
                      watchlistId={item.id}
                      tmdbId={item.tmdb_id}
                      seasons={item.tmdb_data.seasons || []}
                      seenEpisodes={item.seen_episodes}
                      completedSeasons={item.completed_seasons}
                    />
                  )}

                  <div className='flex flex-wrap gap-1.5'>
                    {(item.tmdb_data.genres || [])
                      .slice(0, 2)
                      .map((genre: { name: string }) => (
                        <Badge
                          key={genre.name}
                          variant='outline'
                          className='text-xs px-2 py-1 leading-tight rounded-full border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300'
                        >
                          {genre.name}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className='mt-6'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    // Show first 3 pages, last 3 pages, and 2 pages around current page
                    const isFirstThree = page <= 3
                    const isLastThree = page > totalPages - 3
                    const isNearCurrent =
                      page >= currentPage - 1 && page <= currentPage + 1
                    const showEllipsisBefore = page === 4 && currentPage > 4
                    const showEllipsisAfter =
                      page === totalPages - 3 && currentPage < totalPages - 3

                    if (isFirstThree || isLastThree || isNearCurrent) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className='cursor-pointer'
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (showEllipsisBefore) {
                      return (
                        <PaginationItem key='ellipsis-before'>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (showEllipsisAfter) {
                      return (
                        <PaginationItem key='ellipsis-after'>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </main>
  )
}
