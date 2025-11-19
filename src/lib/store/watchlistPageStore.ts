import { WatchlistItem } from '@/types/watchlist'
import { create } from 'zustand'

interface WatchlistPageState {
  // Watchlist data
  watchlistItems: WatchlistItem[]
  setWatchlistItems: (items: WatchlistItem[]) => void
  updateWatchlistItem: (id: number, updates: Partial<WatchlistItem>) => void
  removeWatchlistItem: (id: number) => void
  addWatchlistItem: (item: WatchlistItem) => void

  // Filtering and sorting
  activeFilter: string
  setActiveFilter: (filter: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: string
  setSortBy: (sort: string) => void

  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  currentPage: number
  setCurrentPage: (page: number) => void

  // Dialog state
  selectedItem: WatchlistItem | null
  setSelectedItem: (item: WatchlistItem | null) => void
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  isFilterOpen: boolean
  setIsFilterOpen: (open: boolean) => void
}

export const useWatchlistPageStore = create<WatchlistPageState>((set) => ({
  // Watchlist data
  watchlistItems: [],
  setWatchlistItems: (items) => set({ watchlistItems: items }),
  updateWatchlistItem: (id, updates) =>
    set((state) => ({
      watchlistItems: state.watchlistItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeWatchlistItem: (id) =>
    set((state) => ({
      watchlistItems: state.watchlistItems.filter((item) => item.id !== id),
    })),
  addWatchlistItem: (item) =>
    set((state) => ({
      watchlistItems: [...state.watchlistItems, item],
    })),

  // Filtering and sorting
  activeFilter: 'all',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  sortBy: 'added_date',
  setSortBy: (sort) => set({ sortBy: sort }),

  // UI state
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),

  // Dialog state
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  isDialogOpen: false,
  setIsDialogOpen: (open) => set({ isDialogOpen: open }),
  isFilterOpen: false,
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
}))
