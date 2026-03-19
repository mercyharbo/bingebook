'use client'

import { Calendar, ChevronLeft, Clock, Plus, Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import useSWR from 'swr'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { WatchlistItem } from '@/types/watchlist'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import TrailerDialog from './TrailerDialog'
import CastTab from './components/CastTab'
import OverviewTab from './components/OverviewTab'
import ReviewsTab from './components/ReviewsTab'
import VideosTab from './components/VideosTab'

interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  runtime: number
  vote_average: number
  vote_count: number
  popularity: number
  budget: number
  revenue: number
  status: string
  tagline: string
  homepage: string
  imdb_id: string
  original_language: string
  original_title: string
  adult: boolean
  genres: Array<{ id: number; name: string }>
  production_companies: Array<{
    id: number
    name: string
    logo_path: string
    origin_country: string
  }>
  production_countries: Array<{ iso_3166_1: string; name: string }>
  spoken_languages: Array<{ iso_639_1: string; name: string }>
}

interface Cast {
  id: number
  name: string
  character: string
  profile_path: string
  order: number
}

interface Crew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string
}

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

interface Review {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string
    rating: number
  }
  content: string
  created_at: string
  updated_at: string
}

export default function MovieDetailsComp({ movieId }: { movieId: string }) {
  const supabase = createClient()

  const [watchlistItem, setWatchlistItem] = useState<WatchlistItem | null>(null)

  const {
    setAddingToWatchlist,
    addingToWatchlist,
    isRemovingFromWatchlist,
    setIsRemovingFromWatchlist,
    isLoadingWatchlist,
    setIsLoadingWatchlist,
  } = useWatchlistStore()

  // Fetch movie details
  const {
    data: movie,
    error: movieError,
    isLoading: movieLoading,
    mutate,
  } = useSWR<MovieDetails>(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}?language=en-US`
      : null,
    fetcher,
  )

  // Fetch credits
  const { data: credits } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/credits?language=en-US`
      : null,
    fetcher,
  )

  // Fetch videos
  const { data: videos } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/videos?language=en-US`
      : null,
    fetcher,
  )

  // Fetch reviews
  const { data: reviews } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/reviews?language=en-US&page=1`
      : null,
    fetcher,
  )

  useEffect(() => {
    const fetchWatchlist = async () => {
      setIsLoadingWatchlist(true)
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()
        if (sessionError || !sessionData.session) {
          setIsLoadingWatchlist(false)
          return
        }

        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .eq('tmdb_id', movieId)
          .eq('media_type', 'movie')
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching watchlist:', error)
          toast.error('Failed to load watchlist')
        } else {
          setWatchlistItem(data || null)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('An unexpected error occurred')
      } finally {
        setIsLoadingWatchlist(false)
      }
    }
    if (movie) fetchWatchlist()
  }, [movie, supabase, movieId, setIsLoadingWatchlist])

  const cast: Cast[] = credits?.cast?.slice(0, 10) || []
  const crew: Crew[] = credits?.crew || []
  const director = crew.find((person) => person.job === 'Director')
  const trailers: Video[] =
    videos?.results?.filter((video: Video) => video.type === 'Trailer') || []
  const movieReviews: Review[] = reviews?.results || []

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const addToWatchlist = async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      toast.error('Please log in to add to watchlist')
      return
    }

    setAddingToWatchlist(true)

    const userId = sessionData.session.user.id
    const tmdbData = { ...movie }
    const { error } = await supabase.from('watchlist').insert({
      user_id: userId,
      tmdb_id: movie?.id,
      media_type: 'movie',
      tmdb_data: tmdbData,
      poster_path: movie?.poster_path,
      is_seen: false,
      seen_episodes: {},
      completed_seasons: [],
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })

    if (error) {
      console.error('Error adding to watchlist:', error)
      toast.error('Failed to add to watchlist')
    } else {
      toast.success('Added to watchlist successfully')
      setAddingToWatchlist(false)
      window.location.reload()
    }
  }

  const removeFromWatchlist = async () => {
    if (!watchlistItem) return
    setIsRemovingFromWatchlist(true)
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistItem?.id)
      if (error) {
        console.error('Error removing from watchlist:', error)
        toast.error('Failed to remove from watchlist')
      } else {
        setWatchlistItem(null)
        toast.success('Removed from watchlist successfully')
        setIsRemovingFromWatchlist(false)
        mutate()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  if (movieLoading) {
    return (
      <div className='min-h-screen bg-gradient-premium'>
        <div className='relative h-[70vh]'>
          <Skeleton className='w-full h-full opacity-20' />
        </div>
        <div className='container mx-auto px-6 py-12'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <div className='md:col-span-2 space-y-6'>
              <Skeleton className='h-12 w-3/4 opacity-20' />
              <Skeleton className='h-6 w-full opacity-20' />
              <Skeleton className='h-6 w-full opacity-20' />
              <Skeleton className='h-6 w-2/3 opacity-20' />
            </div>
            <div className='space-y-6'>
              <Skeleton className='h-[400px] w-full rounded-lg opacity-20' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (movieError || !movie) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-premium'>
        <div className='text-center space-y-6 glass-dark p-12 rounded-lg border border-white/5'>
          <h1 className='text-3xl font-bold text-glow'>Movie Not Found</h1>
          <p className='text-muted-foreground'>
            The movie you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button
            onClick={() => window.history.back()}
            className='rounded-xl px-8 h-12'
          >
            <ChevronLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-premium overflow-x-hidden'>
      {/* Hero Section */}
      <div className='relative h-[85vh] lg:h-[90vh] overflow-hidden'>
        {movie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className='object-cover opacity-60'
            priority
            sizes='100vw'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-[#02010a] via-[#02010a]/40 to-transparent' />

        <div className='absolute bottom-0 left-0 right-0 py-20'>
          <div className='container mx-auto px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row gap-10 items-start lg:items-end'>
              <div className='flex-shrink-0 w-[200px] lg:w-[280px] group relative'>
                
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/sample-poster.jpg'
                  }
                  alt={movie.title}
                  width={280}
                  height={420}
                  className='relative rounded-lg shadow-2xl w-full border border-white/10'
                  sizes='(max-width: 640px) 200px, 280px'
                />
              </div>

              <div className='flex-1 space-y-6'>
                <div className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    {movie.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        className='bg-primary/20 hover:bg-primary/30 text-primary-foreground border-none rounded-full px-4 py-1 text-xs font-medium backdrop-blur-md'
                      >
                        {genre.name}
                      </Badge>
                    ))}
                    {movie.status === 'Released' && (
                      <Badge className='bg-green-500/20 text-green-400 border-none rounded-full px-4 py-1 text-xs font-medium backdrop-blur-md'>
                        Released
                      </Badge>
                    )}
                  </div>
                  <h1 className='text-3xl lg:text-5xl font-black text-white text-glow'>
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className=' text-gray-300 font-medium italic max-w-2xl'>
                      &quot;{movie.tagline}&quot;
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap gap-6 items-center text-white/80 font-medium'>
                  <div className='flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md backdrop-blur-md border border-white/10'>
                    <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                    <span className=''>{movie.vote_average.toFixed(1)}</span>
                    <span className='text-white/40 text-sm'>
                      ({movie.vote_count.toLocaleString()})
                    </span>
                  </div>

                  {movie.runtime > 0 && (
                    <div className='flex items-center gap-2'>
                      <Clock className='h-5 w-5 text-primary' />
                      <span className=''>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}

                  <div className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5 text-primary' />
                    <span className=''>
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-4 pt-4'>
                  {trailers.length > 0 && (
                    <TrailerDialog
                      trailerKey={trailers[0].key}
                      trailerName={trailers[0].name}
                    />
                  )}

                  {!watchlistItem && !isLoadingWatchlist && (
                    <Button
                      size='lg'
                      variant='outline'
                      onClick={addToWatchlist}
                      disabled={addingToWatchlist}
                      className='h-12 px-8 border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95'
                    >
                      {addingToWatchlist ? (
                        <LoadingSpinner size={24} color='white' />
                      ) : (
                        <>
                          <Plus className='h-6 w-6 mr-2' />
                          Add to Watchlist
                        </>
                      )}
                    </Button>
                  )}

                  {watchlistItem && !isLoadingWatchlist && (
                    <Button
                      size='lg'
                      variant='destructive'
                      onClick={removeFromWatchlist}
                      disabled={isRemovingFromWatchlist}
                      className='h-12 px-8 shadow-destructive/20 transition-all hover:scale-105 active:scale-95'
                    >
                      {isRemovingFromWatchlist ? (
                        <LoadingSpinner size={24} color='white' />
                      ) : (
                        <>
                          <Trash2 className='h-6 w-6 mr-2' />
                          Remove from Library
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className='container mx-auto px-6 lg:px-12 py-12'>
        <Tabs defaultValue='overview' className='w-full space-y-12'>
          <TabsList className='bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-lg h-14 w-full lg:w-max mx-auto lg:mx-0 overflow-x-auto scrollbar-hide justify-start lg:justify-center'>
            <TabsTrigger
              value='overview'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-shrink-0'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='cast'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-shrink-0'
            >
              Cast
            </TabsTrigger>
            <TabsTrigger
              value='videos'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-shrink-0'
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value='reviews'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-shrink-0'
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'
          >
            <OverviewTab movie={movie} director={director} />
          </TabsContent>

          <TabsContent
            value='cast'
            className='mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'
          >
            <CastTab cast={cast} />
          </TabsContent>

          <TabsContent
            value='videos'
            className='mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'
          >
            <VideosTab trailers={trailers} />
          </TabsContent>

          <TabsContent
            value='reviews'
            className='mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'
          >
            <ReviewsTab movieReviews={movieReviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
