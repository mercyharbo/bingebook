import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react'
import { useState } from 'react'

// interface UpcomingFilterSheetProps {
//   isFilterOpen: boolean
//   setIsFilterOpen: (open: boolean) => void
//   selectedGenres: string[]
//   dateRange: DateRange | undefined
//   sortBy: string
//   setDateRange: (range: DateRange | undefined) => void
//   setSortBy: (sort: string) => void
//   handleGenreToggle: (genreId: string) => void
//   clearAllFilters: () => void
// }

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

import { useUpcomingStore } from '@/lib/store/upcomingStore'

export default function UpcomingFilterSheet() {
  const {
    isFilterOpen,
    setIsFilterOpen,
    selectedGenres,
    dateRange,
    sortBy,
    setDateRange,
    setSortBy,
    toggleGenre: handleGenreToggle,
    clearAllFilters,
  } = useUpcomingStore()
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent
        side='right'
        className='w-[400px] h-dvh overflow-auto scrollbar-hide pb-[3rem] p-6 bg-zinc-950 border-white/10 text-white'
      >
        <SheetHeader className='p-0 space-y-2'>
          <SheetTitle className='text-3xl font-semibold italic text-white'>Filter Movies</SheetTitle>
          <SheetDescription className='text-gray-400'>
            Customize your movie discovery experience
          </SheetDescription>
        </SheetHeader>
        <div className='mt-6 space-y-6'>
          <div>
            <h3 className='text-sm font-medium text-white/50 mb-4 flex items-center gap-2 uppercase tracking-tight'>
              <Filter className='h-3 w-3' />
              Genres
            </h3>
            <div className='flex flex-wrap gap-2'>
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  size='sm'
                  onClick={() => handleGenreToggle(genre.id.toString())}
                  className={cn(
                    'text-xs rounded-lg transition-all duration-300',
                    selectedGenres.includes(genre.id.toString())
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator className='bg-white/5' />

          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-white/50 mb-4 flex items-center gap-2 uppercase tracking-tight'>
              <CalendarIcon className='h-3 w-3' />
              Release Date Range
            </h3>
            <div className='grid gap-2'>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id='date'
                    className={cn(
                      'w-full h-11 justify-start text-left font-medium bg-white/5 border-white/10 rounded-lg hover:bg-white/10 transition-all',
                      !dateRange?.from && 'text-white/40'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto p-0 bg-zinc-950 border-white/10'
                  align='start'
                >
                  <Calendar
                    mode='range'
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range)
                      if (range?.from && range?.to) {
                        setIsCalendarOpen(false)
                      }
                    }}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator className='bg-white/5' />

          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-white/50 uppercase tracking-tight'>Sort By</h3>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className='h-12 bg-white/5 border-white/10 rounded-lg'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-zinc-950 border-white/10 text-white'>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className='focus:bg-white/10 focus:text-white'>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={clearAllFilters}
            variant='ghost'
            className='w-full h-12 text-white/60 hover:text-white bg-white/5 border border-white/10 mt-4 rounded-lg transition-all active:scale-95'
          >
            <X className='h-4 w-4 mr-2' />
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
