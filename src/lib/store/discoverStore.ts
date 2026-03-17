import { DateRange } from 'react-day-picker'
import { create } from 'zustand'
import type { Movie } from '@/types/movie'

interface DiscoverState {
  movieList: Movie[] | null
  setMoviesList: (movies: Movie[] | null) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  setTotalPages: (pages: number) => void
  selectedMovie: Movie | null
  setSelectedMovie: (movie: Movie | null) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  watchlistIds: number[]
  setWatchlistIds: (ids: number[] | ((prev: number[]) => number[])) => void
  currentSlide: number
  setCurrentSlide: (slide: number | ((prev: number) => number)) => void

  selectedGenres: string[]
  dateRange: DateRange | undefined
  searchQuery: string
  sortBy: string
  mediaType: 'movie' | 'tv'
  isFilterOpen: boolean
  setSelectedGenres: (genres: string[]) => void
  toggleGenre: (genreId: string) => void
  setDateRange: (range: DateRange | undefined) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: string) => void
  setMediaType: (type: 'movie' | 'tv') => void
  setIsFilterOpen: (open: boolean) => void
  clearAllFilters: () => void
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  movieList: null,
  setMoviesList: (movies) => set({ movieList: movies }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  totalPages: 1,
  setTotalPages: (pages) => set({ totalPages: pages }),
  selectedMovie: null,
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  watchlistIds: [],
  setWatchlistIds: (ids) =>
    set((state) => ({
      watchlistIds: typeof ids === 'function' ? ids(state.watchlistIds) : ids,
    })),
  currentSlide: 0,
  setCurrentSlide: (slide) =>
    set((state) => ({
      currentSlide:
        typeof slide === 'function' ? slide(state.currentSlide) : slide,
    })),

  selectedGenres: [],
  dateRange: { from: undefined, to: undefined },
  searchQuery: '',
  sortBy: 'popularity.desc',
  mediaType: 'movie',
  isFilterOpen: false,
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  toggleGenre: (genreId) =>
    set((state) => ({
      selectedGenres: state.selectedGenres.includes(genreId)
        ? state.selectedGenres.filter((id) => id !== genreId)
        : [...state.selectedGenres, genreId],
    })),
  setDateRange: (range) => set({ dateRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setMediaType: (type) => set({ mediaType: type, selectedGenres: [] }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  clearAllFilters: () =>
    set({
      selectedGenres: [],
      dateRange: { from: undefined, to: undefined },
      searchQuery: '',
      sortBy: 'popularity.desc',
    }),
}))
