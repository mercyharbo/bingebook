import TVProgressTracker from '@/components/TvProgressTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function OverviewTab({
  tvShow,
  watchlistItem,
  formatRuntime,
}: {
  tvShow: any
  watchlistItem: any
  formatRuntime: (minutes: number[]) => string
}) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
      <div className='lg:col-span-2 space-y-12'>
        <div className='space-y-4'>
          <h2 className='text-xl font-bold'>Storyline</h2>
          <p className='text-gray-300 leading-relaxed'>
            {tvShow.overview || 'No overview available.'}
          </p>
        </div>

        {watchlistItem && tvShow && (
          <TVProgressTracker
            watchlistId={watchlistItem.id}
            tmdbId={tvShow.id}
            seasons={tvShow.seasons}
            seenEpisodes={watchlistItem.seen_episodes}
            completedSeasons={watchlistItem.completed_seasons}
          />
        )}
      </div>

      <div className='space-y-8'>
        <Card className='glass-dark'>
          <CardHeader>
            <CardTitle className='text-xl'>Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Network</span>
              <span className='text-right'>
                {tvShow.networks[0]?.name || 'N/A'}
              </span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Type</span>
              <span className='text-right'>TV Series</span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Total Ep</span>
              <span className='text-right'>{tvShow.number_of_episodes}</span>
            </div>
            <Separator className='bg-white/5' />
            <div className='flex justify-between items-center group'>
              <span className='text-gray-300'>Runtime</span>
              <span className='text-right'>
                {formatRuntime(tvShow.episode_run_time)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
