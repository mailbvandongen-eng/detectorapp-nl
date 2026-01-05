import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean

  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    loading: false,  // Don't show spinner on initial load
    error: null,
    initialized: false,

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
    },

    signInWithGoogle: async () => {
      set(state => { state.loading = true; state.error = null })
      try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        // User will be set by onAuthStateChanged
      } catch (error: any) {
        console.error('Google sign-in error:', error)
        set(state => {
          state.error = error.message
          state.loading = false
        })
      }
    },

    logout: async () => {
      set(state => { state.loading = true })
      try {
        await signOut(auth)
        // User will be set to null by onAuthStateChanged
      } catch (error: any) {
        console.error('Logout error:', error)
        set(state => {
          state.error = error.message
          state.loading = false
        })
      }
    },

    initAuth: () => {
      if (get().initialized) return

      set(state => { state.initialized = true })

      onAuthStateChanged(auth, (user) => {
        set(state => {
          state.user = user
          state.loading = false
        })
      })
    }
  }))
)
