import { create } from 'zustand'

interface SearchStore {
  searchQuery: string
  setSearchQuery: (query: string) => void
  toggleMenu: boolean
  setToggleMenu: (value: boolean) => void
  showResults: boolean
  setShowResults: (value: boolean) => void
  isSearchOpen: boolean
  setIsSearchOpen: (value: boolean) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  toggleMenu: false,
  setToggleMenu: (value: boolean) => set({ toggleMenu: value }),
  showResults: false,
  setShowResults: (value: boolean) => set({ showResults: value }),
  isSearchOpen: false,
  setIsSearchOpen: (value: boolean) => set({ isSearchOpen: value }),
}))
