'use client'

import { Calendar, Plus, Star, Trash2, Tv } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import useSWR from 'swr'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { toast } from 'react-toastify'
import TrailerDialog from './TrailerDialog'
import CastTab from './components/CastTab'
import OverviewTab from './components/OverviewTab'
import ReviewsTab from './components/ReviewsTab'
import SeasonsTab from './components/SeasonsTab'
import VideosTab from './components/VideosTab'

interface TVShowDetails {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  first_air_date: string
  last_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  status: string
  tagline: string
  homepage: string
  original_language: string
  original_name: string
  adult: boolean
  in_production: boolean
  number_of_episodes: number
  number_of_seasons: number
  episode_run_time: number[]
  genres: Array<{ id: number; name: string }>
  networks: Array<{
    id: number
    name: string
    logo_path: string
    origin_country: string
  }>
  production_companies: Array<{
    id: number
    name: string
    logo_path: string
    origin_country: string
  }>
  production_countries: Array<{ iso_3166_1: string; name: string }>
  spoken_languages: Array<{ iso_639_1: string; name: string }>
  created_by: Array<{
    id: number
    name: string
    profile_path: string
  }>
  seasons: Array<{
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
    episode_count: number
    air_date: string
  }>
}

interface Cast {
  id: number
  name: string
  character: string
  profile_path: string
  order: number
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

export default function TvShowDetailsComp({ tvId }: { tvId: string }) {
  const supabase = createClient()

  const {
    setAddingToWatchlist,
    addingToWatchlist,
    isRemovingFromWatchlist,
    setIsRemovingFromWatchlist,
    isLoadingWatchlist,
    setIsLoadingWatchlist,
    watchlistItem,
    setWatchlistItem,
  } = useWatchlistStore()

  const {
    data: tvShow,
    error: tvError,
    isLoading: tvLoading,
    mutate,
  } = useSWR<TVShowDetails>(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}?language=en-US`
      : null,
    fetcher,
  )

  const { data: credits } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/credits?language=en-US`
      : null,
    fetcher,
  )

