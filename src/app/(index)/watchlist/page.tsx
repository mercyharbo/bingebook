'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination' // Import shadcn Pagination components
import { useWatchlistPageStore } from '@/lib/store/watchlistPageStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { Filter, Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import EmptyState from './empty-state'
import FilterSheet from './FilterSheet'
import WatchlistLoadingSkeleton from './loading-skeleton'
import WatchlistItemDialog from './WatchlistItemDialog'

import { WatchlistItem } from '@/types/watchlist'

export default function WatchlistPage() {
  const supabase = createClient()

  // Store hooks
  const {
    watchlistItems,
    setWatchlistItems,
    updateWatchlistItem,
    removeWatchlistItem,
    addWatchlistItem,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isLoading,
    setIsLoading,
    currentPage,
    setCurrentPage,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    isFilterOpen,
    setIsFilterOpen,
  } = useWatchlistPageStore()

  const { isRemovingFromWatchlist, setIsRemovingFromWatchlist } =
    useWatchlistStore()

  const itemsPerPage = 25 // Constant for items per page

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
        removeWatchlistItem(id)
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
    updateWatchlistItem(watchlistId, {
      is_seen: newStatus,
      last_updated: new Date().toISOString(),
    })
  }

  const addToWatchlist = async (item: WatchlistItem) => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        toast.error('Please log in to add to watchlist')
        return
      }

      const { error } = await supabase.from('watchlist').insert({
        user_id: sessionData.session.user.id,
        tmdb_id: item.tmdb_id,
        media_type: item.media_type,
        tmdb_data: item.tmdb_data,
        poster_path: item.poster_path,
        is_seen: item.is_seen,
        seen_episodes: item.seen_episodes,
        completed_seasons: item.completed_seasons,
      })

      if (error) {
        console.error('Error adding to watchlist:', error)
        toast.error('Failed to add to watchlist')
      } else {
        addWatchlistItem({ ...item, id: Date.now() }) // Temporary ID
        toast.success('Added to watchlist')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    }
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
      <header className='relative flex flex-col md:flex-row justify-between items-center gap-8 py-5 lg:py-8'>
        {/* Hero Section */}
        <div className='text-center md:text-left space-y-2 px-4 max-w-lg'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white leading-tight'>
            Your Watchlist
          </h1>
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed'>
            Keep track of your movies and TV shows. Discover, organize, and
            never miss your favorites.
          </p>
        </div>

        {/* Controls Section */}
        <div className='w-full md:w-auto space-y-6'>
          {/* Search and Sort */}
          <div className='flex flex-col lg:flex-row gap-4 w-full lg:max-w-xl mx-auto'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                placeholder='Search your watchlist...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-12 h-11 text-base border border-gray-400 shadow-none '
              />
            </div>
            <div className='flex gap-3 w-full lg:w-auto'>
              <Button
                onClick={() => setIsFilterOpen(true)}
                variant='outline'
                className='h-12 w-full lg:w-auto bg-transparent shadow-none border border-gray-400 '
              >
                <Filter className='size-4' />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className='grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:px-14 3xl:grid-cols-6'>
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className='snap-start shrink-0  group cursor-pointer'
                onClick={() => {
                  setSelectedItem(item)
                  setIsDialogOpen(true)
                }}
              >
                <div className='relative mb-3 overflow-hidden rounded-lg'>
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
                    height={750}
                    className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <Badge className='absolute top-2 left-2 bg-black/70 text-white text-xs'>
                    {item.media_type === 'movie' ? 'Movie' : 'TV'}
                  </Badge>
                  {(() => {
                    const isSeen =
                      item.media_type === 'movie'
                        ? item.is_seen
                        : Object.values(item.seen_episodes).reduce(
                            (sum: number, eps: string[]) => sum + eps.length,
                            0
                          ) === (item.tmdb_data.number_of_episodes || 0)
                    return isSeen ? (
                      <Badge className='absolute top-2 right-2 bg-green-600 text-white text-xs'>
                        Watched
                      </Badge>
                    ) : null
                  })()}
                </div>
                <div className='space-y-1'>
                  <h3 className='font-semibold text-base line-clamp-1'>
                    {item.media_type === 'movie'
                      ? item.tmdb_data.title || 'Untitled Movie'
                      : item.tmdb_data.name || 'Untitled Series'}
                  </h3>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>
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
                    <span className='line-clamp-1'>
                      {(item.tmdb_data.genres || [])
                        .slice(0, 2)
                        .map((genre: { name: string }) => genre.name)
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <WatchlistItemDialog
            selectedItem={selectedItem}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            removeFromWatchlist={removeFromWatchlist}
            addToWatchlist={addToWatchlist}
            handleMovieSeenToggle={handleMovieSeenToggle}
            isRemovingFromWatchlist={isRemovingFromWatchlist}
            watchlistItems={watchlistItems}
          />

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className='mt-6'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(currentPage - 1, 1))
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
                        setCurrentPage(Math.min(currentPage + 1, totalPages))
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

      <FilterSheet
        filters={filters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />
    </main>
  )
}
