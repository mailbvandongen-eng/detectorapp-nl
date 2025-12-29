import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { AddVondstForm } from './AddVondstForm'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'
import { useUIStore } from '../../store/uiStore'

export function AddVondstButton() {
  const { isAuthenticated, loginAnonymous } = useAuth()
  const vondstenLocalOnly = useSettingsStore(state => state.vondstenLocalOnly)
  const showVondstButton = useSettingsStore(state => state.showVondstButton)
  const vondstFormOpen = useUIStore(state => state.vondstFormOpen)
  const vondstFormLocation = useUIStore(state => state.vondstFormLocation)
  const openVondstForm = useUIStore(state => state.openVondstForm)
  const closeVondstForm = useUIStore(state => state.closeVondstForm)

  // Don't render if disabled in settings
  if (!showVondstButton) return null

  const handleClick = () => {
    // If using local storage, no auth needed
    if (vondstenLocalOnly) {
      openVondstForm()
      return
    }

    // If using cloud, require auth
    if (!isAuthenticated) {
      if (confirm('Je moet ingelogd zijn om vondsten in de cloud op te slaan. Anoniem inloggen?')) {
        loginAnonymous()
      }
      return
    }
    openVondstForm()
  }

  return (
    <>
      {/* Square button, same size as GPS button, positioned to its left */}
      <motion.button
        className="fixed bottom-[35px] md:bottom-[40px] right-[52px] z-[1000] w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        title="Vondst toevoegen"
      >
        <MapPin size={20} strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {vondstFormOpen && (
          <AddVondstForm
            onClose={closeVondstForm}
            initialLocation={vondstFormLocation || undefined}
          />
        )}
      </AnimatePresence>
    </>
  )
}
