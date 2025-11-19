import type { MovieOnly } from '@/types/movie'
import { create } from 'zustand'

interface UpcomingState {
  upcomingMovies: MovieOnly[] | null
  selectedGenres: string[]
  minDate: string
  maxDate: string
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
  setMinDate: (date: string) => void
  setMaxDate: (date: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: string) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setIsFilterOpen: (open: boolean) => void
  setSelectedMovie: (movie: MovieOnly | null) => void
  setIsModalOpen: (open: boolean) => void
  setCurrentSlide: (slide: number) => void
  setWatchlistIds: (ids: number[]) => void
  clearAllFilters: () => void
  resetPagination: () => void
}

export const useUpcomingStore = create<UpcomingState>((set) => ({
  upcomingMovies: null,
  selectedGenres: [],
  minDate: '',
  maxDate: '',
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
  setMinDate: (date) => set({ minDate: date }),
  setMaxDate: (date) => set({ maxDate: date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setCurrentSlide: (slide) => set({ currentSlide: slide }),
  setWatchlistIds: (ids) => set({ watchlistIds: ids }),
  clearAllFilters: () =>
    set({
      selectedGenres: [],
      minDate: '',
      maxDate: '',
      searchQuery: '',
      sortBy: 'popularity.desc',
      currentPage: 1,
    }),
  resetPagination: () => set({ currentPage: 1 }),
}))
