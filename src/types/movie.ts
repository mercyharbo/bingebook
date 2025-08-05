export type Movie = {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  id: number
  original_language: string
  overview: string
  popularity: number
  poster_path: string
  vote_average: number
  vote_count: number
  title?: string
  release_date?: string
  video?: boolean
  original_title?: string
  name?: string
  first_air_date?: string
  original_name?: string
}

export type MovieOnly = {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  id: number
  original_language: string
  overview: string
  popularity: number
  poster_path: string
  vote_average: number
  vote_count: number
  media_type: 'movie'
  original_title: string
  title: string
  release_date: string
  video: boolean
}

export type MovieResponse = {
  results: Movie[]
  total_pages: number
  total_results: number
  dates: {
    maximun: Date
    minimum: Date
  }
}

export type MovieOnlyResponse = {
  results: MovieOnly[]
  total_pages: number
  total_results: number
  dates: {
    maximum: Date
    minimum: Date
  }
}
