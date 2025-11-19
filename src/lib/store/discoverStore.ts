import { create } from 'zustand'

interface DiscoverState {
  selectedGenres: string[]
  minDate: string
  maxDate: string
  searchQuery: string
  sortBy: string
  mediaType: 'movie' | 'tv'
  isFilterOpen: boolean
  setSelectedGenres: (genres: string[]) => void
  toggleGenre: (genreId: string) => void
  setMinDate: (date: string) => void
  setMaxDate: (date: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: string) => void
  setMediaType: (type: 'movie' | 'tv') => void
  setIsFilterOpen: (open: boolean) => void
  clearAllFilters: () => void
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  selectedGenres: [],
  minDate: '',
  maxDate: '',
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
  setMinDate: (date) => set({ minDate: date }),
  setMaxDate: (date) => set({ maxDate: date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setMediaType: (type) => set({ mediaType: type, selectedGenres: [] }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  clearAllFilters: () =>
    set({
      selectedGenres: [],
      minDate: '',
      maxDate: '',
      searchQuery: '',
      sortBy: 'popularity.desc',
    }),
}))
