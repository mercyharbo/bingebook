import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-12 sm:py-16 px-4 space-y-4 sm:space-y-5'>
    <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700'>
      <div className='text-3xl sm:text-4xl'>🍿</div>
    </div>
    <div className='text-center space-y-2'>
      <h3 className='text-lg sm:text-xl font-medium text-gray-900 dark:text-white'>
        Your watchlist is empty
      </h3>
      <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md leading-relaxed'>
        Start building your personal collection of movies and TV shows you want
        to watch.
      </p>
    </div>
    <Button
      size='lg'
      className='w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white'
      asChild
    >
      <Link href='/discover'>
        <Plus className='size-4' />
        Start tracking your favorites
      </Link>
    </Button>
  </div>
)

export default EmptyState
