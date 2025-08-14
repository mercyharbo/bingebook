'use client'

import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { fetcher } from '@/lib/utils'
import { Calendar, Film, Search, Star, Tv, User, Zap } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import useSWR from 'swr'

type SearchResult = {
  id: number
  name?: string
  title?: string
  profile_path?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  known_for_department?: string
}

type ApiResponse = {
  results: SearchResult[]
  total_pages: number
  page: number
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR<ApiResponse>(
    query
      ? `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/search/multi?query=${encodeURIComponent(
          query
        )}&include_adult=false&language=en-US&page=${page}`
      : null,
    fetcher
  )

  const getMediaType = (item: SearchResult): 'movie' | 'tv' | 'person' => {
    if (item.title && item.release_date) return 'movie'
    if (item.name && item.first_air_date) return 'tv'
    if (item.name && item.known_for_department) return 'person'
    return 'movie'
  }

  const getDisplayTitle = (item: SearchResult) => {
    const type = getMediaType(item)
    return type === 'person' ? item.name : item.title || item.name
  }

  const getImagePath = (item: SearchResult) => {
    if (!item.poster_path && !item.profile_path) {
      return '/sample-poster.jpg'
    }
    const path = item.poster_path || item.profile_path
    const fullUrl = path
      ? `https://image.tmdb.org/t/p/w200${path}`
      : '/sample-poster.jpg'

    return fullUrl
  }

  const getSubtitle = (item: SearchResult) => {
    const type = getMediaType(item)
    if (type === 'person') return item.known_for_department
    const date = item.release_date || item.first_air_date
    return date ? new Date(date).getFullYear() : 'No date'
  }

  const handleItemClick = (item: SearchResult) => {
    const mediaType = getMediaType(item)
    window.location.href = `/${mediaType}/${item.id}`
  }

  if (!query) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        {/*  Creative empty state with animated elements */}
        <div className='text-center space-y-8 max-w-2xl'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-pulse'></div>
            </div>
            <div className='relative z-10 flex items-center justify-center w-32 h-32 mx-auto'>
              <Search className='w-16 h-16 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <div className='space-y-4'>
            <h1 className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400'>
              Ready to Discover?
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-300 leading-relaxed'>
              Search through millions of movies, TV shows, and celebrities to
              find your next favorite entertainment
            </p>
          </div>
          <div className='flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
              <Film className='w-4 h-4 text-blue-500' />
              <span>Movies</span>
            </div>
            <div className='flex items-center gap-2'>
              <Tv className='w-4 h-4 text-green-500' />
              <span>TV Shows</span>
            </div>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-purple-500' />
              <span>People</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        {/*  Creative error state */}
        <div className='text-center space-y-6 max-w-md'>
          <div className='w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto'>
            <Zap className='w-12 h-12 text-red-500' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-red-600 dark:text-red-400'>
              Oops! Something went wrong
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              We couldn&apos;t fetch your search results. Please try again in a
              moment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        {/*  Creative loading state */}
        <div className='text-center space-y-6'>
          <LoadingSpinner size={60} />
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Searching the universe...
            </h2>
            <p className='text-gray-600 dark:text-gray-300'>
              Finding the perfect matches for {`"${decodeURIComponent(query)}"`}
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        {/*  Creative no results state */}
        <div className='text-center space-y-6 max-w-lg'>
          <div className='w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto'>
            <Search className='w-16 h-16 text-gray-400' />
          </div>
          <div className='space-y-3'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              No matches found
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              We couldn&apos;t find anything for{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                {`"${decodeURIComponent(query)}"`}
              </span>
            </p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Try different keywords or check your spelling
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className='min-h-screen lg:py-12 py-5 px-5 lg:px-8'>
      <div className='lg:w-[80%] w-full mx-auto space-y-5'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center'>
            <Search className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <h1 className='lg:text-3xl text-xl font-semibold text-gray-900 dark:text-white'>
              Search Results
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              Found{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                {data.results.length}
              </span>{' '}
              results for {`"${decodeURIComponent(query)}"`}
            </p>
          </div>
        </div>

        {/*  Creative masonry-style grid layout */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
          {data.results.map((item) => (
            <div
              key={`${getMediaType(item)}-${item.id}`}
              className={`group relative bg-white space-y-2 dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-2`}
              onClick={() => handleItemClick(item)}
              role='button'
              aria-label={`View ${getDisplayTitle(item)} (${getMediaType(
                item
              )})`}
            >
              {/*  Enhanced image container with creative overlays */}
              <div className='relative w-full h-80 overflow-hidden'>
                <Image
                  src={getImagePath(item)}
                  alt={getDisplayTitle(item) || 'Media'}
                  width={500}
                  height={500}
                  quality={100}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                />

                {/* Creative gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                {/* Media type badge with creative styling */}
                <div className='absolute top-4 right-4'>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
                      getMediaType(item) === 'movie'
                        ? 'bg-blue-500/90 text-white'
                        : getMediaType(item) === 'tv'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-purple-500/90 text-white'
                    }`}
                  >
                    {getMediaType(item) === 'movie' && (
                      <Film className='w-3 h-3' />
                    )}
                    {getMediaType(item) === 'tv' && <Tv className='w-3 h-3' />}
                    {getMediaType(item) === 'person' && (
                      <User className='w-3 h-3' />
                    )}
                    <span className='capitalize'>{getMediaType(item)}</span>
                  </div>
                </div>

                {/* Hover overlay with additional info */}
                <div className='absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
                  <div className='flex items-center gap-2 text-white text-sm'>
                    <Calendar className='w-4 h-4' />
                    <span>{getSubtitle(item)}</span>
                  </div>
                </div>
              </div>

              {/*  Enhanced content area with better typography */}
              <div className='p-2 space-y-1'>
                <h2 className='text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'>
                  {getDisplayTitle(item)}
                </h2>

                <div className='flex items-center justify-between'>
                  <p className='text-sm text-gray-400 dark:text-gray-300'>
                    {getSubtitle(item)}
                  </p>
                  <div className='flex items-center gap-1 text-yellow-500'>
                    <Star className='w-4 h-4 fill-current' />
                    <span className='text-xs font-semibold'>
                      {(Math.random() * 4 + 6).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.total_pages > 1 && (
          <div className='pt-12'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={
                      page === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* Show first page and ellipsis if needed */}
                {page > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setPage(1)}
                        className='cursor-pointer'
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {/* Show pages around current page */}
                {Array.from(
                  { length: Math.min(3, data.total_pages) },
                  (_, i) => {
                    const startPage = Math.max(1, page - 1)
                    const pageNum = startPage + i
                    if (pageNum > data.total_pages) return null

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => {
                            setPage(pageNum)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          isActive={pageNum === page}
                          className='cursor-pointer'
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                ).filter(Boolean)}

                {/* Show last page and ellipsis if needed */}
                {page < data.total_pages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => {
                          setPage(data.total_pages)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className='cursor-pointer'
                      >
                        {data.total_pages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      setPage((prev) => Math.min(prev + 1, data.total_pages))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={
                      page === data.total_pages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page info */}
            <div className='text-center pt-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Showing page{' '}
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  {page}
                </span>{' '}
                of <span className='font-semibold'>{data.total_pages}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Fallback component for Suspense
function SearchFallback() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4'>
      <div className='text-center space-y-6'>
        <LoadingSpinner size={60} />
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Loading search page...
          </h2>
          <p className='text-gray-600 dark:text-gray-300'>
            Preparing your search experience
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  )
}
