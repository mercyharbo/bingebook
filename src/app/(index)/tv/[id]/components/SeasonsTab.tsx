import SeasonCard from './SeasonCard'

type Season = {
  id: number
  name: string
  overview?: string
  poster_path?: string
  season_number: number
  episode_count: number
  air_date?: string
}

export default function SeasonsTab({
  seasons,
  tvId,
}: {
  seasons: Season[]
  tvId: string
}) {
  return (
    <div className='grid gap-6 grid-cols-1 xl:grid-cols-2'>
      {seasons
        .filter((s) => s.season_number > 0)
        .map((season) => (
          <SeasonCard key={season.id} season={season} tvId={tvId} />
        ))}
    </div>
  )
}
