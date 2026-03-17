import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { fetcher } from '@/lib/utils'
import { Eye, Tv } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  still_path: string | null
  runtime: number | null
}

interface SeasonSummary {
  season_number: number
  name: string
}

interface EpisodesDialogProps {
  tvId: string
  season: SeasonSummary
}

export default function EpisodesDialog({ tvId, season }: EpisodesDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: seasonData, isLoading: seasonLoading } = useSWR<{
    episodes: Episode[]
  }>(
    isOpen
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${tvId}/season/${season.season_number}?language=en-US`
      : null,
    fetcher,
  )
  const episodes: Episode[] = seasonData?.episodes || []

  const hasEpisodeAired = (airDate: string | null) => {
    if (!airDate) return false
    const currentDate = new Date()
    const episodeDate = new Date(airDate)
    return episodeDate <= currentDate
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='lg' className='text-white'>
          Browse Episodes
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[90vw] md:max-w-2xl lg:max-w-2xl max-h-[60vh] scrollbar-hide overflow-y-auto bg-background backdrop-blur-3xl border-white/10 p-0 rounded-lg gap-0'>
        <DialogHeader className='p-6 sticky top-0 bg-background z-10 border-b border-white/10'>
          <DialogTitle className=''>{season.name} Episodes</DialogTitle>
        </DialogHeader>

        <div className='p-4 space-y-2'>
          {seasonLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-24 w-full opacity-20 rounded-xl' />
              <Skeleton className='h-24 w-full opacity-20 rounded-xl' />
              <Skeleton className='h-24 w-full opacity-20 rounded-xl' />
            </div>
          ) : episodes.length > 0 ? (
            episodes.map((episode) => {
              const hasAired = hasEpisodeAired(episode.air_date)
              return (
                <div
                  key={episode.id}
                  className={`flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-white/5 transition-all ${
                    !hasAired ? 'opacity-40' : ''
                  }`}
                >
                  <div className='relative w-full sm:w-32 md:w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden border border-white/5'>
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-white/5 flex items-center justify-center'>
                        <Tv className='size-6 text-white/20' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0 flex flex-col gap-2'>
                    <div className='flex justify-between items-start gap-2'>
                      <span className='font-medium text-sm md:text-base'>
                        {episode.episode_number}. {episode.name}
                      </span>
                      {hasAired && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors flex-shrink-0'
                        >
                          <Eye className='size-4' />
                        </Button>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-gray-300 font-medium'>
                      {episode.air_date && (
                        <span>
                          {new Date(episode.air_date).toLocaleDateString()}
                        </span>
                      )}
                      {episode.runtime && (
                        <>
                          <span>•</span>
                          <span>{episode.runtime} mins</span>
                        </>
                      )}
                    </div>
                    <p className='text-xs text-gray-300 leading-relaxed md:line-clamp-3 line-clamp-2'>
                      {episode.overview || 'No description provided.'}
                    </p>
                    {!hasAired && (
                      <Badge className='w-fit bg-primary/10 text-primary border-none text-[9px] md:text-[10px] h-4 md:h-5'>
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='p-8 text-center text-white/40'>
              No episodes listed yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
