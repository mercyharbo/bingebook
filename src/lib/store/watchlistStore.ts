import { WatchlistItem } from '@/app/(index)/watchlist/page'
import { create } from 'zustand'

interface WatchlistState {
  addingToWatchlist: boolean
  setAddingToWatchlist: (adding: boolean) => void
  watchlist: { id: string; title: string; type: 'movie' | 'tv' }[]
  setWatchlist: (
    watchlist: { id: string; title: string; type: 'movie' | 'tv' }[]
  ) => void
  isRemovingFromWatchlist: boolean
  setIsRemovingFromWatchlist: (removing: boolean) => void
  isLoadingWatchlist: boolean
  setIsLoadingWatchlist: (loading: boolean) => void
  watchlistItem: WatchlistItem[] | null
  setWatchlistItem: (items: WatchlistItem[] | null) => void
  isAddingEpisode: boolean
  setIsAddingEpisode: (adding: boolean) => void
  isRemovingEpisode: boolean
  setIsRemovingEpisode: (removing: boolean) => void
  loadingEpisodes: Record<string, boolean> // State to track loading per episode
  setLoadingEpisode: (episodeCode: string, isLoading: boolean) => void
}

export const useWatchlistStore = create<WatchlistState>((set) => {
  return {
    addingToWatchlist: false,
    setAddingToWatchlist: (adding) => set({ addingToWatchlist: adding }),
    watchlist: [],
    setWatchlist: (watchlist) => set({ watchlist }),
    isRemovingFromWatchlist: false,
    setIsRemovingFromWatchlist: (removing) =>
      set({ isRemovingFromWatchlist: removing }),
    isLoadingWatchlist: false,
    setIsLoadingWatchlist: (loading) => set({ isLoadingWatchlist: loading }),
    watchlistItem: null,
    setWatchlistItem: (items) => set({ watchlistItem: items }),
    isAddingEpisode: false,
    setIsAddingEpisode: (adding) => set({ isAddingEpisode: adding }),
    isRemovingEpisode: false,
    setIsRemovingEpisode: (removing) => set({ isRemovingEpisode: removing }),
    loadingEpisodes: {}, // Initialize as empty object
    setLoadingEpisode: (episodeCode, isLoading) =>
      set((state) => ({
        loadingEpisodes: { ...state.loadingEpisodes, [episodeCode]: isLoading },
      })),
  }
})
