import { DateRange } from 'react-day-picker'
import { create } from 'zustand'

interface DiscoverState {
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
  selectedGenres: [],
  dateRange: undefined,
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
      dateRange: undefined,
      searchQuery: '',
      sortBy: 'popularity.desc',
    }),
}))
