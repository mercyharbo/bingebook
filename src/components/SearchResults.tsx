'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

type SearchResult = {
  id: number
  name?: string
  title?: string
  profile_path?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  known_for_department?: string
}

type SearchResultsProps = {
  results: SearchResult[]
  onViewAll: () => void
}

export default function SearchResults({
  results,
  onViewAll,
}: SearchResultsProps) {
  const router = useRouter()

  const getMediaType = (item: SearchResult): 'movie' | 'tv' | 'person' => {
    if (item.title && item.release_date) return 'movie'
    if (item.name && item.first_air_date) return 'tv'
    if (item.name && item.known_for_department) return 'person'
    return 'movie'
  }

  const handleItemClick = (item: SearchResult) => {
    const mediaType = getMediaType(item)
    const path = `/${mediaType}/${item.id}`
    router.push(path)
  }

  const getMediaTypeColor = (item: SearchResult) => {
    const type = getMediaType(item)
    switch (type) {
      case 'movie':
        return 'bg-blue-500'
      case 'tv':
        return 'bg-green-500'
      case 'person':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getDisplayTitle = (item: SearchResult) => {
    const type = getMediaType(item)
    if (type === 'person') return item.name
    return item.title || item.name
  }

  const getImagePath = (item: SearchResult) => {
    if (!item.poster_path && !item.profile_path) return '/sample-poster.jpg'
    const path = item.poster_path || item.profile_path
    return `https://image.tmdb.org/t/p/w200${path}`
  }

  const getSubtitle = (item: SearchResult) => {
    const type = getMediaType(item)
    if (type === 'person') return item.known_for_department
    const date = item.release_date || item.first_air_date
    return date ? new Date(date).getFullYear() : 'No date'
  }

  if (results.length === 0) {
    return (
      <div className='absolute top-2 left-0 right-5 p-4 rounded-lg text-center text-muted-foreground bg-white ring-1 ring-gray-300 dark:bg-gray-800 dark:ring-gray-700'>
        No results found
      </div>
    )
  }

  return (
    <div className='absolute top-2 left-0 right-5 rounded-md w-full lg:w-auto border border-gray-300 bg-popover text-popover-foreground shadow-md'>
      <ScrollArea className='h-[400px] lg:h-[350px]'>
        <div className='p-2 space-y-2'>
          {results.slice(0, 5).map((item) => (
            <div
              key={`${getMediaType(item)}-${item.id}`}
              className='flex gap-3 p-2 rounded-lg hover:bg-accent  border last:border-none border-gray-300 cursor-pointer'
              onClick={() => handleItemClick(item)}
            >
              <Image
                src={getImagePath(item)}
                alt={getDisplayTitle(item) || 'Media'}
                width={45}
                height={68}
                className='rounded-md object-cover'
              />
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <h3 className='font-medium line-clamp-1'>
                    {getDisplayTitle(item)}
                  </h3>
                  <Badge
                    className={`${getMediaTypeColor(item)} text-white shrink-0`}
                  >
                    {getMediaType(item)}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {getSubtitle(item)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {results.length > 5 && (
        <div className='p-2'>
          <Button variant='ghost' className='w-full' onClick={onViewAll}>
            View all {results.length} results
          </Button>
        </div>
      )}
    </div>
  )
}
