import { Skeleton } from '@/components/ui/skeleton'

export default function DiscoverLoadingSkeleton() {
  return (
    <main className='-mt-16'>
      {/* Hero Section Skeleton */}
      <section className='relative h-[90vh] w-full overflow-hidden bg-gray-900'>
        <div className='relative w-full h-full'>
          <Skeleton className='w-full h-full' />
          <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />

          {/* Content Skeleton */}
          <div className='absolute inset-0 flex items-center z-10'>
            <div className='container mx-auto px-8 lg:px-16'>
              <div className='max-w-2xl space-y-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-8 w-32 rounded-3xl' />
                  <Skeleton className='h-12 w-3/4 lg:h-16' />
                </div>

                <div className='flex items-center gap-4'>
                  <Skeleton className='h-6 w-12' />
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-6 w-16' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-4/5' />
                  <Skeleton className='h-4 w-3/5' />
                </div>

                <div className='flex gap-4'>
                  <Skeleton className='h-12 w-40' />
                  <Skeleton className='h-12 w-32' />
                </div>
              </div>
            </div>
          </div>
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
              <div className='space-y-2'>
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
