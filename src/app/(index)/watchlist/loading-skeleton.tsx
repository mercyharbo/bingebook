'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function WatchlistLoadingSkeleton() {
  return (
    <main className='min-h-screen dark:bg-background p-5 lg:p-10 space-y-5'>
      {/* Header Skeleton */}
      <header className='relative flex flex-col md:flex-row justify-between items-center gap-8 py-5 lg:py-8'>
        {/* Hero Section Skeleton */}
        <div className='text-center md:text-left space-y-2 px-4 max-w-lg'>
          <Skeleton className='h-8 w-48 mx-auto md:mx-0' />
          <Skeleton className='h-4 w-80 mx-auto md:mx-0' />
        </div>

        {/* Controls Section Skeleton */}
        <div className='w-full md:w-auto space-y-6'>
          {/* Search and Filter Skeleton */}
          <div className='flex flex-col lg:flex-row gap-4 w-full lg:max-w-xl mx-auto'>
            <Skeleton className='h-11 flex-1' />
            <Skeleton className='h-12 w-full lg:w-auto' />
          </div>
        </div>
      </header>

      {/* Cards Grid Skeleton */}
      <div className='grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:px-14 3xl:grid-cols-6'>
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className='group cursor-pointer'>
            {/* Poster Skeleton */}
            <div className='relative mb-3 overflow-hidden rounded-lg'>
              <Skeleton className='w-full h-96 rounded-lg' />

              {/* Badges Skeleton */}
              <div className='absolute top-2 left-2'>
                <Skeleton className='h-5 w-12' />
              </div>
              <div className='absolute top-2 right-2'>
                <Skeleton className='h-5 w-16' />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className='space-y-1'>
              <Skeleton className='h-5 w-full' />
              <div className='flex justify-between text-xs'>
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className='mt-6 flex justify-center'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-10 w-20' />
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    </main>
  )
}
