'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from '@/components/ui/sheet'
import { useDiscoverStore } from '@/lib/store/discoverStore'
import { Calendar, Filter, X } from 'lucide-react'

const movieGenres = [
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

const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

export default function FilterSheet() {
  const {
    selectedGenres,
    minDate,
    maxDate,
    sortBy,
    mediaType,
    isFilterOpen,
    toggleGenre,
    setMinDate,
    setMaxDate,
    setSortBy,
    setMediaType,
    setIsFilterOpen,
    clearAllFilters,
  } = useDiscoverStore()

  const genres = mediaType === 'movie' ? movieGenres : tvGenres

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    {
      value:
        mediaType === 'movie' ? 'release_date.desc' : 'first_air_date.desc',
      label: 'Latest Release',
    },
    {
      value: mediaType === 'movie' ? 'release_date.asc' : 'first_air_date.asc',
      label: 'Earliest Release',
    },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
  ]

  const handleMediaTypeChange = (value: 'movie' | 'tv') => {
    setMediaType(value)
  }

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent
        side='right'
        className='w-[400px] h-[90dvh] mr-5 rounded-xl my-auto overflow-auto scrollbar-hide pb-[3rem] p-2'
      >
        <SheetHeader>
          <SheetTitle>
            Filter {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          </SheetTitle>
          <SheetDescription>
            Customize your {mediaType === 'movie' ? 'movie' : 'TV show'}{' '}
            discovery experience
          </SheetDescription>
        </SheetHeader>
        <div className='p-4 space-y-6'>
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
                  onClick={() => toggleGenre(genre.id.toString())}
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
                  onChange={(e) => setMinDate(e.target.value)}
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
                  onChange={(e) => setMaxDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex flex-col justify-start gap-5 lg:flex-row lg:items-center'>
            <div className='space-y-2'>
              <h3 className='font-semibold'>Sort By</h3>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
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

            <div className='space-y-2'>
              <h3 className='font-semibold'>Media Type</h3>
              <Select value={mediaType} onValueChange={handleMediaTypeChange}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='movie'>Movies</SelectItem>
                  <SelectItem value='tv'>TV Shows</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
      </SheetContent>
    </Sheet>
  )
}
