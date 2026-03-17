import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function OverviewTab({ movie, director }: { movie: any; director: any }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
      <div className='lg:col-span-2 space-y-10'>
        <div className='space-y-4'>
          <h2 className='text-xl font-bold'>Storyline</h2>
          <p className='text-gray-300 leading-relaxed font-medium'>
            {movie.overview || 'No overview available.'}
          </p>
        </div>

        {director && (
          <div className='space-y-4'>
            <h3 className='text-xl font-medium'>Director</h3>
            <Link
              href={`/person/${director.id}`}
              className='inline-flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10 transition-all hover:bg-white/10'
            >
              <div className='size-14 relative overflow-hidden rounded-xl'>
                <Image
                  src={
                    director.profile_path
                      ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                      : '/avatar.jpg'
                  }
                  alt={director.name}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='pr-4'>
                <span className='block font-medium text-lg'>{director.name}</span>
                <span className='text-white/40 text-sm'>Directorial Lead</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      <div className='space-y-8'>
        <Card className='glass-dark'>
          <CardHeader>
            <CardTitle className='text-xl'>Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Status</span>
              <span className='text-right'>{movie.status}</span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Released</span>
              <span className='text-right'>{movie.release_date}</span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Original Language</span>
              <span className='uppercase text-right'>{movie.original_language}</span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Budget</span>
              <span className='text-right'>
                {movie.budget > 0 ? formatCurrency(movie.budget) : 'N/A'}
              </span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Revenue</span>
              <span className='text-right'>
                {movie.revenue > 0 ? formatCurrency(movie.revenue) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
