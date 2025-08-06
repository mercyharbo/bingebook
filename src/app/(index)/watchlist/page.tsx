'use client'

import {
  Calendar,
  Check,
  Clock,
  Eye,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WatchlistItem {
  id: number
  title: string
  type: 'movie' | 'tv'
  poster_path: string
  release_date: string
  vote_average: number
  status: 'watching' | 'watched' | 'planned'
  progress?: {
    current_episode: number
    total_episodes: number
    current_season: number
    total_seasons: number
  }
  added_date: string
  genres: string[]
}

// Mock data
const mockWatchlistData: WatchlistItem[] = [
  {
    id: 1,
    title: 'The Dark Knight',
    type: 'movie',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    status: 'watched',
    added_date: '2024-01-15',
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    id: 2,
    title: 'Breaking Bad',
    type: 'tv',
    poster_path: '/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    release_date: '2008-01-20',
    vote_average: 9.5,
    status: 'watching',
    progress: {
      current_episode: 8,
      total_episodes: 62,
      current_season: 2,
      total_seasons: 5,
    },
    added_date: '2024-01-10',
    genres: ['Crime', 'Drama', 'Thriller'],
  },
  {
    id: 3,
    title: 'Inception',
    type: 'movie',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    status: 'planned',
    added_date: '2024-01-20',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
  },
  {
    id: 4,
    title: 'Stranger Things',
    type: 'tv',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    release_date: '2016-07-15',
    vote_average: 8.7,
    status: 'watched',
    progress: {
      current_episode: 34,
      total_episodes: 34,
      current_season: 4,
      total_seasons: 4,
    },
    added_date: '2024-01-05',
    genres: ['Drama', 'Fantasy', 'Horror'],
  },
  {
    id: 5,
    title: 'Dune',
    type: 'movie',
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    release_date: '2021-10-22',
    vote_average: 8.0,
    status: 'planned',
    added_date: '2024-01-25',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
  },
  {
    id: 6,
    title: 'The Bear',
    type: 'tv',
    poster_path: '/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
    release_date: '2022-06-23',
    vote_average: 8.9,
    status: 'watching',
    progress: {
      current_episode: 5,
      total_episodes: 28,
      current_season: 1,
      total_seasons: 3,
    },
    added_date: '2024-01-12',
    genres: ['Comedy', 'Drama'],
  },
]

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] =
    useState<WatchlistItem[]>(mockWatchlistData)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('added_date')

  const filters = [
    { id: 'all', label: 'All', count: watchlistItems.length },
    {
      id: 'movies',
      label: 'Movies',
      count: watchlistItems.filter((item) => item.type === 'movie').length,
    },
    {
      id: 'tv',
      label: 'TV Shows',
      count: watchlistItems.filter((item) => item.type === 'tv').length,
    },
    {
      id: 'watching',
      label: 'Watching',
      count: watchlistItems.filter((item) => item.status === 'watching').length,
    },
    {
      id: 'watched',
      label: 'Watched',
      count: watchlistItems.filter((item) => item.status === 'watched').length,
    },
    {
      id: 'planned',
      label: 'Planned',
      count: watchlistItems.filter((item) => item.status === 'planned').length,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'watched':
        return 'bg-green-500 hover:bg-green-600'
      case 'planned':
        return 'bg-orange-500 hover:bg-orange-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching':
        return <Eye className='h-3 w-3' />
      case 'watched':
        return <Check className='h-3 w-3' />
      case 'planned':
        return <Clock className='h-3 w-3' />
      default:
        return null
    }
  }

  const filteredItems = watchlistItems
    .filter((item) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'movies') return item.type === 'movie'
      if (activeFilter === 'tv') return item.type === 'tv'
      return item.status === activeFilter
    })
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'release_date':
          return (
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
          )
        case 'rating':
          return b.vote_average - a.vote_average
        case 'added_date':
        default:
          return (
            new Date(b.added_date).getTime() - new Date(a.added_date).getTime()
          )
      }
    })

  const removeFromWatchlist = (id: number) => {
    setWatchlistItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateStatus = (
    id: number,
    newStatus: 'watching' | 'watched' | 'planned'
  ) => {
    setWatchlistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    )
  }

  const stats = {
    totalItems: watchlistItems.length,
    totalHours: watchlistItems.length * 2, // Mock calculation
    completedItems: watchlistItems.filter((item) => item.status === 'watched')
      .length,
    currentlyWatching: watchlistItems.filter(
      (item) => item.status === 'watching'
    ).length,
  }

  const EmptyState = () => (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      <div className='w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-6'>
        <div className='text-6xl'>🍿</div>
      </div>
      <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
        Your watchlist is empty
      </h3>
      <p className='text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md'>
        Start building your personal collection of movies and TV shows you want
        to watch.
      </p>
      <Button
        size='lg'
        className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      >
        <Plus className='h-4 w-4 mr-2' />
        Start Adding Titles
      </Button>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='p-5 lg:p-10 space-y-5'>
        <div className='text-center space-y-2'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white'>
            🎬 My Watchlist
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-lg'>
            Keep track of everything you want to watch.
          </p>
        </div>

        {/* Stats Cards */}
        {watchlistItems.length > 0 && (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'>
              <CardContent className='p-4 text-center'>
                <h1 className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {stats.totalItems}
                </h1>
                <span className='text-sm text-blue-600/80 dark:text-blue-400/80'>
                  Total Items
                </span>
              </CardContent>
            </Card>
            <Card className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'>
              <CardContent className='p-4 text-center'>
                <h1 className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {stats.completedItems}
                </h1>
                <span className='text-sm text-green-600/80 dark:text-green-400/80'>
                  Completed
                </span>
              </CardContent>
            </Card>
            <Card className='bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800'>
              <CardContent className='p-4 text-center'>
                <h1 className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                  {stats.currentlyWatching}
                </h1>
                <span className='text-sm text-orange-600/80 dark:text-orange-400/80'>
                  Watching
                </span>
              </CardContent>
            </Card>
            <Card className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800'>
              <CardContent className='p-4 text-center'>
                <h1 className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {stats.totalHours}h
                </h1>
                <span className='text-sm text-purple-600/80 dark:text-purple-400/80'>
                  Est. Time
                </span>
              </CardContent>
            </Card>
          </div>
        )}

        {watchlistItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filter Bar */}
            <div className='flex flex-wrap gap-2 '>
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter.label}
                  <Badge variant='secondary' className='text-xs'>
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Search and Controls */}
            <div className='flex flex-col sm:flex-row gap-4 mb-6'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search your watchlist...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='added_date'>Recently Added</SelectItem>
                  <SelectItem value='title'>Title A-Z</SelectItem>
                  <SelectItem value='release_date'>Release Date</SelectItem>
                  <SelectItem value='rating'>Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Showing {filteredItems.length} of {watchlistItems.length} items
            </p>

            {/* Media Grid/List */}
            {filteredItems.length === 0 ? (
              <div className='text-center py-12 space-y-3'>
                <div className='text-6xl'>🔍</div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  No results found
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
              >
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`group hover:shadow-xl transition-all duration-300 overflow-hidden p-2 `}
                  >
                    <div className={`relative`}>
                      <Image
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : '/placeholder.svg?height=300&width=200&text=No+Image'
                        }
                        alt={item.title}
                        width={200}
                        height={300}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 w-full h-72 `}
                      />
                      <div className='absolute top-2 right-2 flex flex-row gap-2'>
                        <Badge
                          className={`${getStatusColor(
                            item.status
                          )} text-white text-xs`}
                        >
                          {getStatusIcon(item.status)}
                          <span className='ml-1 capitalize'>{item.status}</span>
                        </Badge>
                        <Badge variant='secondary' className='text-xs'>
                          {item.type === 'movie' ? 'Movie' : 'Series'}
                        </Badge>
                      </div>
                      <div className='absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='destructive'
                              className='h-8 w-8 p-0'
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove from Watchlist</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove{' '}
                                <span className='font-semibold'>{item.title}</span>
                                from your watchlist?
                              </DialogDescription>
                            </DialogHeader>
                            <div className='flex gap-2 justify-end'>
                              <Button variant='outline'>Cancel</Button>
                              <Button
                                variant='destructive'
                                onClick={() => removeFromWatchlist(item.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <CardContent className={`space-y-3`}>
                      <div>
                        <Link
                          href={`/${item.type}/${item.id}`}
                          className='font-semibold text-lg hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-1'
                        >
                          {item.title}
                        </Link>
                        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                          <div className='space-x-1 flex items-center'>
                            <Calendar className='h-3 w-3' />
                            <span>
                              {new Date(item.release_date).getFullYear()}
                            </span>
                          </div>
                          <div className='space-x-1 flex items-center'>
                            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                            <span>{item.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {item.progress && (
                        <div className='space-y-2'>
                          <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400'>
                            <span>
                              S{item.progress.current_season} E
                              {item.progress.current_episode}
                            </span>
                            <span>
                              {item.progress.current_episode}/
                              {item.progress.total_episodes} episodes
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                            <div
                              className='bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300'
                              style={{
                                width: `${
                                  (item.progress.current_episode /
                                    item.progress.total_episodes) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className='flex flex-wrap gap-1'>
                        {item.genres.slice(0, 2).map((genre) => (
                          <Badge
                            key={genre}
                            variant='outline'
                            className='text-xs'
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>

                      <div className='flex gap-2 pt-2'>
                        <Select
                          value={item.status}
                          onValueChange={(
                            value: 'watching' | 'watched' | 'planned'
                          ) => updateStatus(item.id, value)}
                        >
                          <SelectTrigger className='flex-1 h-8 text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='planned'>Planned</SelectItem>
                            <SelectItem value='watching'>Watching</SelectItem>
                            <SelectItem value='watched'>Watched</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-8 px-2'
                          asChild
                        >
                          <Link href={`/${item.type}/${item.id}`}>
                            <Play className='h-3 w-3' />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
