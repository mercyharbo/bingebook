export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBSeason {
  id?: number
  season_number: number
  episode_count: number
  name: string
}

export interface TMDBData {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  genres?: TMDBGenre[]
  vote_average?: number
  vote_count?: number
  popularity?: number
  original_language?: string
  original_title?: string
  original_name?: string
  adult?: boolean
  budget?: number
  revenue?: number
  status?: string
  tagline?: string
  homepage?: string
  number_of_seasons?: number
  number_of_episodes?: number
  in_production?: boolean
  episode_run_time?: number[]
  seasons?: TMDBSeason[]
}

export interface WatchlistItem {
  id: number
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  tmdb_data: TMDBData
  poster_path: string | null
  is_seen: boolean
  seen_episodes: Record<string, string[]>
  completed_seasons: number[]
  created_at: string
  last_updated: string
}
