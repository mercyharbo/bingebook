import { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
  }
})
