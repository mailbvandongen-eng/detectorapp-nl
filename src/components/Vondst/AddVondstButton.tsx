import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { AddVondstForm } from './AddVondstForm'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'

export function AddVondstButton() {
  const [showForm, setShowForm] = useState(false)
  const { isAuthenticated, loginAnonymous } = useAuth()
  const vondstenLocalOnly = useSettingsStore(state => state.vondstenLocalOnly)
  const showVondstButton = useSettingsStore(state => state.showVondstButton)

  // Don't render if disabled in settings
  if (!showVondstButton) return null

  const handleClick = () => {
    // If using local storage, no auth needed
    if (vondstenLocalOnly) {
      setShowForm(true)
      return
    }

    // If using cloud, require auth
    if (!isAuthenticated) {
      if (confirm('Je moet ingelogd zijn om vondsten in de cloud op te slaan. Anoniem inloggen?')) {
        loginAnonymous()
      }
      return
    }
    setShowForm(true)
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
        {showForm && <AddVondstForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </>
  )
}