  const { data: videos } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/videos?language=en-US`
      : null,
    fetcher,
  )

  const { data: reviews } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/reviews?language=en-US&page=1`
      : null,
    fetcher,
  )

  useEffect(() => {
    const fetchWatchlist = async () => {
      setIsLoadingWatchlist(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          setIsLoadingWatchlist(false)
          return
        }

        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .eq('tmdb_id', tvId)
          .eq('media_type', 'tv')
          .single()

        if (!error) setWatchlistItem(data)
      } finally {
        setIsLoadingWatchlist(false)
      }
    }
    if (tvShow) fetchWatchlist()
  }, [tvShow, supabase, tvId, setIsLoadingWatchlist, setWatchlistItem])

  const cast: Cast[] = credits?.cast?.slice(0, 10) || []
  const trailers: Video[] =
    videos?.results?.filter((v: Video) => v.type === 'Trailer') || []
  const tvReviews: Review[] = reviews?.results || []

  const formatRuntime = (minutes: number[]) => {
    if (!minutes || minutes.length === 0) return 'N/A'
    const avg = minutes.reduce((a, b) => a + b, 0) / minutes.length
    return `${Math.round(avg)}m avg`
  }

  const addToWatchlist = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      toast.error('Please log in')
      return
    }

    setAddingToWatchlist(true)
    const tmdbData = { ...tvShow, seasons: tvShow?.seasons || [] }
    const { error } = await supabase.from('watchlist').insert({
      user_id: sessionData.session.user.id,
      tmdb_id: tvShow?.id,
      media_type: 'tv',
      tmdb_data: tmdbData,
      poster_path: tvShow?.poster_path,
      is_seen: false,
      seen_episodes: {},
      completed_seasons: [],
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })

    if (!error) {
      toast.success('Tracked successfully')
      setAddingToWatchlist(false)
      window.location.reload()
    } else {
      setAddingToWatchlist(false)
    }
  }

  const removeFromWatchlist = async () => {
    if (!watchlistItem) return
    setIsRemovingFromWatchlist(true)
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', watchlistItem.id)
    if (!error) {
      setWatchlistItem(null)
      toast.success('Removed from library')
      setIsRemovingFromWatchlist(false)
      mutate()
    }
  }

  if (tvLoading)
    return (
      <div className='min-h-screen bg-gradient-premium'>
        <Skeleton className='h-[70vh] opacity-20' />
      </div>
    )

  if (tvError || !tvShow)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-premium'>
        Show Content Not Found
      </div>
    )

  return (
    <div className='min-h-screen bg-gradient-premium overflow-x-hidden'>
      {/* Hero Section */}
      <div className='relative h-[85vh] lg:h-[90vh] overflow-hidden'>
        {tvShow.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`}
            alt={tvShow.name}
            fill
            className='object-cover opacity-60'
            priority
            sizes='100vw'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-[#02010a] via-[#02010a]/40 to-transparent' />

        <div className='absolute bottom-0 left-0 right-0 py-20'>
          <div className='container mx-auto px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row gap-10 items-end'>
              <div className='flex-shrink-0 w-[200px] lg:w-[280px] group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200'></div>
                <Image
                  src={
                    tvShow.poster_path
                      ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
                      : '/sample-poster.jpg'
                  }
                  alt={tvShow.name}
                  width={280}
                  height={420}
                  className='relative rounded-[2rem] shadow-2xl w-full border border-white/10'
                  sizes='(max-width: 640px) 200px, 280px'
                />
              </div>

              <div className='flex-1 space-y-6'>
                <div className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    {tvShow.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        className='bg-primary/20 text-primary-foreground border-none rounded-full px-4 py-1 text-xs font-medium backdrop-blur-md'
                      >
                        {genre.name}
                      </Badge>
                    ))}
                    <Badge className='bg-blue-500/20 text-blue-400 border-none rounded-full px-4 py-1 text-xs font-medium backdrop-blur-md'>
                      {tvShow.status}
                    </Badge>
                  </div>
                  <h1 className='text-3xl lg:text-5xl font-black text-white text-glow'>
                    {tvShow.name}
                  </h1>
                  {tvShow.tagline && (
                    <p className='text-gray-300 font-medium italic max-w-2xl'>
                      &quot;{tvShow.tagline}&quot;
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap gap-6 items-center text-white/80 font-medium'>
                  <div className='flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md backdrop-blur-md border border-white/10'>
                    <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                    <span className=''>{tvShow.vote_average.toFixed(1)}</span>
                    <span className='text-white/40 text-sm'>
                      ({tvShow.vote_count.toLocaleString()})
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Tv className='h-5 w-5 text-primary' />
                    <span className=''>{tvShow.number_of_seasons} Seasons</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5 text-primary' />
                    <span className=''>
                      {new Date(tvShow.first_air_date).getFullYear()}
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

                  {!watchlistItem && !isLoadingWatchlist ? (
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
                          <Plus className='h-6 w-6 mr-2' /> Start Tracking
                        </>
                      )}
                    </Button>
                  ) : (
                    watchlistItem && (
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
                            <Trash2 className='h-6 w-6 mr-2' /> Stop Tracking
                          </>
                        )}
                      </Button>
                    )
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
          <TabsList className='bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-lg h-14 w-full lg:w-max mx-auto lg:mx-0'>
            <TabsTrigger
              value='overview'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='seasons'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
            >
              Seasons
            </TabsTrigger>
            <TabsTrigger
              value='cast'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
            >
              Cast
            </TabsTrigger>
            <TabsTrigger
              value='videos'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value='reviews'
              className=' px-8 font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'
          >
            <OverviewTab
              tvShow={tvShow}
              watchlistItem={watchlistItem}
              formatRuntime={formatRuntime}
            />
          </TabsContent>

          <TabsContent
            value='seasons'
            className='mt-0 space-y-6 transition-all animate-in fade-in slide-in-from-bottom-4'
          >
            <SeasonsTab seasons={tvShow.seasons} tvId={tvId} />
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
            <ReviewsTab tvReviews={tvReviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
