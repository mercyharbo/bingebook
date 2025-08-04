'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { fetcher } from '@/lib/utils'
import { Movie } from '@/types/movie'
import { isAfter, parseISO } from 'date-fns'
import { Bell, Calendar, Clock, MoreHorizontal, Play, Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

const mockContinueWatching = [
  {
    title: 'Breaking Bad',
    season: 2,
    episode: 5,
    progress: 65,
    thumbnail: '/placeholder.svg?height=200&width=300&text=Breaking+Bad',
    rating: 9.5,
    genre: 'Drama',
  },
  {
    title: 'A Quiet Place',
    progress: 30,
    thumbnail: '/placeholder.svg?height=200&width=300&text=A+Quiet+Place',
    rating: 7.5,
    genre: 'Horror',
    duration: '90 min',
  },
  {
    title: 'The Office',
    season: 3,
    episode: 12,
    progress: 85,
    thumbnail: '/placeholder.svg?height=200&width=300&text=The+Office',
    rating: 8.7,
    genre: 'Comedy',
  },
]

const mockUpcoming = [
  {
    title: 'The Boys',
    type: 'Episode',
    date: 'Aug 4',
    thumbnail: '/placeholder.svg?height=200&width=300&text=The+Boys',
    description: 'Season 4 finale',
    isNew: true,
  },
  {
    title: 'Joker 2',
    type: 'Movie Release',
    date: 'Oct 15',
    thumbnail: '/placeholder.svg?height=200&width=300&text=Joker+2',
    description: 'Folie à Deux',
    isNew: false,
  },
  {
    title: 'House of Dragon',
    type: 'Episode',
    date: 'Aug 8',
    thumbnail: '/placeholder.svg?height=200&width=300&text=House+of+Dragon',
    description: 'Season 2 continues',
    isNew: true,
  },
]

const mockNotifications = [
  {
    message: "New episode of 'The Bear' drops tomorrow",
    time: '2 hours ago',
    type: 'episode',
    isRead: false,
  },
  {
    message: "Your watchlist item 'Dune 2' is now available",
    time: '1 day ago',
    type: 'available',
    isRead: false,
  },
  {
    message: "Reminder: 'Stranger Things' finale airs tonight",
    time: '3 days ago',
    type: 'reminder',
    isRead: true,
  },
]

export default function HomePageComp() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [moviesList, setMoviesList] = useState(null)
  const [upcomingMovies, setUpcomingMovies] = useState(null)

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/discover/movie`,
    fetcher,
    {
      onSuccess: (data) => {
        setMoviesList(data)
      },
    }
  )

  const {} = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
      },
    }
  )

  const markAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((notif, i) => (i === index ? { ...notif, isRead: true } : notif))
    )
  }

  const unreleasedMovies = (upcomingMovies ?? [])
    .filter((item: Movie) => isAfter(parseISO(item.release_date), new Date()))
    .slice(0, 10)

  console.log('upcoming', upcomingMovies)

  return (
    <div className='p-5 lg:p-10 space-y-10'>
      {/* Continue Watching Section */}
      <section className='space-y-5'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Play className='h-6 w-6 text-primary' />
            Continue Watching
          </h2>
          <Button variant='ghost' size='sm'>
            View All
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
          {mockContinueWatching.map((item, i) => (
            <Card
              key={i}
              className='group hover:shadow-lg transition-all duration-300 overflow-hidden p-0'
            >
              <div className='relative'>
                <Image
                  src={item.thumbnail || '/placeholder.svg'}
                  alt={item.title}
                  width={500}
                  height={500}
                  className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
                <Button
                  size='icon'
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Play className='h-4 w-4' />
                </Button>
                <div className='absolute top-2 right-2 flex gap-1'>
                  <Badge variant='secondary' className='text-xs'>
                    <Star className='h-3 w-3 mr-1' />
                    {item.rating}
                  </Badge>
                </div>
              </div>

              <CardContent className='p-2 space-y-3'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-2'>
                    <h3 className='font-semibold text-lg'>{item.title}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {item.season
                        ? `S${item.season}E${item.episode}`
                        : item.duration}{' '}
                      • {item.genre}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>
                        Remove from Continue Watching
                      </DropdownMenuItem>
                      <DropdownMenuItem>Add to Watchlist</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Watched</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Progress</span>
                    <span className='font-medium'>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className='h-2' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Releases Section */}
      <section className='space-y-5'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Calendar className='h-6 w-6 text-primary' />
            Upcoming Releases
          </h2>
          <Button variant='ghost' size='sm'>
            View Calendar
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <div className='flex gap-6 snap-x snap-mandatory px-4'>
            {unreleasedMovies?.map((item: Movie) => (
              <div key={item.id} className='snap-start shrink-0 w-72'>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Bell className='h-6 w-6 text-primary' />
            Notifications
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <Badge variant='destructive' className='rounded-full'>
                {notifications.filter((n) => !n.isRead).length}
              </Badge>
            )}
          </h2>
          <Button variant='ghost' size='sm'>
            Mark All Read
          </Button>
        </div>

        <div className='space-y-3'>
          {notifications.map((notification, i) => (
            <Card
              key={i}
              className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => markAsRead(i)}
            >
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${
                      !notification.isRead ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <div className='flex-1 space-y-2'>
                    <p
                      className={`text-sm ${
                        !notification.isRead
                          ? 'font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-xs text-muted-foreground'>
                        {notification.time}
                      </span>
                      <Badge variant='outline' className='text-xs capitalize'>
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
