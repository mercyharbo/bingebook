'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { fetcher } from '@/lib/utils'
import { Movie } from '@/types/movie'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

export default function Upcoming() {
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[] | null>(null)

  const {} = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
      },
    }
  )
  return (
    <main className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 w-full p-5 lg:p-10'>
      {upcomingMovies?.map((item: Movie) => (
        <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden p-0 cursor-pointer'>
          <div className='relative'>
            <Image
              src={
                item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '/placeholder.svg'
              }
              alt={item.title}
              width={500}
              height={500}
              className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
          </div>

          <CardContent className='p-2 space-y-2'>
            <div className='flex items-start justify-between space-y-2'>
              <div className='flex-1 space-y-2'>
                <h3 className='font-semibold text-lg'>{item.title}</h3>
                <p className='text-sm text-muted-foreground line-clamp-4'>
                  {item.overview}
                </p>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {item.original_language.toUpperCase()}
                  </Badge>
                  <span className='text-sm font-medium text-primary'>
                    {item.release_date}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </main>
  )
}
