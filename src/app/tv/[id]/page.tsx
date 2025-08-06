'use client'

import {
  Award,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  ExternalLink,
  Heart,
  Play,
  Plus,
  Share2,
  Star,
  Tv,
  Eye,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetcher } from '@/lib/utils'

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

interface SimilarTVShow {
  id: number
  name: string
  poster_path: string
  vote_average: number
  first_air_date: string
}

interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  still_path: string | null
  runtime: number | null
}

interface SeasonCardProps {
  season: TVShowDetails['seasons'][0]
  tvId: string
}

function SeasonCard({ season, tvId }: SeasonCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: seasonData, isLoading: seasonLoading } = useSWR<{
    episodes: Episode[]
  }>(
    isOpen
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/season/${season.season_number}?language=en-US`
      : null,
    fetcher
  )
  const episodes: Episode[] = seasonData?.episodes || []

  // Check if episode has aired based on current date (August 6, 2025, 12:49 AM WAT)
  const hasEpisodeAired = (airDate: string | null) => {
    if (!airDate) return false
    const currentDate = new Date('2025-08-06T00:49:00+01:00') // WAT is UTC+1
    const episodeDate = new Date(airDate)
    return episodeDate <= currentDate
  }

  return (
    <Card key={season.id} className='hover:shadow-lg transition-shadow p-2'>
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-shrink-0 w-[100px] sm:w-[120px]'>
            <Image
              src={
                season.poster_path
                  ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                  : '/sample-poster.jpg'
              }
              alt={season.name}
              width={120}
              height={180}
              className='rounded-lg object-cover w-full'
              sizes='(max-width: 640px) 100px, 120px'
            />
          </div>
          <div className='flex-1 space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg sm:text-xl font-semibold'>
                {season.name}
              </h3>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>
                  {season.episode_count} Episode
                  {season.episode_count !== 1 ? 's' : ''}
                </Badge>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm'>
                      Episodes
                      <ChevronDown className='h-4 w-4 ml-2' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-[300px] sm:w-[400px] max-h-[400px] overflow-y-auto'>
                    {seasonLoading ? (
                      <DropdownMenuItem>
                        <Skeleton className='h-6 w-full' />
                      </DropdownMenuItem>
                    ) : episodes.length > 0 ? (
                      episodes.map((episode) => {
                        const hasAired = hasEpisodeAired(episode.air_date)
                        return (
                          <DropdownMenuItem
                            key={episode.id}
                            className={`flex flex-col items-start p-2 ${
                              !hasAired ? 'opacity-50' : ''
                            }`}
                            disabled={!hasAired}
                          >
                            <div className='flex w-full gap-2'>
                              {episode.still_path && (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                                  alt={episode.name}
                                  width={80}
                                  height={45}
                                  className='rounded object-cover'
                                  sizes='80px'
                                />
                              )}
                              <div className='flex-1'>
                                <div className='flex justify-between items-start'>
                                  <span className='font-semibold text-sm'>
                                    {episode.episode_number}. {episode.name}
                                  </span>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={!hasAired}
                                    onClick={() => {}}
                                    className='text-xs'
                                  >
                                    <Eye className='h-3 w-3 mr-1' />
                                    Mark as Seen
                                  </Button>
                                </div>
                                {episode.air_date && (
                                  <p className='text-xs text-muted-foreground'>
                                    Aired:{' '}
                                    {new Date(
                                      episode.air_date
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                                <p className='text-xs text-muted-foreground line-clamp-2'>
                                  {episode.overview || 'No overview available.'}
                                </p>
                                {episode.runtime && (
                                  <p className='text-xs text-muted-foreground'>
                                    Runtime: {episode.runtime}m
                                  </p>
                                )}
                                {!hasAired && (
                                  <Badge variant='outline' className='mt-1'>
                                    Upcoming
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        )
                      })
                    ) : (
                      <DropdownMenuItem>
                        No episodes available.
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {season.air_date && (
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Aired: {new Date(season.air_date).getFullYear()}
              </p>
            )}
            <p className='text-xs sm:text-sm text-muted-foreground'>
              Progress: 0/{season.episode_count} episodes watched
            </p>
            <p className='text-xs sm:text-sm text-muted-foreground line-clamp-3'>
              {season.overview || 'No overview available for this season.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TVShowDetails() {
  const params = useParams()
  const router = useRouter()
  const tvId = params.id as string

  // Fetch TV show details
  const {
    data: tvShow,
    error: tvError,
    isLoading: tvLoading,
  } = useSWR<TVShowDetails>(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}?language=en-US`
      : null,
    fetcher
  )

  // Fetch credits
  const { data: credits } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/credits?language=en-US`
      : null,
    fetcher
  )

  // Fetch videos
  const { data: videos } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/videos?language=en-US`
      : null,
    fetcher
  )

  // Fetch reviews
  const { data: reviews } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/reviews?language=en-US&page=1`
      : null,
    fetcher
  )

  // Fetch similar TV shows
  const { data: similar } = useSWR(
    tvId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/similar?language=en-US&page=1`
      : null,
    fetcher
  )

  const cast: Cast[] = credits?.cast?.slice(0, 10) || []
  const crew: Crew[] = credits?.crew || []
  const creators = tvShow?.created_by || []
  const producers = crew
    .filter((person) => person.job === 'Executive Producer')
    .slice(0, 3)
  const trailers: Video[] =
    videos?.results?.filter((video: Video) => video.type === 'Trailer') || []
  const tvReviews: Review[] = reviews?.results || []
  const similarShows: SimilarTVShow[] = similar?.results?.slice(0, 8) || []

  const formatRuntime = (minutes: number[]) => {
    if (!minutes || minutes.length === 0) return 'N/A'
    const avgRuntime = minutes.reduce((a, b) => a + b, 0) / minutes.length
    return `${Math.round(avgRuntime)}m avg`
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500'
    if (score >= 5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'returning series':
      case 'in production':
        return 'default'
      case 'ended':
      case 'canceled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (tvLoading) {
    return (
      <div className='min-h-screen'>
        <div className='relative h-[80dvh] bg-gradient-to-b from-black/50 to-black'>
          <Skeleton className='w-full h-full' />
        </div>
        <div className='container mx-auto px-4 py-6 sm:px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='md:col-span-2 space-y-4'>
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-60 w-full' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tvError || !tvShow) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='text-center'>
          <h1 className='text-xl sm:text-2xl font-bold mb-4'>
            TV Show Not Found
          </h1>
          <p className='text-muted-foreground mb-4 text-sm sm:text-base'>
            The TV show you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.back()}>
            <ChevronLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <div className='relative h-[80dvh] overflow-hidden'>
        {tvShow.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`}
            alt={tvShow.name}
            fill
            className='object-cover'
            priority
            sizes='100vw'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent' />

        <div className='absolute top-4 left-10 hidden lg:block'>
          <Button
            variant='secondary'
            onClick={() => router.back()}
            className='cursor-pointer'
          >
            <ChevronLeft className='h-4 w-4' />
            Back
          </Button>
        </div>

        <div className='absolute bottom-0 left-0 right-0 p-5 lg:p-10'>
          <div className='container mx-auto'>
            <div className='flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 items-start'>
              <div className='flex-shrink-0 w-[150px] lg:w-[200px]'>
                <Image
                  src={
                    tvShow.poster_path
                      ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
                      : '/sample-poster.jpg'
                  }
                  alt={tvShow.name}
                  width={180}
                  height={270}
                  className='rounded-lg shadow-2xl w-full'
                  sizes='(max-width: 640px) 150px, 180px'
                />
              </div>

              <div className='flex-1 text-white space-y-3'>
                <div className='space-y-2'>
                  <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold'>
                    {tvShow.name}
                  </h1>
                  {tvShow.tagline && (
                    <p className='text-base sm:text-lg text-gray-300 italic'>
                      {tvShow.tagline}
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap gap-3 items-center'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400' />
                    <span
                      className={`text-base sm:text-lg font-semibold ${getScoreColor(
                        tvShow.vote_average
                      )}`}
                    >
                      {tvShow.vote_average.toFixed(1)}
                    </span>
                    <span className='text-gray-300 text-sm sm:text-base'>
                      ({tvShow.vote_count.toLocaleString()} votes)
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    <span className='text-sm sm:text-base'>
                      {formatRuntime(tvShow.episode_run_time)}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span className='text-sm sm:text-base'>
                      {new Date(tvShow.first_air_date).getFullYear()}
                      {tvShow.last_air_date &&
                        tvShow.status === 'Ended' &&
                        ` - ${new Date(tvShow.last_air_date).getFullYear()}`}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Tv className='h-4 w-4' />
                    <span className='text-sm sm:text-base'>
                      {tvShow.number_of_seasons} Season
                      {tvShow.number_of_seasons !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {tvShow.genres.map((genre) => (
                    <Badge key={genre.id} variant='secondary'>
                      {genre.name}
                    </Badge>
                  ))}
                  <Badge variant={getStatusColor(tvShow.status)}>
                    {tvShow.status}
                  </Badge>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {trailers.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size='lg'
                          className='bg-red-600 hover:bg-red-700 min-w-[140px]'
                        >
                          <Play className='h-4 w-4 mr-2' />
                          Watch Trailer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-[90vw] sm:max-w-[800px]'>
                        <DialogHeader>
                          <DialogTitle>Trailer</DialogTitle>
                        </DialogHeader>
                        <div className='aspect-video'>
                          <iframe
                            src={`https://www.youtube.com/embed/${trailers[0].key}`}
                            title={trailers[0].name}
                            className='w-full h-full rounded-lg'
                            allowFullScreen
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button variant='outline' size='lg' className='min-w-[140px]'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add to Watchlist
                  </Button>

                  <Button variant='outline' size='lg' className='min-w-[140px]'>
                    <Heart className='h-4 w-4 mr-2' />
                    Favorite
                  </Button>

                  <Button variant='outline' size='lg' className='min-w-[140px]'>
                    <Share2 className='h-4 w-4 mr-2' />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='md:col-span-2'>
            <Tabs defaultValue='overview' className='w-full'>
              <TabsList className='flex justify-start w-full overflow-x-auto sm:grid sm:grid-cols-5 h-12 py-2 gap-2 scroll-snap-x snap-mandatory sm:overflow-visible'>
                <TabsTrigger
                  value='overview'
                  className='snap-start shrink-0 px-2'
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value='seasons'
                  className='snap-start shrink-0 px-2'
                >
                  Seasons
                </TabsTrigger>
                <TabsTrigger value='cast' className='snap-start shrink-0 px-2'>
                  Cast & Crew
                </TabsTrigger>
                <TabsTrigger
                  value='videos'
                  className='snap-start shrink-0 px-2'
                >
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value='reviews'
                  className='snap-start shrink-0 px-2'
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold mb-4'>
                    Overview
                  </h2>
                  <p className='text-muted-foreground leading-relaxed text-sm sm:text-base'>
                    {tvShow.overview || 'No overview available.'}
                  </p>
                </div>

                {creators.length > 0 && (
                  <div>
                    <h3 className='text-base sm:text-lg font-semibold mb-2'>
                      Created By
                    </h3>
                    <div className='flex flex-wrap gap-4'>
                      {creators.map((creator) => (
                        <div
                          key={creator.id}
                          className='flex items-center gap-3'
                        >
                          <Image
                            src={
                              creator.profile_path
                                ? `https://image.tmdb.org/t/p/w185${creator.profile_path}`
                                : '/avatar.jpg'
                            }
                            alt={creator.name}
                            width={60}
                            height={60}
                            className='rounded-full h-12 w-12 sm:h-16 sm:w-16 object-top object-cover'
                            sizes='(max-width: 640px) 48px, 64px'
                          />
                          <span className='font-medium text-sm sm:text-base'>
                            {creator.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {producers.length > 0 && (
                  <div className='space-y-3'>
                    <h3 className='text-base sm:text-lg font-semibold'>
                      Executive Producers
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {producers.map((producer) => (
                        <Badge key={producer.id} variant='outline'>
                          {producer.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='seasons' className='space-y-6'>
                <div className='space-y-4'>
                  <h2 className='text-xl sm:text-2xl font-bold'>Seasons</h2>
                  <div className='space-y-4'>
                    {tvShow.seasons
                      .filter((season) => season.season_number > 0)
                      .map((season) => (
                        <SeasonCard
                          key={season.id}
                          season={season}
                          tvId={tvId}
                        />
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='cast' className='space-y-6'>
                <div className='space-y-4'>
                  <h2 className='text-xl sm:text-2xl font-bold'>Cast</h2>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {cast.map((actor) => (
                      <Card
                        key={actor.id}
                        className='text-center p-0 rounded-2xl'
                      >
                        <CardContent className='p-1'>
                          <Image
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                : '/avatar.jpg'
                            }
                            alt={actor.name}
                            width={185}
                            height={185}
                            quality={100}
                            className='rounded-lg object-cover w-full'
                            sizes='(max-width: 640px) 50vw, 33vw'
                          />
                          <div className='space-y-1 flex flex-col justify-start items-start px-4 py-2'>
                            <h4 className='font-semibold text-xs sm:text-sm'>
                              {actor.name}
                            </h4>
                            <p className='text-xs text-muted-foreground'>
                              {actor.character}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='videos' className='space-y-6'>
                <div className='space-y-4'>
                  <h2 className='text-xl sm:text-2xl font-bold'>
                    Videos & Trailers
                  </h2>
                  {trailers.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {trailers.map((video) => (
                        <Card
                          key={video.id}
                          className='cursor-pointer hover:shadow-lg transition-shadow p-0'
                        >
                          <CardContent className='p-1 space-y-2'>
                            <div className='aspect-video bg-gray-100 rounded-lg relative overflow-hidden'>
                              <Image
                                src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                                alt={video.name}
                                fill
                                className='object-cover w-full'
                                sizes='(max-width: 640px) 100vw, 50vw'
                              />
                              <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                                <Play className='h-10 w-10 sm:h-12 sm:w-12 text-white' />
                              </div>
                            </div>
                            <div className='space-y-1 p-2'>
                              <h4 className='font-semibold text-sm sm:text-base'>
                                {video.name}
                              </h4>
                              <p className='text-xs sm:text-sm text-muted-foreground'>
                                {video.type}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm sm:text-base'>
                      No videos available.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='reviews' className='space-y-6'>
                <div className='space-y-4'>
                  <h2 className='text-xl sm:text-2xl font-bold mb-4'>
                    Reviews
                  </h2>
                  {tvReviews.length > 0 ? (
                    <div className='space-y-4'>
                      {tvReviews.slice(0, 3).map((review) => (
                        <Card key={review.id} className='p-4'>
                          <CardContent className='p-0'>
                            <div className='flex items-start gap-4'>
                              <Image
                                src={
                                  review.author_details.avatar_path
                                    ? `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}`
                                    : '/avatar.jpg'
                                }
                                alt={review.author}
                                width={40}
                                height={40}
                                className='rounded-full object-cover'
                                sizes='40px'
                              />
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <h4 className='font-semibold text-sm sm:text-base'>
                                    {review.author}
                                  </h4>
                                  {review.author_details.rating && (
                                    <Badge variant='secondary'>
                                      <Star className='h-3 w-3 mr-1' />
                                      {review.author_details.rating}/10
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-xs sm:text-sm text-muted-foreground line-clamp-4'>
                                  {review.content}
                                </p>
                                <p className='text-xs text-muted-foreground mt-2'>
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm sm:text-base'>
                      No reviews available.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                  <Award className='h-5 w-5' />
                  Show Stats
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Status
                  </span>
                  <Badge variant={getStatusColor(tvShow.status)}>
                    {tvShow.status}
                  </Badge>
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Seasons
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {tvShow.number_of_seasons}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Episodes
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {tvShow.number_of_episodes}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    First Aired
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {new Date(tvShow.first_air_date).toLocaleDateString()}
                  </span>
                </div>

                {tvShow.last_air_date && tvShow.status === 'Ended' && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm sm:text-base'>
                      Last Aired
                    </span>
                    <span className='font-medium text-sm sm:text-base'>
                      {new Date(tvShow.last_air_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Original Language
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {tvShow.original_language.toUpperCase()}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Popularity
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {tvShow.popularity.toFixed(0)}
                  </span>
                </div>

                {tvShow.in_production && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm sm:text-base'>
                      In Production
                    </span>
                    <Badge variant='default'>Yes</Badge>
                  </div>
                )}

                {tvShow.homepage && (
                  <div className='pt-2'>
                    <Button
                      variant='outline'
                      className='w-full bg-transparent'
                      asChild
                    >
                      <Link
                        href={tvShow.homepage}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <ExternalLink className='h-4 w-4 mr-2' />
                        Official Website
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Networks */}
            {tvShow.networks.length > 0 && (
              <Card className='p-4'>
                <CardHeader className='justify-start items-start p-0'>
                  <CardTitle className='text-base sm:text-lg'>
                    Networks
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='space-y-3'>
                    {tvShow.networks.map((network) => (
                      <div key={network.id} className='flex items-center gap-3'>
                        {network.logo_path && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${network.logo_path}`}
                            alt={network.name}
                            width={40}
                            height={40}
                            className='object-cover'
                            sizes='40px'
                          />
                        )}
                        <span className='text-sm font-medium'>
                          {network.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Production Companies */}
            {tvShow.production_companies.length > 0 && (
              <Card className='p-4'>
                <CardHeader className='justify-start items-start p-0'>
                  <CardTitle className='text-base sm:text-lg'>
                    Production Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='space-y-3'>
                    {tvShow.production_companies.slice(0, 3).map((company) => (
                      <div key={company.id} className='flex items-center gap-3'>
                        {company.logo_path && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${company.logo_path}`}
                            alt={company.name}
                            width={40}
                            height={40}
                            className='object-cover'
                            sizes='40px'
                          />
                        )}
                        <span className='text-sm font-medium'>
                          {company.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Similar TV Shows */}
            {similarShows.length > 0 && (
              <Card className='p-4'>
                <CardHeader className='p-0'>
                  <CardTitle className='text-base sm:text-lg'>
                    Similar Shows
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='flex justify-start overflow-x-auto gap-3 scroll-snap-x snap-mandatory sm:scrollbar-hide'>
                    {similarShows.slice(0, 4).map((similarShow) => (
                      <Link
                        key={similarShow.id}
                        href={`/tv/${similarShow.id}`}
                        className='snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-[20%] group cursor-pointer'
                      >
                        <div className='space-y-2'>
                          <Image
                            src={
                              similarShow.poster_path
                                ? `https://image.tmdb.org/t/p/w300${similarShow.poster_path}`
                                : '/sample-poster.jpg'
                            }
                            alt={similarShow.name}
                            width={100}
                            height={150}
                            className='rounded-xl object-cover w-full group-hover:scale-105 transition-transform'
                            // sizes='(max-width: 640px) 50vw, 33vw'
                          />
                          <div>
                            <h4 className='text-xs sm:text-sm font-medium line-clamp-2'>
                              {similarShow.name}
                            </h4>
                            <div className='flex items-center gap-1 mt-1'>
                              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                              <span className='text-xs'>
                                {similarShow.vote_average.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
