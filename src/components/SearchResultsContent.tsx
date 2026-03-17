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
          <h1 className='text-3xl sm:text-4xl font-medium sm:font-bold text-slate-900 dark:text-white'>
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
          <h2 className='text-2xl font-medium text-red-600 mb-2'>Oops!</h2>
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
          <h2 className='text-xl font-medium'>No results found</h2>
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
          <h1 className='text-2xl sm:text-3xl font-medium'>
            Search Results for &quot;{query}&quot;
          </h1>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {data.results.map((item: SearchResult) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className='group relative flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-md overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]'
            >
              <div className='relative aspect-[2/3] overflow-hidden rounded-t-md'>
                <Image
                  src={getImagePath(item)}
                  alt={getDisplayTitle(item) || 'Media poster'}
                  className='object-cover transition-transform duration-700 group-hover:scale-110'
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              </div>

              <div className='px-4 py-3 space-y-1'>
                <h2 className='font-medium text-white text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors'>
                  {getDisplayTitle(item)}
                </h2>

                <div className='flex items-center justify-between text-[11px] font-medium text-white/40'>
                  <div className='flex items-center gap-1.5'>
                    {getMediaType(item) === 'movie' && (
                      <Film className='size-3' />
                    )}
                    {getMediaType(item) === 'tv' && <Tv className='size-3' />}
                    {getMediaType(item) === 'person' && (
                      <User className='size-3' />
                    )}
                    <span className="uppercase">{getMediaType(item)}</span>
                  </div>
                  <span>{getSubtitle(item)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.total_pages > 1 && (
          <div className="flex justify-center pt-8">
            <Pagination className='justify-center'>
              <PaginationContent className="bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`rounded-lg transition-all ${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'}`}
                  />
                </PaginationItem>
                {[...Array(Math.min(5, data.total_pages))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                      className={`rounded-lg transition-all cursor-pointer ${page === i + 1 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary' : 'hover:bg-white/10'}`}
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
                    className={`rounded-lg transition-all ${page === data.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
