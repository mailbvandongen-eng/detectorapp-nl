import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => {
      set(state => {
        state.user = user
        state.loading = false
      })
    },

    setLoading: (loading) => {
      set(state => {
        state.loading = loading
      })
    },

    setError: (error) => {
      set(state => {
        state.error = error
      })
    }
  }))
)
