'use client'

import PersonDetailsSkeleton from '@/app/(index)/person/[id]/loading-skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetcher } from '@/lib/utils'
import {
  Award,
  Calendar,
  Clock,
  Film,
  MapPin,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'

interface Person {
  id: number
  name: string
  profile_path: string | null
  biography: string | null
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  known_for_department: string
  popularity: number
  gender: number
  also_known_as: string[]
}

interface MovieCredit {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  character: string
  vote_average: number
  popularity: number
}

interface TVCredit {
  id: number
  name: string
  poster_path: string | null
  first_air_date: string
  character: string
  vote_average: number
  episode_count: number
}

interface Credits {
  cast: (MovieCredit & TVCredit)[]
}

interface PersonDetailsContentProps {
  personId: string
}

const PersonDetailsContent: React.FC<PersonDetailsContentProps> = ({
  personId,
}) => {
  const router = useRouter()
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
  const [moviePage, setMoviePage] = useState(1)
  const [tvPage, setTvPage] = useState(1)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const ITEMS_PER_PAGE = 15

  // Fetch person details
  const { data: person, isLoading: personLoading } = useSWR<Person>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/person/${personId}?language=en-US`,
    fetcher
  )

  // Fetch movie credits
  const { data: movieCredits, isLoading: movieLoading } = useSWR<Credits>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/person/${personId}/movie_credits?language=en-US`,
    fetcher
  )

  // Fetch TV credits
  const { data: tvCredits, isLoading: tvLoading } = useSWR<Credits>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/person/${personId}/tv_credits?language=en-US`,
    fetcher
  )

  const handleItemClick = (
    item: MovieCredit | TVCredit,
    mediaType: 'movie' | 'tv'
  ) => {
    router.push(`/${mediaType}/${item.id}`)
  }

  // Sort and filter credits
  const sortedMovies =
    movieCredits?.cast
      ?.filter((movie) => movie.poster_path && movie.release_date)
      ?.sort(
        (a, b) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      ) || []

  const sortedTVShows =
    tvCredits?.cast
      ?.filter((show) => show.poster_path && show.first_air_date)
      ?.sort(
        (a, b) =>
          new Date(b.first_air_date).getTime() -
          new Date(a.first_air_date).getTime()
      ) || []

  const upcomingProjects =
    movieCredits?.cast
      ?.filter((movie) => {
        const releaseDate = new Date(movie.release_date)
        return releaseDate > new Date() && movie.poster_path
      })
      ?.sort(
        (a, b) =>
          new Date(a.release_date).getTime() -
          new Date(b.release_date).getTime()
      ) || []

  // Pagination calculations
  const totalMoviePages = Math.ceil(sortedMovies.length / ITEMS_PER_PAGE)
  const totalTVPages = Math.ceil(sortedTVShows.length / ITEMS_PER_PAGE)
  const totalUpcomingPages = Math.ceil(upcomingProjects.length / ITEMS_PER_PAGE)

  const paginatedMovies = sortedMovies.slice(
    (moviePage - 1) * ITEMS_PER_PAGE,
    moviePage * ITEMS_PER_PAGE
  )
  const paginatedTVShows = sortedTVShows.slice(
    (tvPage - 1) * ITEMS_PER_PAGE,
    tvPage * ITEMS_PER_PAGE
  )
  const paginatedUpcoming = upcomingProjects.slice(
    (upcomingPage - 1) * ITEMS_PER_PAGE,
    upcomingPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    page: number
  ) => {
    setter(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday)
    const end = deathday ? new Date(deathday) : new Date()
    return Math.floor(
      (end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (personLoading || movieLoading || tvLoading || !person) {
    return <PersonDetailsSkeleton />
  }

  // if (!person) {
  //   return (
  //     <main className='min-h-screen -mt-16 bg-white dark:bg-slate-950 flex items-center justify-center'>
  //       <div className='text-center space-y-4'>
  //         <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
  //           Person not found
  //         </h1>
  //         <p className='text-slate-600 dark:text-slate-400'>
  //           The person you're looking for could not be found.
  //         </p>
  //       </div>
  //     </main>
  //   )
  // }

  return (
    <main className='min-h-screen -mt-16 bg-white dark:bg-slate-950'>
      {/* Hero Section */}
      <div className='relative bg-slate-100 dark:bg-slate-800 pt-[7rem] border-b border-slate-200 dark:border-slate-800'>
        <div className='relative w-[90%] lg:w-[80%] mx-auto px-4 py-12'>
          <div className='flex flex-col lg:flex-row gap-8 lg:items-start items-center'>
            <Avatar className='w-48 h-48 border-4 border-white dark:border-slate-700 shadow-2xl'>
              <AvatarImage
                src={
                  person.profile_path
                    ? `${IMAGE_BASE_URL}${person.profile_path}`
                    : ''
                }
                alt={person.name}
                className='object-cover object-top'
              />
              <AvatarFallback className='text-4xl font-bold bg-slate-200 dark:bg-slate-700'>
                {person.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className='flex-1 w-full flex lg:justify-start lg:items-start flex-col justify-center items-center space-y-4'>
              <div className='space-y-3 w-full'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <h1 className='text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 leading-tight'>
                    {person.name}
                  </h1>
                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='default'
                      className='px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md'
                    >
                      <Award className='size-4 mr-1.5' />
                      {person.known_for_department}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='px-3 py-1.5 text-sm border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200'
                    >
                      <TrendingUp className='size-4 mr-1.5 text-blue-500' />
                      <span className='font-semibold'>
                        {Math.round(person.popularity)}
                      </span>
                      <span className='ml-1 text-slate-600 dark:text-slate-400'>
                        popularity
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* <CHANGE> Reduced gap from gap-6 to gap-4 */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 shadow-sm'>
                  {person.birthday && (
                    <div className='relative space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                      <span className='absolute -top-2 left-3 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full'>
                        Date of Birth
                      </span>
                      <p className='text-base font-medium text-slate-900 dark:text-white mt-2'>
                        {formatDate(person.birthday)}
                        {person.deathday && (
                          <span className='block mt-1 text-red-500 dark:text-red-400'>
                            Died: {formatDate(person.deathday)}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {person.place_of_birth && (
                    <div className='relative space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                      <span className='absolute -top-2 left-3 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full'>
                        Place of Birth
                      </span>
                      <p className='text-base font-medium text-slate-900 dark:text-white mt-2'>
                        {person.place_of_birth}
                      </p>
                    </div>
                  )}

                  {person.also_known_as && person.also_known_as.length > 0 && (
                    <div className='md:col-span-2 relative space-y-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                      <span className='absolute -top-2 left-3 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full'>
                        Also Known As
                      </span>
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {person.also_known_as.slice(0, 5).map((name, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200'
                          >
                            {name}
                          </Badge>
                        ))}
                        {person.also_known_as.length > 5 && (
                          <Badge
                            variant='outline'
                            className='px-3 py-1 text-sm'
                          >
                            +{person.also_known_as.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* <CHANGE> Reduced gap from gap-5 to gap-3 and made cards smaller */}
              <div className='grid grid-cols-1 w-full lg:w-auto lg:grid-cols-3 gap-3'>
                {person.birthday && (
                  <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                    {/* <CHANGE> Reduced icon size from w-6 h-6 to size-4 */}
                    <Calendar className='size-4 text-blue-600 dark:text-blue-400' />
                    <div>
                      <p className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        {person.deathday ? 'Lived' : 'Age'}
                      </p>
                      {/* <CHANGE> Reduced text size from text-lg to text-sm */}
                      <p className='text-sm font-bold text-slate-900 dark:text-white'>
                        {person.deathday
                          ? `${calculateAge(
                              person.birthday,
                              person.deathday
                            )} years`
                          : `${calculateAge(person.birthday)} years old`}
                      </p>
                    </div>
                  </div>
                )}

                {person.place_of_birth && (
                  <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                    <MapPin className='size-4 text-green-600 dark:text-green-400' />
                    <div>
                      <p className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        Born in
                      </p>
                      <p className='text-sm font-bold text-slate-900 dark:text-white'>
                        {person.place_of_birth.split(',').slice(-1)[0].trim()}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                  <Film className='size-4 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                      Total Credits
                    </p>
                    <p className='text-sm font-bold text-slate-900 dark:text-white'>
                      {(movieCredits?.cast?.length || 0) +
                        (tvCredits?.cast?.length || 0)}{' '}
                      projects
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className='flex flex-wrap gap-2'>
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  onClick={() => setIsLiked(!isLiked)}
                  className='gap-1 text-xs px-3 py-1.5'
                  size='sm'
                >
                  <Heart
                    className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`}
                  />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button
                  variant='outline'
                  className='gap-1 text-xs px-3 py-1.5'
                  size='sm'
                >
                  <Share2 className='w-3 h-3' />
                  Share
                </Button>
                <Button
                  variant='outline'
                  className='gap-1 text-xs px-3 py-1.5'
                  size='sm'
                >
                  <ExternalLink className='w-3 h-3' />
                  IMDb
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className='lg:w-[80%] w-full mx-auto px-4 py-8'>
        <Tabs defaultValue='overview' className='space-y-8'>
          <TabsList className='w-full h-12 lg:w-auto lg:grid lg:grid-cols-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory flex justify-start items-center'>
            <TabsTrigger
              value='overview'
              className='snap-start min-w-[120px] flex-shrink-0'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='movies'
              className='snap-start min-w-[120px] flex-shrink-0'
            >
              Movies
            </TabsTrigger>
            <TabsTrigger
              value='tv'
              className='snap-start min-w-[120px] flex-shrink-0'
            >
              TV Shows
            </TabsTrigger>
            <TabsTrigger
              value='upcoming'
              className='snap-start min-w-[120px] flex-shrink-0'
            >
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-8'>
            {/* Biography */}
            {person.biography && (
              <div className='relative space-y-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/90 dark:to-slate-900/80 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-3 relative'>
                  <div className='absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full'></div>
                  <Users className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                  <h2 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                    Biography
                  </h2>
                </div>
                <div className='prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none'>
                  <p className='text-sm/loose'>{person.biography}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='movies' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
                Movie Credits
              </h2>
              <Badge variant='outline' className='px-4 py-2'>
                {sortedMovies.length} movies
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 3xl:grid-cols-5 gap-5'>
              {paginatedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className='group cursor-pointer'
                  onClick={() => handleItemClick(movie, 'movie')}
                  role='button'
                  aria-label={`View ${movie.title} (movie)`}
                >
                  <div className='relative mb-3 overflow-hidden rounded-lg'>
                    <Image
                      src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      width={500}
                      height={750}
                      className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 640px) 150px, 180px'
                    />
                    <div className='absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                      <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <h3 className='font-semibold text-base line-clamp-1 text-slate-900 dark:text-white'>
                      {movie.title}
                    </h3>
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : 'N/A'}
                      </span>
                      <span className='line-clamp-1'>
                        {movie.character || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalMoviePages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(setMoviePage, moviePage - 1)
                      }
                      className={
                        moviePage === 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalMoviePages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(setMoviePage, page)}
                          isActive={moviePage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(setMoviePage, moviePage + 1)
                      }
                      className={
                        moviePage === totalMoviePages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>

          <TabsContent value='tv' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
                TV Credits
              </h2>
              <Badge variant='outline' className='px-4 py-2'>
                {sortedTVShows.length} shows
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 3xl:grid-cols-5 gap-5'>
              {paginatedTVShows.map((show) => (
                <div
                  key={show.id}
                  className='group cursor-pointer'
                  onClick={() => handleItemClick(show, 'tv')}
                  role='button'
                  aria-label={`View ${show.name} (tv)`}
                >
                  <div className='relative mb-3 overflow-hidden rounded-lg'>
                    <Image
                      src={`${IMAGE_BASE_URL}${show.poster_path}`}
                      alt={show.name}
                      width={500}
                      height={750}
                      className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 640px) 150px, 180px'
                    />
                    <div className='absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                      <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                      {show.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <h3 className='font-semibold text-base line-clamp-1 text-slate-900 dark:text-white'>
                      {show.name}
                    </h3>
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>
                        {show.first_air_date
                          ? new Date(show.first_air_date).getFullYear()
                          : 'N/A'}
                      </span>
                      <span className='line-clamp-1'>
                        {show.character || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalTVPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(setTvPage, tvPage - 1)}
                      className={
                        tvPage === 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalTVPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(setTvPage, page)}
                          isActive={tvPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(setTvPage, tvPage + 1)}
                      className={
                        tvPage === totalTVPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>

          <TabsContent value='upcoming' className='space-y-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3'>
                <Clock className='w-8 h-8 text-orange-600' />
                Upcoming Projects
              </h2>
              <Badge variant='outline' className='px-4 py-2'>
                {upcomingProjects.length} projects
              </Badge>
            </div>

            {paginatedUpcoming.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-5'>
                {paginatedUpcoming.map((project) => (
                  <div
                    key={project.id}
                    className='group cursor-pointer'
                    onClick={() => handleItemClick(project, 'movie')}
                    role='button'
                    aria-label={`View ${project.title} (movie)`}
                  >
                    <div className='relative mb-3 overflow-hidden rounded-lg'>
                      <Image
                        src={`${IMAGE_BASE_URL}${project.poster_path}`}
                        alt={project.title}
                        width={500}
                        height={750}
                        className='w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300'
                        sizes='(max-width: 640px) 150px, 180px'
                      />
                      <Badge className='absolute top-3 left-3 bg-orange-600 hover:bg-orange-700'>
                        Coming Soon
                      </Badge>
                      <div className='absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                        <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                        {project.vote_average.toFixed(1)}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <h3 className='font-semibold text-base line-clamp-1 text-slate-900 dark:text-white'>
                        {project.title}
                      </h3>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>
                          {project.release_date
                            ? formatDate(project.release_date)
                            : 'N/A'}
                        </span>
                        <span className='line-clamp-1'>
                          {project.character || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className=''>
                <CardContent className='p-12 text-center space-y-4'>
                  <Clock className='w-16 h-16 text-slate-400 mx-auto' />
                  <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                    No Upcoming Projects
                  </h3>
                  <p className='text-slate-600 dark:text-slate-400'>
                    No announced upcoming projects for {person.name} at this
                    time.
                  </p>
                </CardContent>
              </Card>
            )}

            {totalUpcomingPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(setUpcomingPage, upcomingPage - 1)
                      }
                      className={
                        upcomingPage === 1
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: totalUpcomingPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(setUpcomingPage, page)}
                        isActive={upcomingPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(setUpcomingPage, upcomingPage + 1)
                      }
                      className={
                        upcomingPage === totalUpcomingPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default PersonDetailsContent
