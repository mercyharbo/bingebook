import { TMDBEpisode, TMDBSeason, WatchlistItem } from '@/types/watchlist'

export type WatchlistStatus =
  | 'planned'
  | 'watching'
  | 'watched'
  | 'coming-soon'

export type SeasonEpisodeMap = Record<number, TMDBEpisode[]>

const FINISHED_STATUSES = ['Ended', 'Canceled']
const CONTINUING_STATUSES = ['Returning Series', 'In Production', 'Planned']

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const isEpisodeAvailable = (
  airDate: string | null | undefined,
  today = getToday(),
) => {
  if (!airDate) return false

  const episodeDate = new Date(airDate)
  if (Number.isNaN(episodeDate.getTime())) return false

  episodeDate.setHours(0, 0, 0, 0)
  return episodeDate <= today
}

const getEpisodeCode = (seasonNumber: number, episodeNumber: number) =>
  `S${seasonNumber.toString().padStart(2, '0')}E${episodeNumber
    .toString()
    .padStart(2, '0')}`

const getSeenEpisodeCount = (item: WatchlistItem) =>
  Object.values(item.seen_episodes || {}).reduce(
    (count, episodes) => count + episodes.length,
    0,
  )

const hasProgress = (item: WatchlistItem) =>
  item.is_seen || getSeenEpisodeCount(item) > 0

const getValidSeasons = (item: WatchlistItem) =>
  (item.tmdb_data.seasons || []).filter((season) => season.season_number > 0)

const isFinishedStatus = (status?: string) =>
  FINISHED_STATUSES.includes(status || '')

const isContinuingStatus = (status?: string) =>
  !status || CONTINUING_STATUSES.includes(status)

const hasFutureSeason = (seasons: TMDBSeason[], today: Date) =>
  seasons.some((season) => {
    if (!season.air_date) return false
    const seasonDate = new Date(season.air_date)
    if (Number.isNaN(seasonDate.getTime())) return false
    seasonDate.setHours(0, 0, 0, 0)
    return seasonDate > today
  })

const getSeasonProgress = (
  item: WatchlistItem,
  season: TMDBSeason,
  episodeMap: SeasonEpisodeMap,
  today: Date,
) => {
  const seasonEpisodes = episodeMap[season.season_number]
  const seenEpisodes = item.seen_episodes?.[`season_${season.season_number}`] || []

  if (seasonEpisodes && seasonEpisodes.length > 0) {
    const availableEpisodes = seasonEpisodes.filter((episode) =>
      isEpisodeAvailable(episode.air_date, today),
    )
    const futureEpisodes = seasonEpisodes.filter(
      (episode) => episode.air_date && !isEpisodeAvailable(episode.air_date, today),
    )

    const availableCodes = new Set(
      availableEpisodes.map((episode) =>
        getEpisodeCode(season.season_number, episode.episode_number),
      ),
    )
    const watchedAvailableCount = seenEpisodes.filter((episodeCode) =>
      availableCodes.has(episodeCode),
    ).length

    return {
      availableCount: availableEpisodes.length,
      watchedAvailableCount,
      hasFutureEpisodes: futureEpisodes.length > 0,
      isComplete:
        availableEpisodes.length > 0 &&
        watchedAvailableCount >= availableEpisodes.length,
      hasEpisodeDetails: true,
    }
  }

  const isAiredSeason = isEpisodeAvailable(season.air_date, today)
  const fallbackAvailableCount = isAiredSeason ? season.episode_count || 0 : 0

  return {
    availableCount: fallbackAvailableCount,
    watchedAvailableCount: Math.min(seenEpisodes.length, fallbackAvailableCount),
    hasFutureEpisodes: false,
    isComplete:
      fallbackAvailableCount > 0 &&
      (item.completed_seasons || []).includes(season.season_number),
    hasEpisodeDetails: false,
  }
}

export const getTVProgressSummary = (
  item: WatchlistItem,
  episodeMap: SeasonEpisodeMap = {},
) => {
  const today = getToday()
  const seasons = getValidSeasons(item)
  const seasonProgress = seasons.map((season) =>
    getSeasonProgress(item, season, episodeMap, today),
  )

  const availableEpisodes = seasonProgress.reduce(
    (count, season) => count + season.availableCount,
    0,
  )
  const watchedAvailableEpisodes = seasonProgress.reduce(
    (count, season) => count + season.watchedAvailableCount,
    0,
  )
  const hasFutureEpisodes = seasonProgress.some((season) => season.hasFutureEpisodes)
  const hasFutureSeasonOnly = hasFutureSeason(seasons, today)
  const hasKnownAvailableEpisodes = availableEpisodes > 0
  const allAvailableEpisodesWatched =
    hasKnownAvailableEpisodes && watchedAvailableEpisodes >= availableEpisodes
  const hasUnwatchedAvailableEpisodes =
    hasKnownAvailableEpisodes && watchedAvailableEpisodes < availableEpisodes

  return {
    availableEpisodes,
    watchedAvailableEpisodes,
    hasFutureEpisodes,
    hasFutureSeasonOnly,
    hasKnownAvailableEpisodes,
    allAvailableEpisodesWatched,
    hasUnwatchedAvailableEpisodes,
  }
}

export const classifyWatchlistItem = (
  item: WatchlistItem,
  episodeMap: SeasonEpisodeMap = {},
): WatchlistStatus => {
  if (item.media_type === 'movie') {
    return item.is_seen ? 'watched' : 'planned'
  }

  if (!hasProgress(item)) return 'planned'
  if (item.is_seen) return 'watched'

  const summary = getTVProgressSummary(item, episodeMap)
  const status = item.tmdb_data.status

  if (summary.hasUnwatchedAvailableEpisodes) return 'watching'

  if (summary.allAvailableEpisodesWatched) {
    if (summary.hasFutureEpisodes) return 'watching'
    if (isContinuingStatus(status) && summary.hasFutureSeasonOnly) {
      return 'coming-soon'
    }
    return 'watched'
  }

  if (isFinishedStatus(status)) return 'watched'

  return 'planned'
}

export const isWatchedStatus = (status: WatchlistStatus) => status === 'watched'
