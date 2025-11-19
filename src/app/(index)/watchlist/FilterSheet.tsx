'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Filter, SortAsc } from 'lucide-react'

interface FilterItem {
  id: string
  label: string
  count: number
}

interface FilterSheetProps {
  filters: FilterItem[]
  activeFilter: string
  setActiveFilter: (filter: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function FilterSheet({
  filters,
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  isOpen,
  onOpenChange,
}: FilterSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-[400px] h-[90dvh] mr-5 rounded-xl my-auto overflow-auto scrollbar-hide pb-[3rem] p-2'
      >
        <SheetHeader>
          <SheetTitle>Filter Your Watchlist</SheetTitle>
          <SheetDescription>
            Choose categories to filter your watchlist items
          </SheetDescription>
        </SheetHeader>
        <div className='p-4 space-y-6'>
          <div className='flex flex-col gap-3'>
            <h3 className='font-semibold flex items-center gap-2'>
              <Filter className='size-4' />
              Categories
            </h3>
            <div className='flex flex-wrap gap-2'>
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`text-sm px-2 py-2.5 h-auto min-h-[40px] rounded-md transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className='font-medium'>{filter.label}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {filter.count}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <h3 className='font-semibold flex items-center gap-2'>
              <SortAsc className='size-4' />
              Sort By
            </h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger size='lg' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='added_date'>Sort by Added Date</SelectItem>
                <SelectItem value='title'>Sort by Title</SelectItem>
                <SelectItem value='release_date'>
                  Sort by Release Date
                </SelectItem>
                <SelectItem value='rating'>Sort by Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
