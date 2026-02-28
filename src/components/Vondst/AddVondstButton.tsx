import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { AddVondstForm } from './AddVondstForm'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'
import { useUIStore } from '../../store/uiStore'
import { isCommercialMode } from '../../config/buildMode'

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

  // Commercial: GPS moved to right-2, so Vondst at right-[56px]
  // Personal: right-[152px] to leave room for route button
  const rightPosition = isCommercialMode() ? 'right-[56px]' : 'right-[152px]'

  return (
    <>
      {/* Square button, same size as GPS button, positioned to its left */}
      <motion.button
        className={`fixed bottom-2 ${rightPosition} z-[1000] w-11 h-11 bg-white/90 hover:bg-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none backdrop-blur-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        title="Vondst toevoegen"
      >
        <MapPin size={22} strokeWidth={2} className="text-orange-500" />
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
