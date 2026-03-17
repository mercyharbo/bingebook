'use client'

import MovieCard from '@/components/MovieCard'
import { fetcher } from '@/lib/utils'
import { Movie } from '@/types/movie'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

interface TrendingGridProps {
  isInWatchlist: (id: number) => boolean
  addToWatchlist: (movie: Movie) => Promise<void>
  addingToWatchlist: boolean
}

export default function TrendingGrid({
  isInWatchlist,
  addToWatchlist,
  addingToWatchlist,
}: TrendingGridProps) {
  const [type, setType] = useState<'movie' | 'tv'>('movie')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/trending/${type}/week?page=${page}`,
    fetcher,
  )

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
        <h2 className='text-4xl font-black italic text-white uppercase'>
          Trending
        </h2>

        <Tabs
          defaultValue='movie'
          onValueChange={(val) => {
            setType(val as 'movie' | 'tv')
            setPage(1)
          }}
          className='w-full sm:w-max'
        >
          <TabsList className='bg-white/5 backdrop-blur-xl border border-white/10 p-1 h-12'>
            <TabsTrigger
              value='movie'
              className='px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-sm'
            >
              Movies
            </TabsTrigger>
            <TabsTrigger
              value='tv'
              className='px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-sm'
            >
              TV Shows
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6'>
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className='space-y-4'>
                <Skeleton className='aspect-[2/3] rounded-lg opacity-20' />
                <Skeleton className='h-4 w-3/4 opacity-20' />
              </div>
            ))
          : data?.results?.map((item: Movie) => (
              <MovieCard
                key={item.id}
                movie={item}
                isInWatchlist={isInWatchlist(item.id)}
                addToWatchlist={() => addToWatchlist(item)}
                addingToWatchlist={addingToWatchlist}
              />
            ))}
      </div>

      {data?.total_pages > 1 && (
        <div className='flex items-center justify-center gap-4 pt-12 pb-6'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className=' border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 size-10 text-white'
          >
            <ChevronLeft className='size-5' />
          </Button>

          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-white/40'>Page</span>
            <span className='text-sm font-medium text-white px-3 py-1 bg-primary/20 border border-primary/20 min-w-[2.5rem] text-center'>
              {page}
            </span>
            <span className='text-sm font-medium text-white/40'>
              of {Math.min(data.total_pages, 500)}
            </span>
          </div>

          <Button
            variant='outline'
            size='icon'
            onClick={() =>
              handlePageChange(Math.min(data.total_pages, page + 1))
            }
            disabled={page >= Math.min(data.total_pages, 500)}
            className=' border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 size-10 text-white'
          >
            <ChevronRight className='size-5' />
          </Button>
        </div>
      )}
    </div>
  )
}
