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
} from '@/components/ui/pagination'
import EmptyState from '@/components/WatchlistEmptyState'
import FilterSheet from '@/components/WatchlistFilterSheet'
import WatchlistItemDialog from '@/components/WatchlistItemDialog'
import WatchlistLoadingSkeleton from '@/components/WatchlistLoadingSkeleton'
import { useWatchlistPageStore } from '@/lib/store/watchlistPageStore'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { Filter, Search } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'

import { TMDBSeason, WatchlistItem } from '@/types/watchlist'

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

  const itemsPerPage = 25

  const FINISHED_STATUSES = ['Ended', 'Canceled']
  const CONTINUING_STATUSES = ['Returning Series', 'In Production', 'Planned']

  const isCaughtUp = (item: WatchlistItem) => {
    if (item.media_type === 'movie') return item.is_seen
    return (
      item.is_seen ||
      (item.tmdb_data.number_of_seasons &&
        item.tmdb_data.number_of_seasons > 0 &&
        item.completed_seasons.length >= item.tmdb_data.number_of_seasons)
    )
  }

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
  }, [supabase, setIsLoading, setWatchlistItems])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchQuery, sortBy, setCurrentPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

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
          !isCaughtUp(item) &&
          Object.keys(item.seen_episodes).length > 0,
      ).length,
    },
    {
      id: 'watched',
      label: 'Watched',
      count: watchlistItems.filter(
        (item) =>
          isCaughtUp(item) &&
          (item.media_type === 'movie' ||
            item.is_seen ||
            FINISHED_STATUSES.includes(item.tmdb_data.status || '')),
      ).length,
    },
    {
      id: 'coming-soon',
      label: 'Coming Soon',
      count: watchlistItems.filter(
        (item) =>
          item.media_type === 'tv' &&
          isCaughtUp(item) &&
          !item.is_seen &&
          (CONTINUING_STATUSES.includes(item.tmdb_data.status || '') ||
            !item.tmdb_data.status),
      ).length,
    },
    {
      id: 'planned',
      label: 'Planned',
      count: watchlistItems.filter(
        (item) =>
          !isCaughtUp(item) &&
          (!item.seen_episodes || Object.keys(item.seen_episodes).length === 0),
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

  const handleTVProgressUpdate = (
    watchlistId: number,
    seenEpisodes: Record<string, string[]>,
    completedSeasons: number[],
  ) => {
    const updates = {
      seen_episodes: seenEpisodes,
      completed_seasons: completedSeasons,
      last_updated: new Date().toISOString(),
    }
    updateWatchlistItem(watchlistId, updates)

    if (selectedItem && selectedItem.id === watchlistId) {
      setSelectedItem({ ...selectedItem, ...updates })
    }
  }

  const updateTVMetadata = useCallback(
    async (
      watchlistId: number,
      numberOfSeasons: number,
      seasons: TMDBSeason[],
    ) => {
      const item = watchlistItems.find((item) => item.id === watchlistId)
      if (item) {
        const updatedTmdbData = {
          ...item.tmdb_data,
          number_of_seasons: numberOfSeasons,
          seasons: seasons,
        }

        const { error } = await supabase
          .from('watchlist')
          .update({
            tmdb_data: updatedTmdbData,
            last_updated: new Date().toISOString(),
          })
          .eq('id', watchlistId)

        if (error) {
          console.error('Error updating TV metadata:', error)
        } else {
          updateWatchlistItem(watchlistId, {
            tmdb_data: updatedTmdbData,
          })

          if (selectedItem && selectedItem.id === watchlistId) {
            setSelectedItem({
              ...selectedItem,
              tmdb_data: updatedTmdbData,
            })
          }
        }
      }
    },
    [
      supabase,
      watchlistItems,
      selectedItem,
      updateWatchlistItem,
      setSelectedItem,
    ],
  )

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
        addWatchlistItem({ ...item, id: Date.now() })
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
          !isCaughtUp(item) &&
          Object.keys(item.seen_episodes).length > 0
        )
      if (activeFilter === 'watched')
        return (
          isCaughtUp(item) &&
          (item.media_type === 'movie' ||
            item.is_seen ||
            FINISHED_STATUSES.includes(item.tmdb_data.status || ''))
        )
      if (activeFilter === 'coming-soon')
        return (
          item.media_type === 'tv' &&
          isCaughtUp(item) &&
          !item.is_seen &&
          (CONTINUING_STATUSES.includes(item.tmdb_data.status || '') ||
            !item.tmdb_data.status)
        )
      if (activeFilter === 'planned')
        return (
          !isCaughtUp(item) &&
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

  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  if (isLoading) {
    return <WatchlistLoadingSkeleton />
  }

  return (
    <main className='flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden'>
      <div className='flex flex-col gap-8 px-6 py-12 lg:px-12'>
        <header className='flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-8'>
          <div className='space-y-1'>
            <h1 className='text-4xl font-bold text-glow'>Your Watchlist</h1>
            <p className='text-muted-foreground font-medium max-w-lg'>
              Keep track of your favorite movies and series in one beautiful
              place.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto'>
            <div className='relative w-full sm:w-[300px] group'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary' />
              <Input
                placeholder='Search your library...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-11 h-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all font-medium'
              />
            </div>

            <div className='flex items-center gap-3 w-full sm:w-auto'>
              <Button
                onClick={() => setIsFilterOpen(true)}
                variant='ghost'
                className='h-11 flex-1 sm:flex-none bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-2'
              >
                <Filter className='size-4' />
                <span className='font-medium'>Filters</span>
                {activeFilter !== 'all' && (
                  <Badge className='ml-1 bg-primary text-primary-foreground size-5 p-0 flex items-center justify-center rounded-full text-[10px]'>
                    1
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        {filteredItems.length === 0 ? (
          <div className='py-20'>
            <EmptyState />
          </div>
        ) : (
          <div className='space-y-12'>
            <section className='grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6'>
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className='group relative flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-md overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]'
                  onClick={() => {
                    setSelectedItem(item)
                    setIsDialogOpen(true)
                  }}
                >
                  <div className='relative aspect-[2/3] overflow-hidden rounded-t-md'>
                    <Image
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : '/sample-poster.jpg'
                      }
                      alt={
                        (item.media_type === 'movie'
                          ? item.tmdb_data.title
                          : item.tmdb_data.name) || 'Media poster'
                      }
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

                    {(() => {
                      const isWatched =
                        item.media_type === 'movie'
                          ? item.is_seen
                          : item.tmdb_data.number_of_seasons &&
                            item.completed_seasons.length ===
                              item.tmdb_data.number_of_seasons

                      return (
                        isWatched && (
                          <div className='absolute top-2 right-2 glass-dark px-2 py-0.5 rounded text-[10px] font-bold text-green-400 border border-green-400/20'>
                            WATCHED
                          </div>
                        )
                      )
                    })()}

                    {item.tmdb_data.vote_average !== undefined &&
                      item.tmdb_data.vote_average > 0 && (
                        <div className='absolute top-2 left-2 glass-dark px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10'>
                          <div className='size-1 rounded-full bg-yellow-400' />
                          <span className='text-[10px] font-medium text-white'>
                            {item.tmdb_data.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                    {item.media_type === 'tv' &&
                      item.tmdb_data.number_of_episodes && (
                        <div className='absolute bottom-0 left-0 right-0 h-1 bg-white/20'>
                          <div
                            className='h-full bg-primary'
                            style={{
                              width: `${(Object.values(item.seen_episodes).reduce((a: number, b: string[]) => a + b.length, 0) / item.tmdb_data.number_of_episodes) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                  </div>

                  <div className='px-4 py-3 space-y-1'>
                    <h3 className='font-medium text-white text-sm lg:text-base leading-tight truncate group-hover:text-primary transition-colors'>
                      {item.media_type === 'movie'
                        ? item.tmdb_data.title
                        : item.tmdb_data.name}
                    </h3>
                    <div className='flex items-center justify-between text-[11px] font-medium text-white/40'>
                      <span>
                        {new Date(
                          item.media_type === 'movie'
                            ? item.tmdb_data.release_date || ''
                            : item.tmdb_data.first_air_date || '',
                        ).getFullYear() || 'N/A'}
                      </span>
                      <span className='uppercase'>{item.media_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {totalPages > 1 && (
              <div className='flex justify-center pt-8'>
                <Pagination>
                  <PaginationContent className='bg-white/5 border border-white/10 rounded-2xl p-1 gap-1'>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(currentPage - 1, 1))
                        }
                        className={`rounded-xl transition-all ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'}`}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      const isVisible =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)

                      if (!isVisible) {
                        if (page === 2 || page === totalPages - 1)
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        return null
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className={`rounded-xl transition-all cursor-pointer ${currentPage === page ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary' : 'hover:bg-white/10'}`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(currentPage + 1, totalPages))
                        }
                        className={`rounded-xl transition-all ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}

        <WatchlistItemDialog
          selectedItem={selectedItem}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          removeFromWatchlist={removeFromWatchlist}
          addToWatchlist={addToWatchlist}
          handleMovieSeenToggle={handleMovieSeenToggle}
          handleTVProgressUpdate={handleTVProgressUpdate}
          updateTVMetadata={updateTVMetadata}
          isRemovingFromWatchlist={isRemovingFromWatchlist}
          watchlistItems={watchlistItems}
        />

        <FilterSheet
          filters={filters}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isOpen={isFilterOpen}
          onOpenChange={setIsFilterOpen}
        />
      </div>
    </main>
  )
}
