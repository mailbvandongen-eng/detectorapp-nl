import { useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

// Google logo SVG component
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24">
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
  )
}

export function CloudSyncIndicator() {
  const { user, loading, signInWithGoogle, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  // Position: top right, LEFT of info button (info is at right-2, w-11)
  // So this should be at right-14 (2 + 11 + 1 gap)

  if (loading) {
    return (
      <div className="fixed top-2 right-14 z-[800]">
        <div className="w-11 h-11 flex items-center justify-center opacity-50">
          <GoogleLogo />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-2 right-14 z-[800]">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-11 h-11 flex items-center justify-center border-0 outline-none bg-transparent transition-opacity hover:opacity-80"
        title={user ? `Ingelogd als ${user.displayName || user.email}` : 'Niet ingelogd - klik om in te loggen'}
      >
        {user ? (
          // Ingelogd: profielfoto of groene user icon
          user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-9 h-9 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          )
        ) : (
          // Uitgelogd: Google logo (kleur, subtiel)
          <div className="opacity-60 hover:opacity-100 transition-opacity">
            <GoogleLogo />
          </div>
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[799]"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu - dropdown naar beneden */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute top-11 right-0 z-[801] bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[200px]"
            >
              {user ? (
                <>
                  {/* User info */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-10 h-10 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {user.displayName || 'Gebruiker'}
                        </div>
                        <div className="text-xs text-green-600">Cloud sync actief</div>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 border-0 outline-none bg-transparent"
                  >
                    <LogOut size={14} />
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  {/* Not logged in info */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-600">Niet ingelogd</div>
                    <div className="text-xs text-gray-400">Data alleen lokaal opgeslagen</div>
                  </div>

                  {/* Login with Google */}
                  <button
                    onClick={() => {
                      signInWithGoogle()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 border-0 outline-none bg-transparent"
                  >
                    <GoogleLogo />
                    <span>Inloggen met Google</span>
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
