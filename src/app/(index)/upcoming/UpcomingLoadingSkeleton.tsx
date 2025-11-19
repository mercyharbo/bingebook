import { Skeleton } from '@/components/ui/skeleton'

export default function UpcomingLoadingSkeleton() {
  return (
    <main className='-mt-16'>
      {/* Hero Section Skeleton */}
      <section className='relative h-[90vh] w-full overflow-hidden bg-gray-900'>
        <div className='relative w-full h-full'>
          <section className='relative h-screen overflow-hidden'>
            <Skeleton className='absolute inset-0 w-full h-full' />
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />

            {/* Content Skeleton */}
            <div className='absolute inset-0 flex items-center z-10'>
              <div className='w-[80%] mx-auto'>
                <div className='max-w-2xl space-y-6'>
                  <div className='space-y-2'>
                    <Skeleton className='h-8 w-32 bg-white/20 rounded-3xl' />
                    <Skeleton className='h-12 lg:h-16 w-3/4 bg-white/20' />
                  </div>

                  <div className='flex items-center gap-4'>
                    <Skeleton className='h-6 w-16 bg-white/20' />
                    <Skeleton className='h-6 w-24 bg-white/20' />
                    <Skeleton className='h-6 w-12 bg-white/20' />
                  </div>

                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full bg-white/20' />
                    <Skeleton className='h-4 w-4/5 bg-white/20' />
                    <Skeleton className='h-4 w-3/5 bg-white/20' />
                  </div>

                  <div className='flex gap-4'>
                    <Skeleton className='h-12 w-40 bg-white/20' />
                    <Skeleton className='h-12 w-32 bg-white/20' />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation Arrows Skeletons */}
        <Skeleton className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-black/20' />
        <Skeleton className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-black/20' />

        {/* Slide Indicators Skeleton */}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className={`${
                index === 0
                  ? 'w-8 h-3 bg-white shadow-lg'
                  : 'w-3 h-3 bg-white/40'
              } rounded-full`}
            />
          ))}
        </div>
      </section>

      <div className='flex flex-col gap-6 w-full px-5 mx-auto lg:px-16'>
        {/* Header Skeleton */}
        <header className='flex flex-col lg:flex-row justify-between items-center w-full gap-5 py-6'>
          <Skeleton className='h-8 w-48' />

          <div className='flex gap-2 w-full lg:w-auto'>
            <Skeleton className='h-10 w-[180px]' />
            <Skeleton className='h-10 w-24' />
          </div>
        </header>

        {/* Media Grid Skeleton */}
        <section className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className='space-y-3'>
              <Skeleton className='w-full h-96 rounded-lg' />
              <div className='space-y-1'>
                <Skeleton className='h-5 w-3/4' />
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-16' />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Pagination Skeleton */}
        <div className='flex justify-center items-center gap-2 py-6'>
          <Skeleton className='h-10 w-10' />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className='h-10 w-10' />
          ))}
          <Skeleton className='h-10 w-10' />
        </div>
      </div>
    </main>
  )
}
