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
import { Calendar, Filter, X } from 'lucide-react'

interface UpcomingFilterSheetProps {
  isFilterOpen: boolean
  setIsFilterOpen: (open: boolean) => void
  selectedGenres: string[]
  minDate: string
  maxDate: string
  sortBy: string
  setMinDate: (date: string) => void
  setMaxDate: (date: string) => void
  setSortBy: (sort: string) => void
  handleGenreToggle: (genreId: string) => void
  clearAllFilters: () => void
}

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

export default function UpcomingFilterSheet({
  isFilterOpen,
  setIsFilterOpen,
  selectedGenres,
  minDate,
  maxDate,
  sortBy,
  setMinDate,
  setMaxDate,
  setSortBy,
  handleGenreToggle,
  clearAllFilters,
}: UpcomingFilterSheetProps) {
  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent
        side='right'
        className='w-[400px] h-dvh overflow-auto scrollbar-hide pb-[3rem] p-5'
      >
        <SheetHeader className='p-0'>
          <SheetTitle>Filter Movies</SheetTitle>
          <SheetDescription>
            Customize your movie discovery experience
          </SheetDescription>
        </SheetHeader>
        <div className='mt-6 space-y-6'>
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
      </SheetContent>
    </Sheet>
  )
}
