import { useEffect } from 'react'
import { LogIn, LogOut, Cloud, CloudOff, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function GoogleSignInButton() {
  const { user, loading, error, signInWithGoogle, logout, initAuth } = useAuthStore()

  // Initialize auth listener on mount
  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-gray-500">
        <Cloud size={16} className="animate-pulse" />
        <span className="text-sm">Laden...</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="space-y-2">
        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User size={16} className="text-green-600" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-green-800 truncate">
              {user.displayName || user.email}
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <Cloud size={10} />
              Cloud sync actief
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border-0 outline-none text-gray-600"
        >
          <LogOut size={16} />
          <span className="text-sm">Uitloggen</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Not logged in info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-500">
        <CloudOff size={16} />
        <span className="text-sm">Alleen lokale opslag</span>
      </div>

      {/* Google Sign-In button */}
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border-0 outline-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm text-gray-700">Inloggen met Google</span>
      </button>

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
