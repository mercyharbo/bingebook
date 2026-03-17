import type { MovieOnly } from '@/types/movie'
import { create } from 'zustand'

import { DateRange } from 'react-day-picker'

interface UpcomingState {
  upcomingMovies: MovieOnly[] | null
  selectedGenres: string[]
  dateRange: DateRange | undefined
  searchQuery: string
  sortBy: string
  currentPage: number
  totalPages: number
  isFilterOpen: boolean
  selectedMovie: MovieOnly | null
  isModalOpen: boolean
  currentSlide: number
  watchlistIds: number[]
  setUpcomingMovies: (movies: MovieOnly[] | null) => void
  setSelectedGenres: (genres: string[]) => void
  toggleGenre: (genreId: string) => void
  setDateRange: (range: DateRange | undefined) => void
  setMinDate: (date: string) => void
  setMaxDate: (date: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: string) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setIsFilterOpen: (open: boolean) => void
  setSelectedMovie: (movie: MovieOnly | null) => void
  setIsModalOpen: (open: boolean) => void
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void
  setWatchlistIds: (ids: number[] | ((prev: number[]) => number[])) => void
  clearAllFilters: () => void
  resetPagination: () => void
}

export const useUpcomingStore = create<UpcomingState>((set) => ({
  upcomingMovies: null,
  selectedGenres: [],
  dateRange: { from: undefined, to: undefined },
  searchQuery: '',
  sortBy: 'popularity.desc',
  currentPage: 1,
  totalPages: 1,
  isFilterOpen: false,
  selectedMovie: null,
  isModalOpen: false,
  currentSlide: 0,
  watchlistIds: [],
  setUpcomingMovies: (movies) => set({ upcomingMovies: movies }),
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  toggleGenre: (genreId) =>
    set((state) => ({
      selectedGenres: state.selectedGenres.includes(genreId)
        ? state.selectedGenres.filter((id) => id !== genreId)
        : [...state.selectedGenres, genreId],
    })),
  setDateRange: (range) =>
    set({
      dateRange: range,
    }),
  setMinDate: (date) => set({}), // Deprecated but kept for compatibility during refactor
  setMaxDate: (date) => set({}), // Deprecated but kept for compatibility during refactor
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setCurrentSlide: (slide) =>
    set((state) => ({
      currentSlide:
        typeof slide === 'function' ? slide(state.currentSlide) : slide,
    })),
  setWatchlistIds: (ids) =>
    set((state) => ({
      watchlistIds: typeof ids === 'function' ? ids(state.watchlistIds) : ids,
    })),
  clearAllFilters: () =>
    set({
      selectedGenres: [],
      dateRange: { from: undefined, to: undefined },
      searchQuery: '',
      sortBy: 'popularity.desc',
      currentPage: 1,
    }),
  resetPagination: () => set({ currentPage: 1 }),
}))
