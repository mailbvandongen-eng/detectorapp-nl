import { motion } from 'framer-motion'
import { LocateFixed, Navigation } from 'lucide-react'
import { useGPS } from '../../hooks/useGPS'
import { useGPSStore } from '../../store/gpsStore'
import { isCommercialMode } from '../../config/buildMode'

/**
 * Request iOS DeviceOrientation permission.
 * Must be called from a user gesture (click/tap).
 * On Android/desktop this is a no-op.
 */
async function requestOrientationPermission(): Promise<boolean> {
  const DOE = DeviceOrientationEvent as any
  if (typeof DOE.requestPermission === 'function') {
    try {
      const response = await DOE.requestPermission()
      return response === 'granted'
    } catch {
      return false
    }
  }
  // Android/desktop: no permission needed
  return true
}

/**
 * GPS button with 3-state cycling (Google Maps style):
 * OFF → TRACKING (north-up, centered) → HEADING-UP (map rotates with heading) → OFF
 */
export function GpsButton() {
  const { tracking, start, stop } = useGPS()
  const navigationMode = useGPSStore(state => state.navigationMode)
  const setNavigationMode = useGPSStore(state => state.setNavigationMode)
  const isCommercial = isCommercialMode()

  const isHeadingUp = tracking && navigationMode === 'headingUp'

  const handleClick = async () => {
    if (!tracking) {
      // OFF → TRACKING (north-up)
      // Request iOS compass permission on first GPS activation
      await requestOrientationPermission()
      start()
      setNavigationMode('free')
    } else if (navigationMode === 'free') {
      // TRACKING → HEADING-UP
      setNavigationMode('headingUp')
    } else {
      // HEADING-UP → OFF
      stop()
    }
  }

  // Commercial: LayerControl moved to left, so GPS at right-2
  // Personal: right-[104px] to leave room for vondst button etc
  const rightPosition = isCommercial ? 'right-2' : 'right-[104px]'

  return (
    <motion.button
      className={`
        fixed bottom-2 ${rightPosition} z-[1000]
        w-11 h-11 cursor-pointer border-0 outline-none
        flex items-center justify-center
        rounded-xl backdrop-blur-sm
        transition-all duration-200
        ${isHeadingUp
          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30'
          : tracking
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white/80 text-gray-500 hover:bg-white/90 shadow-sm'
        }
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={tracking ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={tracking ? {
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      } : {}}
      aria-label={
        isHeadingUp
          ? 'Rijmodus actief (kaart draait mee)'
          : tracking
            ? 'GPS actief - klik voor rijmodus'
            : 'GPS starten'
      }
      title={
        isHeadingUp
          ? 'Rijmodus actief - klik om GPS te stoppen'
          : tracking
            ? 'GPS actief - klik voor rijmodus'
            : 'GPS starten'
      }
    >
      {isHeadingUp ? (
        <Navigation size={22} strokeWidth={2} className="drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      ) : (
        <LocateFixed size={22} strokeWidth={2} className="drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      )}
    </motion.button>
  )
}
