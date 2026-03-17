import { create } from 'zustand'
import type { Movie } from '@/types/movie'

interface HomeState {
  currentSlide: number
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void
  watchlistIds: number[]
  setWatchlistIds: (ids: number[] | ((prev: number[]) => number[])) => void
  
  topRated: Movie[] | null
  setTopRated: (movies: Movie[] | null) => void
  
  upcomingMovies: Movie[] | null
  setUpcomingMovies: (movies: Movie[] | null) => void
  
  moviesList: Movie[] | null
  setMoviesList: (movies: Movie[] | null) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  currentSlide: 0,
  setCurrentSlide: (slide) =>
    set((state) => ({
      currentSlide:
        typeof slide === 'function' ? slide(state.currentSlide) : slide,
    })),
  watchlistIds: [],
  setWatchlistIds: (ids) =>
    set((state) => ({
      watchlistIds: typeof ids === 'function' ? ids(state.watchlistIds) : ids,
    })),
    
  topRated: null,
  setTopRated: (movies) => set({ topRated: movies }),
  
  upcomingMovies: null,
  setUpcomingMovies: (movies) => set({ upcomingMovies: movies }),
  
  moviesList: null,
  setMoviesList: (movies) => set({ moviesList: movies }),
}))
