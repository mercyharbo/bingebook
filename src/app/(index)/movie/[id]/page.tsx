'use client'

import {
  Award,
  Calendar,
  ChevronLeft,
  Clock,
  ExternalLink,
  Heart,
  Play,
  Plus,
  Share2,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'

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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetcher } from '@/lib/utils'

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

interface SimilarMovie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
}

export default function MovieDetails() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.id as string
  // const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Fetch movie details
  const {
    data: movie,
    error: movieError,
    isLoading: movieLoading,
  } = useSWR<MovieDetails>(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}?language=en-US`
      : null,
    fetcher
  )

  // Fetch credits
  const { data: credits } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/credits?language=en-US`
      : null,
    fetcher
  )

  // Fetch videos
  const { data: videos } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/videos?language=en-US`
      : null,
    fetcher
  )

  // Fetch reviews
  const { data: reviews } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/reviews?language=en-US&page=1`
      : null,
    fetcher
  )

  // Fetch similar movies
  const { data: similar } = useSWR(
    movieId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`
      : null,
    fetcher
  )

  const cast: Cast[] = credits?.cast?.slice(0, 10) || []
  const crew: Crew[] = credits?.crew || []
  const director = crew.find((person) => person.job === 'Director')
  const writers = crew.filter(
    (person) => person.job === 'Writer' || person.job === 'Screenplay'
  )
  const trailers: Video[] =
    videos?.results?.filter((video: Video) => video.type === 'Trailer') || []
  const movieReviews: Review[] = reviews?.results || []
  const similarMovies: SimilarMovie[] = similar?.results?.slice(0, 8) || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500'
    if (score >= 5) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (movieLoading) {
    return (
      <div className='min-h-screen'>
        <div className='relative h-[70vh] bg-gradient-to-b from-black/50 to-black'>
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

  if (movieError || !movie) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='text-center'>
          <h1 className='text-xl sm:text-2xl font-bold mb-4'>
            Movie Not Found
          </h1>
          <p className='text-muted-foreground mb-4 text-sm sm:text-base'>
            The movie you&apos;re looking for doesn&apos;t exist or has been
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
      <div className='relative h-[80vh] overflow-hidden'>
        {movie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className='object-cover'
            priority
            sizes='100vw'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent' />

        <div className='absolute top-4 left-4 sm:left-6 hidden sm:block'>
          <Button
            variant='secondary'
            onClick={() => router.back()}
            className='cursor-pointer'
          >
            <ChevronLeft className='h-4 w-4' />
            Back
          </Button>
        </div>

        <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6'>
          <div className='container mx-auto'>
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-start'>
              <div className='flex-shrink-0 w-[150px] lg:w-[200px]'>
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/sample-poster.jpg'
                  }
                  alt={movie.title}
                  width={180}
                  height={270}
                  className='rounded-lg shadow-2xl w-full'
                  sizes='(max-width: 640px) 150px, 180px'
                />
              </div>

              <div className='flex-1 text-white space-y-3'>
                <div className='space-y-2'>
                  <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold'>
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className='text-base sm:text-lg text-gray-300 italic'>
                      {movie.tagline}
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap gap-3 items-center'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400' />
                    <span
                      className={`text-base sm:text-lg font-semibold ${getScoreColor(
                        movie.vote_average
                      )}`}
                    >
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className='text-gray-300 text-sm sm:text-base'>
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  </div>

                  {movie.runtime > 0 && (
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      <span className='text-sm sm:text-base'>
                        {formatRuntime(movie.runtime)}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span className='text-sm sm:text-base'>
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant='secondary'>
                      {genre.name}
                    </Badge>
                  ))}
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

                  <Button variant='outline' size='lg' className='px-2'>
                    <Plus className='h-4 w-4' />
                    Add to List
                  </Button>

                  <Button variant='outline' size='lg' className='px-2'>
                    <Heart className='h-4 w-4' />
                    Favorite
                  </Button>

                  <Button variant='outline' size='lg' className='px-2'>
                    <Share2 className='h-4 w-4' />
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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='md:col-span-2'>
            <Tabs defaultValue='overview' className='w-full'>
              <TabsList className='grid grid-cols-4 w-full h-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide'>
                <TabsTrigger value='overview' className='snap-start'>
                  Overview
                </TabsTrigger>
                <TabsTrigger value='cast' className='snap-start'>
                  Cast & Crew
                </TabsTrigger>
                <TabsTrigger value='videos' className='snap-start'>
                  Videos
                </TabsTrigger>
                <TabsTrigger value='reviews' className='snap-start'>
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold mb-4'>
                    Overview
                  </h2>
                  <p className='text-muted-foreground leading-relaxed text-sm sm:text-base'>
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                {director && (
                  <div>
                    <h3 className='text-base sm:text-lg font-semibold mb-2'>
                      Director
                    </h3>
                    <div className='flex items-center gap-3'>
                      <Image
                        src={
                          director.profile_path
                            ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                            : '/avatar.jpg'
                        }
                        alt={director.name}
                        width={60}
                        height={60}
                        className='rounded-full h-12 w-12 sm:h-16 sm:w-16 object-top object-cover'
                        sizes='(max-width: 640px) 48px, 64px'
                      />
                      <span className='font-medium text-sm sm:text-base'>
                        {director.name}
                      </span>
                    </div>
                  </div>
                )}

                {writers.length > 0 && (
                  <div className='space-y-3'>
                    <h3 className='text-base sm:text-lg font-semibold'>
                      Writers
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {writers.map((writer) => (
                        <Badge key={writer.id} variant='outline'>
                          {writer.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                          <div className='space-y-1 flex flex-col justify-start items-start text-left px-4 py-2'>
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
                  {movieReviews.length > 0 ? (
                    <div className='space-y-4'>
                      {movieReviews.slice(0, 3).map((review) => (
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
            {/* Movie Stats */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                  <Award className='h-5 w-5' />
                  Movie Stats
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Status
                  </span>
                  <Badge
                    variant={
                      movie.status === 'Released' ? 'default' : 'secondary'
                    }
                  >
                    {movie.status}
                  </Badge>
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Original Language
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {movie.original_language.toUpperCase()}
                  </span>
                </div>

                {movie.budget > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm sm:text-base'>
                      Budget
                    </span>
                    <span className='font-medium text-sm sm:text-base'>
                      {formatCurrency(movie.budget)}
                    </span>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm sm:text-base'>
                      Revenue
                    </span>
                    <span className='font-medium text-sm sm:text-base'>
                      {formatCurrency(movie.revenue)}
                    </span>
                  </div>
                )}

                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm sm:text-base'>
                    Popularity
                  </span>
                  <span className='font-medium text-sm sm:text-base'>
                    {movie.popularity.toFixed(0)}
                  </span>
                </div>

                {movie.homepage && (
                  <div className='pt-2'>
                    <Button
                      variant='outline'
                      className='w-full bg-transparent'
                      asChild
                    >
                      <Link
                        href={movie.homepage}
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

            {/* Production Companies */}
            {movie.production_companies.length > 0 && (
              <Card className='p-4'>
                <CardHeader className='justify-start items-start p-0'>
                  <CardTitle className='text-base sm:text-lg'>
                    Production Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='space-y-3'>
                    {movie.production_companies.slice(0, 3).map((company) => (
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

            {/* Similar Movies */}
            {similarMovies.length > 0 && (
              <Card className='p-4'>
                <CardHeader>
                  <CardTitle className='text-base sm:text-lg'>
                    Similar Movies
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3'>
                    {similarMovies.slice(0, 4).map((similarMovie) => (
                      <Link
                        key={similarMovie.id}
                        href={`/movie/${similarMovie.id}`}
                        className='group cursor-pointer snap-start flex-shrink-0 w-[140px] sm:w-[160px]'
                      >
                        <div className='space-y-2'>
                          <Image
                            src={
                              similarMovie.poster_path
                                ? `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`
                                : '/sample-poster.jpg'
                            }
                            alt={similarMovie.title}
                            width={160}
                            height={240}
                            className='rounded-xl object-cover w-full group-hover:scale-105 transition-transform'
                            sizes='(max-width: 640px) 140px, 160px'
                          />
                          <div>
                            <h4 className='text-xs sm:text-sm font-medium line-clamp-2'>
                              {similarMovie.title}
                            </h4>
                            <div className='flex items-center gap-1 mt-1'>
                              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                              <span className='text-xs'>
                                {similarMovie.vote_average.toFixed(1)}
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
