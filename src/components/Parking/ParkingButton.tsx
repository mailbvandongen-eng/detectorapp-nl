import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, X, Navigation, Trash2 } from 'lucide-react'
import { useParkingStore } from '../../store/parkingStore'
import { useGPSStore } from '../../store/gpsStore'
import { useMapStore } from '../../store/mapStore'
import { fromLonLat } from 'ol/proj'

export function ParkingButton() {
  const [showMenu, setShowMenu] = useState(false)
  const { parkingLocation, setParkingLocation, clearParkingLocation, showParkingButton } = useParkingStore()
  const gpsPosition = useGPSStore(state => state.position)
  const map = useMapStore(state => state.map)

  if (!showParkingButton) return null

  const handleParkHere = () => {
    if (!gpsPosition) {
      alert('GPS positie niet beschikbaar. Zet GPS aan.')
      return
    }

    setParkingLocation({
      lat: gpsPosition.lat,
      lng: gpsPosition.lng,
      timestamp: new Date().toISOString()
    })

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }

    setShowMenu(false)
  }

  const handleNavigateToCar = () => {
    if (!parkingLocation) return

    // Open in Google Maps for navigation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parkingLocation.lat},${parkingLocation.lng}&travelmode=walking`
    window.open(url, '_blank')
    setShowMenu(false)
  }

  const handleShowOnMap = () => {
    if (!parkingLocation || !map) return

    const view = map.getView()
    view.animate({
      center: fromLonLat([parkingLocation.lng, parkingLocation.lat]),
      zoom: 18,
      duration: 500
    })
    setShowMenu(false)
  }

  const handleClearParking = () => {
    if (confirm('Parkeerlocatie wissen?')) {
      clearParkingLocation()
      setShowMenu(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) return 'Vandaag'

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Gisteren'

    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  }

  return (
    <>
      {/* Parking Button */}
      <motion.button
        className={`
          fixed bottom-[60px] right-2 z-[800]
          w-11 h-11 cursor-pointer border-0 outline-none
          flex items-center justify-center
          rounded-xl backdrop-blur-sm
          transition-all duration-200
          ${parkingLocation
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30'
            : 'bg-white/80 text-gray-600 hover:bg-white/90 shadow-sm'
          }
        `}
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={parkingLocation ? 'Auto geparkeerd' : 'Parkeren'}
      >
        <Car size={20} />
      </motion.button>

      {/* Menu Popup */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[899]"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed bottom-[116px] right-2 z-[900] w-56 bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-amber-500 text-white">
                <div className="flex items-center gap-2">
                  <Car size={18} />
                  <span className="font-medium text-sm">Parkeerhulp</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 rounded hover:bg-amber-400 transition-colors border-0 outline-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-2">
                {parkingLocation ? (
                  <>
                    {/* Current parking info */}
                    <div className="px-3 py-2 mb-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-xs text-amber-700 mb-1">Geparkeerd</div>
                      <div className="text-sm font-medium text-gray-800">
                        {formatDate(parkingLocation.timestamp)} om {formatTime(parkingLocation.timestamp)}
                      </div>
                    </div>

                    {/* Actions for existing parking */}
                    <button
                      onClick={handleShowOnMap}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-0 outline-none"
                    >
                      <Car size={16} className="text-amber-500" />
                      <span>Toon op kaart</span>
                    </button>

                    <button
                      onClick={handleNavigateToCar}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-0 outline-none"
                    >
                      <Navigation size={16} className="text-blue-500" />
                      <span>Navigeer naar auto</span>
                    </button>

                    <hr className="my-2 border-gray-200" />

                    <button
                      onClick={handleParkHere}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-0 outline-none"
                    >
                      <Car size={16} className="text-green-500" />
                      <span>Nieuwe locatie opslaan</span>
                    </button>

                    <button
                      onClick={handleClearParking}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
                    >
                      <Trash2 size={16} />
                      <span>Wissen</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* No parking set */}
                    <div className="px-3 py-3 mb-2 text-center text-gray-500 text-sm">
                      Geen parkeerlocatie opgeslagen
                    </div>

                    <button
                      onClick={handleParkHere}
                      disabled={!gpsPosition}
                      className={`
                        w-full flex items-center justify-center gap-2 px-4 py-3
                        text-sm font-medium rounded-lg transition-colors border-0 outline-none
                        ${gpsPosition
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Car size={18} />
                      <span>Hier geparkeerd</span>
                    </button>

                    {!gpsPosition && (
                      <p className="text-xs text-center text-gray-400 mt-2">
                        Zet GPS aan om te parkeren
                      </p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
