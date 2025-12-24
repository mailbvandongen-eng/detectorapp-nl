import { useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  const loginAnonymous = async () => {
    try {
      await signInAnonymously(auth)
    } catch (error: any) {
      console.error('Login failed:', error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user,
    loginAnonymous,
    logout,
    isAuthenticated: !!user
  }
}
