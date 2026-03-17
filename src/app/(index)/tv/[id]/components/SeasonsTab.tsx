import SeasonCard from './SeasonCard'

export default function SeasonsTab({ seasons, tvId }: { seasons: any[]; tvId: string }) {
  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
      {seasons.filter(s => s.season_number > 0).map(season => (
        <SeasonCard key={season.id} season={season} tvId={tvId} />
      ))}
    </div>
  )
}
