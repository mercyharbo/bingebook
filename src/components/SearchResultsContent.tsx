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
import { Film, Search, Tv, User } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
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

export default function SearchResultsContent() {
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
    window.location.href = `/${getMediaType(item)}/${item.id}`
  }

  if (!query) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        <div className='text-center space-y-8 max-w-2xl'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-pulse'></div>
            </div>
            <div className='relative z-10 flex items-center justify-center w-32 h-32 mx-auto'>
              <Search className='w-16 h-16 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white'>
            Find Something to Watch
          </h1>
          <p className='text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto'>
            Search for your favorite movies, TV shows, or people from the
            entertainment world.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size={12} />
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>Oops!</h2>
          <p className='text-slate-600'>
            Something went wrong. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (!data?.results?.length) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center px-4'>
        <div className='text-center space-y-4'>
          <div className='w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto'>
            <Search className='w-12 h-12 text-slate-400' />
          </div>
          <h2 className='text-xl font-semibold'>No results found</h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Try adjusting your search or try a different term
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen py-8 px-4 sm:px-6'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl sm:text-3xl font-bold'>
            Search Results for &quot;{query}&quot;
          </h1>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {data.results.map((item: SearchResult) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className='bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer group'
            >
              <div className='relative aspect-[2/3]'>
                <Image
                  src={getImagePath(item)}
                  alt={getDisplayTitle(item) || 'Media poster'}
                  className='object-cover'
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>

              <div className='p-4 space-y-2'>
                <h2 className='font-semibold text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200'>
                  {getDisplayTitle(item)}
                </h2>

                <div className='flex items-center text-sm text-slate-600 dark:text-slate-400 gap-2'>
                  {getMediaType(item) === 'movie' && (
                    <Film className='w-4 h-4' />
                  )}
                  {getMediaType(item) === 'tv' && <Tv className='w-4 h-4' />}
                  {getMediaType(item) === 'person' && (
                    <User className='w-4 h-4' />
                  )}
                  <span>{getSubtitle(item)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.total_pages > 1 && (
          <Pagination className='justify-center'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(Math.min(5, data.total_pages))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {data.total_pages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) => Math.min(data.total_pages, p + 1))
                  }
                  className={
                    page === data.total_pages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
