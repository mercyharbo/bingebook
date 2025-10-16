import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Hero Section Skeleton Component
export const HeroSkeleton = () => (
  <section className='relative h-[70vh] overflow-hidden rounded-2xl mx-5 lg:mx-10'>
    <Skeleton className='absolute inset-0 w-full h-full rounded-2xl' />
    <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />
    <div className='absolute inset-0 flex items-center z-10'>
      <div className='container mx-auto px-8 lg:px-16'>
        <div className='max-w-2xl space-y-6'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-32 bg-white/20' />
            <Skeleton className='h-16 w-96 bg-white/20' />
          </div>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-6 w-16 bg-white/20' />
            <Skeleton className='h-6 w-24 bg-white/20' />
            <Skeleton className='h-6 w-12 bg-white/20' />
          </div>
          <Skeleton className='h-20 w-full max-w-xl bg-white/20' />
          <div className='flex gap-4'>
            <Skeleton className='h-12 w-40 bg-white/20' />
            <Skeleton className='h-12 w-32 bg-white/20' />
          </div>
        </div>
      </div>
    </div>
    {/* Navigation Arrows Skeletons */}
    <Skeleton className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-white/20' />
    <Skeleton className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-white/20' />
    {/* Slide Indicators Skeleton */}
    <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className='w-3 h-3 rounded-full bg-white/20' />
      ))}
    </div>
  </section>
)

// Card Skeleton Component
export const CardSkeleton = () => (
  <div className='snap-start shrink-0 w-72'>
    <Card className='overflow-hidden p-0'>
      <Skeleton className='w-full h-48' />
      <CardContent className='p-2 space-y-2'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-8' />
            <Skeleton className='h-4 w-20' />
          </div>
        </div>
      </CardContent>
    </Card>
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
