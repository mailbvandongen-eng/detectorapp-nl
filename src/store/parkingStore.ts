import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ParkingLocation {
  lat: number
  lng: number
  timestamp: string
  address?: string
}

interface ParkingState {
  // State
  parkingLocation: ParkingLocation | null
  showParkingButton: boolean

  // Actions
  setParkingLocation: (location: ParkingLocation | null) => void
  clearParkingLocation: () => void
  setShowParkingButton: (show: boolean) => void
}

export const useParkingStore = create<ParkingState>()(
  persist(
    (set) => ({
      parkingLocation: null,
      showParkingButton: true, // Visible by default

      setParkingLocation: (parkingLocation) => set({ parkingLocation }),
      clearParkingLocation: () => set({ parkingLocation: null }),
      setShowParkingButton: (showParkingButton) => set({ showParkingButton })
    }),
    {
      name: 'detectorapp-parking'
    }
  )
)
