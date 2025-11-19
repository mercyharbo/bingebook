import { Skeleton } from '@/components/ui/skeleton'

// Hero Section Skeleton Component
export const HeroSkeleton = () => (
  <section className='relative h-[90vh] w-full -mt-16 overflow-hidden'>
    <div className='relative w-full h-full'>
      <section className='relative h-screen overflow-hidden'>
        <Skeleton className='absolute inset-0 w-full h-full' />
        <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />

        {/* Content */}
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
            index === 0 ? 'w-8 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/40'
          } rounded-full`}
        />
      ))}
    </div>
  </section>
)

// Card Skeleton Component
export const CardSkeleton = () => (
  <div className='snap-start shrink-0 w-64'>
    <div className='space-y-3'>
      <Skeleton className='w-full h-96 rounded-lg' />
      <div className='space-y-1'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex justify-between'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>
    </div>
  </div>
)

// Section Skeleton Component
export const SectionSkeleton = () => (
  <section className='space-y-5'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-6 w-40' />
        <Skeleton className='h-6 w-6 rounded' />
      </div>
      <Skeleton className='h-8 w-16' />
    </div>
    <div className='flex gap-6 snap-x snap-mandatory px-4 scrollbar-hide overflow-auto'>
      {Array.from({ length: 5 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  </section>
)
