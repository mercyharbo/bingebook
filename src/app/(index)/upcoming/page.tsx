'use client'

import {
  Calendar,
  Clock,
  Filter,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { fetcher } from '@/lib/utils'
import type { MovieOnly } from '@/types/movie'
import { useRouter } from 'next/navigation'

export default function Upcoming() {
  const router = useRouter()
  const [upcomingMovies, setUpcomingMovies] = useState<MovieOnly[] | null>(null)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [minDate, setMinDate] = useState<string>('')
  const [maxDate, setMaxDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('popularity.desc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<MovieOnly | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ]

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'release_date.desc', label: 'Latest Release' },
    { value: 'release_date.asc', label: 'Earliest Release' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
  ]

  const queryParams = new URLSearchParams({
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: currentPage.toString(),
    sort_by: sortBy,
    with_release_type: '2|3',
    ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(',') }),
    ...(minDate && { 'release_date.gte': minDate }),
    ...(maxDate && { 'release_date.lte': maxDate }),
  })

  const { error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/movie/upcoming?${queryParams}`,
    fetcher,
    {
      onSuccess: (data) => {
        setUpcomingMovies(data.results)
        setTotalPages(data.total_pages || 1)
      },
    }
  )

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const clearAllFilters = () => {
    setSelectedGenres([])
    setMinDate('')
    setMaxDate('')
    setSearchQuery('')
    setSortBy('popularity.desc')
    setCurrentPage(1)
  }

  const filteredMovies = upcomingMovies?.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMovieClick = (movie: MovieOnly) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleViewDetails = () => {
    if (selectedMovie) {
      router.push(`/movie/${selectedMovie.id}`)
    }
  }

  const MovieCardSkeleton = () => (
    <Card className='overflow-hidden p-0'>
      <Skeleton className='w-full h-48' />
      <CardContent className='p-4 space-y-2'>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <div className='flex gap-2'>
          <Skeleton className='h-5 w-12' />
          <Skeleton className='h-5 w-20' />
        </div>
      </CardContent>
    </Card>
  )

  const FilterSection = () => (
    <div className='space-y-6'>
      <div>
        <h3 className='font-semibold mb-3 flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          Genres
        </h3>
        <div className='flex flex-wrap gap-2'>
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={
                selectedGenres.includes(genre.id.toString())
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              onClick={() => handleGenreToggle(genre.id.toString())}
              className='text-xs'
            >
              {genre.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className='space-y-5'>
        <h3 className='font-semibold mb-3 flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          Release Date Range
        </h3>
        <div className='space-y-3 flex flex-col lg:flex-row gap-5'>
          <div className='space-y-2'>
            <label htmlFor='minDate' className='text-sm font-medium block'>
              From:
            </label>
            <Input
              id='minDate'
              type='date'
              value={minDate}
              onChange={(e) => {
                setMinDate(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='maxDate' className='text-sm font-medium block'>
              To:
            </label>
            <Input
              id='maxDate'
              type='date'
              value={maxDate}
              onChange={(e) => {
                setMaxDate(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className='font-semibold mb-3'>Sort By</h3>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={clearAllFilters}
        variant='outline'
        className='w-full bg-transparent'
      >
        <X className='h-4 w-4 mr-2' />
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <main className='flex flex-col gap-6 w-full p-5 md:w-full lg:w-full xl:w-full 2xl::w-[90%] mx-auto lg:p-10'>
      <header className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Clock className='h-8 w-8 text-primary' />
            Upcoming Movies
          </h1>
        </div>

        {/* Search and Filters */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <div className='relative flex-1 w-full lg:max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search upcoming movies...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 w-full h-12 lg:w-auto'
            />
          </div>

          <div className='flex gap-2 w-full lg:w-auto'>
            <div className='hidden lg:flex gap-2'>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  className='lg:hidden bg-transparent lg:w-auto w-full h-12'
                >
                  <SlidersHorizontal className='h-4 w-4' />
                  Filters
                  {(selectedGenres.length > 0 || minDate || maxDate) && (
                    <Badge variant='secondary' className='ml-2'>
                      {selectedGenres.length +
                        (minDate ? 1 : 0) +
                        (maxDate ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-[400px] h-dvh pb-[3rem] p-5'
              >
                <SheetHeader className='p-0'>
                  <SheetTitle>Filter Movies</SheetTitle>
                  <SheetDescription>
                    Customize your movie discovery experience
                  </SheetDescription>
                </SheetHeader>
                <div className='mt-6'>
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className='hidden lg:block'>
          <FilterSection />
        </div>

        {(selectedGenres.length > 0 || minDate || maxDate || searchQuery) && (
          <div className='flex flex-wrap gap-2 items-center'>
            <span className='text-sm font-medium'>Active filters:</span>
            {selectedGenres.map((genreId) => {
              const genre = genres.find((g) => g.id.toString() === genreId)
              return (
                <Badge key={genreId} variant='secondary' className='gap-1'>
                  {genre?.name}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => handleGenreToggle(genreId)}
                  />
                </Badge>
              )
            })}
            {minDate && (
              <Badge variant='secondary' className='gap-1'>
                From: {minDate}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => setMinDate('')}
                />
              </Badge>
            )}
            {maxDate && (
              <Badge variant='secondary' className='gap-1'>
                To: {maxDate}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => setMaxDate('')}
                />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant='secondary' className='gap-1'>
                Search: {searchQuery}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            <Button variant='ghost' size='sm' onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}
      </header>

      {isLoading && (
        <section
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 `}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </section>
      )}

      {error && (
        <div className='text-center py-12'>
          <p className='text-lg text-muted-foreground mb-4'>
            Error loading movies
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}

      {!isLoading && !error && filteredMovies?.length === 0 && (
        <div className='text-center py-12'>
          <Calendar className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-xl font-semibold mb-2'>No movies found</h3>
          <p className='text-muted-foreground mb-4'>
            Try adjusting your filters or search terms
          </p>
          <Button onClick={clearAllFilters}>Clear Filters</Button>
        </div>
      )}

      {!isLoading && !error && filteredMovies && filteredMovies.length > 0 && (
        <section
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 `}
        >
          {filteredMovies.map((movie: MovieOnly) => (
            <Card
              key={movie.id}
              className={`group p-0 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer `}
              onClick={() => handleMovieClick(movie)}
            >
              <div className={`relative `}>
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/placeholder.svg?height=300&width=200&text=No+Image'
                  }
                  alt={movie.title}
                  width={500}
                  height={750}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 w-full h-72 `}
                />
                <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors' />
                <div className='absolute top-2 right-2 flex flex-col gap-1'>
                  {movie.vote_average > 0 && (
                    <Badge className='bg-black/70 text-white'>
                      <Star className='h-3 w-3 mr-1 fill-yellow-400 text-yellow-400' />
                      {movie.vote_average.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className='absolute bottom-2 left-2 right-2 flex gap-1 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity'>
                  <Button
                    size='sm'
                    className='flex-1 bg-primary/90 hover:bg-primary ring-1 ring-gray-500 text-white cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMovieClick(movie)
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size='sm'
                    variant='secondary'
                    className='bg-white/90 hover:bg-white cursor-pointer'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <CardContent className={`p-3 space-y-3 `}>
                <div>
                  <h3 className='font-semibold text-lg line-clamp-1'>
                    {movie.title}
                  </h3>
                  <p className={`text-sm text-muted-foreground line-clamp-2 `}>
                    {movie.overview || 'No description available.'}
                  </p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {movie.original_language.toUpperCase()}
                  </Badge>
                  <Badge variant='secondary' className='text-xs'>
                    {new Date(movie.release_date).toLocaleDateString()}
                  </Badge>
                  {movie.adult && (
                    <Badge variant='destructive' className='text-xs'>
                      18+
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!isLoading &&
        !error &&
        filteredMovies &&
        filteredMovies.length > 0 &&
        totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className='cursor-pointer'
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className='px-4 py-2'>...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

      {!isLoading && !error && filteredMovies && (
        <div className='text-center text-sm text-muted-foreground'>
          Showing {filteredMovies.length} movies • Page {currentPage} of{' '}
          {totalPages}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='lg:max-w-[500px] h-[70vh] overflow-y-auto scrollbar-hide'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              {selectedMovie?.title}
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              Quick Preview
            </DialogDescription>
          </DialogHeader>

          {selectedMovie && (
            <div className='space-y-4'>
              {/* Responsive poster and meta section */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-shrink-0 mx-auto sm:mx-0'>
                  <Image
                    src={
                      selectedMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                        : '/sample-poster.jpg'
                    }
                    alt={selectedMovie.title}
                    width={150}
                    height={200}
                    className='rounded-lg object-cover w-[150px] h-[200px]'
                  />
                </div>

                <div className='flex-1 space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {selectedMovie.vote_average > 0 && (
                      <Badge className='bg-yellow-500 text-black text-xs'>
                        <Star className='h-3 w-3 fill-current mr-1' />
                        {selectedMovie.vote_average.toFixed(1)}
                      </Badge>
                    )}
                    <Badge variant='outline' className='text-xs'>
                      {selectedMovie.original_language.toUpperCase()}
                    </Badge>
                    <Badge variant='secondary' className='text-xs'>
                      {new Date(
                        selectedMovie.release_date
                      ).toLocaleDateString()}
                    </Badge>
                    {selectedMovie.adult && (
                      <Badge variant='destructive' className='text-xs'>
                        18+
                      </Badge>
                    )}
                  </div>

                  <div className='space-y-1 text-xs sm:text-sm text-muted-foreground'>
                    <p>Popularity: {selectedMovie.popularity.toFixed(0)}</p>
                    <p>Votes: {selectedMovie.vote_count}</p>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className='font-semibold text-sm'>Overview</h4>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {selectedMovie.overview || 'No description available.'}
                </p>
              </div>

              {/* Buttons */}
              <div className='flex flex-wrap gap-2 pt-2'>
                <Button
                  onClick={handleViewDetails}
                  className='flex-1 min-w-[150px]'
                >
                  View Full Details
                </Button>
                <Button variant='outline' size='icon'>
                  <Plus className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='icon'>
                  <Play className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
