'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function WatchlistLoadingSkeleton() {
  return (
    <main className='min-h-screen dark:bg-background p-5 lg:p-10 space-y-5'>
      {/* Enhanced Header Skeleton */}
      <header className='relative'>
        <div className='relative flex flex-col justify-center items-center gap-8 py-8 lg:py-12'>
          {/* Hero Section Skeleton */}
          <div className='text-center space-y-4 px-4 max-w-3xl mx-auto'>
            <Skeleton className='w-16 h-16 rounded-2xl mx-auto mb-4' />
            <Skeleton className='h-8 sm:h-10 md:h-12 w-80 mx-auto' />
            <Skeleton className='h-4 w-96 mx-auto' />
          </div>

          {/* Controls Section Skeleton */}
          <div className='w-full max-w-4xl mx-auto space-y-6'>
            {/* Search and Sort Skeleton */}
            <div className='flex flex-col lg:flex-row gap-4 max-w-2xl mx-auto'>
              <Skeleton className='h-12 flex-1' />
              <Skeleton className='h-12 w-full lg:w-48' />
            </div>

            {/* Filter Buttons Skeleton */}
            <div className='flex flex-wrap justify-center gap-2 sm:gap-3'>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className='h-10 w-20 sm:w-24 rounded-full'
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Cards Grid Skeleton */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
        {Array.from({ length: 20 }).map((_, index) => (
          <Card key={index} className='overflow-hidden p-2 gap-2'>
            {/* Poster Skeleton */}
            <div className='relative'>
              <Skeleton className='w-full h-72 rounded-t-lg' />

              {/* Badges Skeleton */}
              <div className='absolute top-2 right-2 flex flex-row gap-2'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-5 w-12' />
              </div>

              {/* Action Buttons Skeleton */}
              <div className='absolute bottom-2 right-0 flex justify-center items-center gap-1 sm:gap-2 w-full px-2'>
                <Skeleton className='h-8 sm:h-10 flex-1 sm:w-[80%]' />
                <Skeleton className='h-8 sm:h-10 w-8 sm:w-12' />
              </div>
            </div>

            <CardContent className='space-y-2 sm:space-y-3 px-2 sm:px-4 pb-4'>
              <div className='space-y-1.5 sm:space-y-2'>
                {/* Title Skeleton */}
                <Skeleton className='h-5 sm:h-6 w-full' />

                {/* Date and Rating Skeleton */}
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-3 w-12' />
                </div>
              </div>

              {/* Progress/Action Button Skeleton */}
              <Skeleton className='h-8 w-full' />

              {/* Genres Skeleton */}
              <div className='flex flex-wrap gap-1'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-5 w-20' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
