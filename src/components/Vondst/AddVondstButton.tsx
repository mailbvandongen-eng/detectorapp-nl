import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AddVondstForm } from './AddVondstForm'
import { useAuth } from '../../hooks/useAuth'

export function AddVondstButton() {
  const [showForm, setShowForm] = useState(false)
  const { isAuthenticated, loginAnonymous } = useAuth()

  const handleClick = () => {
    if (!isAuthenticated) {
      if (confirm('Je moet ingelogd zijn om vondsten toe te voegen. Anoniem inloggen?')) {
        loginAnonymous()
      }
      return
    }
    setShowForm(true)
  }

  return (
    <>
      <motion.button
        className="fixed bottom-24 md:bottom-32 right-2.5 z-[1000] w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        title="Vondst toevoegen"
      >
        +
      </motion.button>

      <AnimatePresence>
        {showForm && <AddVondstForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </>
  )
}
