import { Card, CardContent } from '@/components/ui/card'
import { useWatchlistStore } from '@/lib/store/watchlistStore'
import Image from 'next/image'
import EpisodesDialog from './EpisodesDialog'

type Season = {
  id: number
  name: string
  poster_path?: string | null
  air_date?: string
  episode_count: number
  overview?: string
  season_number: number
}

export default function SeasonCard({
  season,
  tvId,
}: {
  season: Season
  tvId: string
}) {
  const { watchlistItem } = useWatchlistStore()

  return (
    <Card
      key={season.id}
      className='glass-dark border border-white/5 p-4 rounded-lg hover:border-primary/30 transition-all group overflow-hidden'
    >
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row gap-6'>
          <div className='flex-shrink-0 w-[120px] sm:w-[150px] relative rounded-lg overflow-hidden shadow-xl'>
            <Image
              src={
                season.poster_path
                  ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                  : '/sample-poster.jpg'
              }
              alt={season.name}
              width={150}
              height={225}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              sizes='(max-width: 640px) 120px, 150px'
            />
          </div>
          <div className='flex-1 space-y-4 py-2'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-xl font-medium group-hover:text-primary transition-colors'>
                  {season.name}
                </h3>
                {season.air_date && (
                  <p className='text-xs text-white/40 font-medium'>
                    Aired {new Date(season.air_date).getFullYear()} •{' '}
                    {season.episode_count} Episodes
                  </p>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <EpisodesDialog tvId={tvId} season={season} />
              </div>
            </div>

            <p className='text-sm text-white/60 leading-relaxed line-clamp-3 font-medium'>
              {season.overview || 'No overview available for this season.'}
            </p>

            {watchlistItem && (
              <div className='pt-2'>
                <div className='flex items-center justify-between text-xs font-medium uppercase text-primary/60 mb-2'>
                  <span>Progress</span>
                  <span>
                    {watchlistItem?.seen_episodes[
                      `season_${season.season_number}`
                    ]?.length || 0}{' '}
                    / {season.episode_count}
                  </span>
                </div>
                <div className='h-1.5 w-full bg-white/5 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary transition-all duration-1000'
                    style={{
                      width: `${((watchlistItem?.seen_episodes[`season_${season.season_number}`]?.length || 0) / season.episode_count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
