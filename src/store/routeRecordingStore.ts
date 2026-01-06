import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RecordingState = 'idle' | 'recording' | 'paused'

export interface RoutePoint {
  coordinates: [number, number] // [lon, lat] WGS84
  timestamp: number
  accuracy?: number
}

export interface RoutePhoto {
  id: string
  url: string // Local blob URL or external URL
  caption?: string
  timestamp: string
}

export interface RecordedRoute {
  id: string
  name: string
  points: RoutePoint[]
  startTime: number
  endTime: number
  totalDistance: number // meters
  totalDuration: number // milliseconds (excluding pauses)
  pausedDuration: number // milliseconds spent paused
  createdAt: string
  photos?: RoutePhoto[]
  notes?: string
}

interface RouteRecordingStore {
  // Current recording state
  state: RecordingState
  currentPoints: RoutePoint[]
  startTime: number | null
  pauseStartTime: number | null
  totalPausedTime: number

  // Saved routes
  savedRoutes: RecordedRoute[]

  // Visible routes on map
  visibleRouteIds: Set<string>

  // Heatmap mode
  heatmapEnabled: boolean

  // Grid overlay settings
  gridEnabled: boolean
  gridCenter: [number, number] | null // [lon, lat]
  gridSize: number // meters per cell
  gridCount: number // cells in each direction
  gridColor: string

  // Auto-pause settings
  autoPauseEnabled: boolean
  autoPauseSeconds: number // Seconds of no movement before auto-pause

  // Actions
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: (name?: string) => RecordedRoute | null
  cancelRecording: () => void
  addPoint: (lon: number, lat: number, accuracy?: number) => void

  // Route management
  deleteRoute: (id: string) => void
  renameRoute: (id: string, name: string) => void
  clearAllRoutes: () => void

  // Visibility management
  toggleRouteVisibility: (id: string) => void
  showRoute: (id: string) => void
  hideRoute: (id: string) => void
  showAllRoutes: () => void
  hideAllRoutes: () => void

  // Heatmap toggle
  toggleHeatmap: () => void
  setHeatmapEnabled: (enabled: boolean) => void

  // Grid overlay
  toggleGrid: () => void
  setGridEnabled: (enabled: boolean) => void
  setGridCenter: (center: [number, number] | null) => void
  setGridSize: (size: number) => void
  setGridCount: (count: number) => void
  setGridColor: (color: string) => void
  centerGridOnCurrentLocation: () => void

  // Auto-pause settings
  setAutoPauseEnabled: (enabled: boolean) => void
  setAutoPauseSeconds: (seconds: number) => void

  // Import
  importRouteFromGPX: (gpxString: string, name?: string) => { success: boolean; error?: string; routeId?: string }

  // Route editing
  updateRouteNotes: (id: string, notes: string) => void
  addPhotoToRoute: (routeId: string, photo: Omit<RoutePhoto, 'id' | 'timestamp'>) => void
  removePhotoFromRoute: (routeId: string, photoId: string) => void

  // Computed values (as functions)
  getCurrentDistance: () => number
  getCurrentDuration: () => number
  getAverageSpeed: () => number
}

// Calculate distance between two points using Haversine formula
function haversineDistance(
  lon1: number, lat1: number,
  lon2: number, lat2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate total distance of a route
function calculateTotalDistance(points: RoutePoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].coordinates[0], points[i - 1].coordinates[1],
      points[i].coordinates[0], points[i].coordinates[1]
    )
  }
  return total
}

export const useRouteRecordingStore = create<RouteRecordingStore>()(
  persist(
    (set, get) => ({
      state: 'idle',
      currentPoints: [],
      startTime: null,
      pauseStartTime: null,
      totalPausedTime: 0,
      savedRoutes: [],
      visibleRouteIds: new Set<string>(),
      heatmapEnabled: false,
      gridEnabled: false,
      gridCenter: null,
      gridSize: 20, // 20 meters default
      gridCount: 10, // 10x10 grid default
      gridColor: 'rgba(139, 92, 246, 0.6)', // purple with transparency
      autoPauseEnabled: false,
      autoPauseSeconds: 120, // 2 minutes default

      startRecording: () => {
        set({
          state: 'recording',
          currentPoints: [],
          startTime: Date.now(),
          pauseStartTime: null,
          totalPausedTime: 0
        })
      },

      pauseRecording: () => {
        const { state } = get()
        if (state !== 'recording') return

        set({
          state: 'paused',
          pauseStartTime: Date.now()
        })
      },

      resumeRecording: () => {
        const { state, pauseStartTime, totalPausedTime } = get()
        if (state !== 'paused' || !pauseStartTime) return

        const pauseDuration = Date.now() - pauseStartTime
        set({
          state: 'recording',
          pauseStartTime: null,
          totalPausedTime: totalPausedTime + pauseDuration
        })
      },

      stopRecording: (name?: string) => {
        const { state, currentPoints, startTime, totalPausedTime, pauseStartTime } = get()
        if (state === 'idle' || !startTime || currentPoints.length < 2) {
          // Reset state
          set({
            state: 'idle',
            currentPoints: [],
            startTime: null,
            pauseStartTime: null,
            totalPausedTime: 0
          })
          return null
        }

        const endTime = Date.now()

        // Add any remaining pause time
        let finalPausedTime = totalPausedTime
        if (pauseStartTime) {
          finalPausedTime += endTime - pauseStartTime
        }

        const totalDuration = endTime - startTime - finalPausedTime
        const totalDistance = calculateTotalDistance(currentPoints)

        const route: RecordedRoute = {
          id: crypto.randomUUID(),
          name: name || `Route ${new Date().toLocaleDateString('nl-NL')} ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`,
          points: currentPoints,
          startTime,
          endTime,
          totalDistance,
          totalDuration,
          pausedDuration: finalPausedTime,
          createdAt: new Date().toISOString()
        }

        set(state => ({
          state: 'idle',
          currentPoints: [],
          startTime: null,
          pauseStartTime: null,
          totalPausedTime: 0,
          savedRoutes: [route, ...state.savedRoutes]
        }))

        return route
      },

      cancelRecording: () => {
        set({
          state: 'idle',
          currentPoints: [],
          startTime: null,
          pauseStartTime: null,
          totalPausedTime: 0
        })
      },

      addPoint: (lon, lat, accuracy) => {
        const { state, currentPoints } = get()
        if (state !== 'recording') return

        // Skip if point is too close to last point (< 2 meters) to avoid GPS jitter
        if (currentPoints.length > 0) {
          const lastPoint = currentPoints[currentPoints.length - 1]
          const distance = haversineDistance(
            lastPoint.coordinates[0], lastPoint.coordinates[1],
            lon, lat
          )
          if (distance < 2) return
        }

        const newPoint: RoutePoint = {
          coordinates: [lon, lat],
          timestamp: Date.now(),
          accuracy
        }

        set({
          currentPoints: [...currentPoints, newPoint]
        })
      },

      deleteRoute: (id) => {
        set(state => ({
          savedRoutes: state.savedRoutes.filter(r => r.id !== id)
        }))
      },

      renameRoute: (id, name) => {
        set(state => ({
          savedRoutes: state.savedRoutes.map(r =>
            r.id === id ? { ...r, name } : r
          )
        }))
      },

      clearAllRoutes: () => {
        set({ savedRoutes: [], visibleRouteIds: new Set() })
      },

      // Visibility management
      toggleRouteVisibility: (id) => {
        set(state => {
          const newSet = new Set(state.visibleRouteIds)
          if (newSet.has(id)) {
            newSet.delete(id)
          } else {
            newSet.add(id)
          }
          return { visibleRouteIds: newSet }
        })
      },

      showRoute: (id) => {
        set(state => {
          const newSet = new Set(state.visibleRouteIds)
          newSet.add(id)
          return { visibleRouteIds: newSet }
        })
      },

      hideRoute: (id) => {
        set(state => {
          const newSet = new Set(state.visibleRouteIds)
          newSet.delete(id)
          return { visibleRouteIds: newSet }
        })
      },

      showAllRoutes: () => {
        set(state => ({
          visibleRouteIds: new Set(state.savedRoutes.map(r => r.id))
        }))
      },

      hideAllRoutes: () => {
        set({ visibleRouteIds: new Set() })
      },

      // Heatmap toggle
      toggleHeatmap: () => {
        set(state => ({ heatmapEnabled: !state.heatmapEnabled }))
      },

      setHeatmapEnabled: (enabled) => {
        set({ heatmapEnabled: enabled })
      },

      // Grid overlay
      toggleGrid: () => {
        set(state => ({ gridEnabled: !state.gridEnabled }))
      },

      setGridEnabled: (enabled) => {
        set({ gridEnabled: enabled })
      },

      setGridCenter: (center) => {
        set({ gridCenter: center })
      },

      setGridSize: (size) => {
        set({ gridSize: size })
      },

      setGridCount: (count) => {
        set({ gridCount: count })
      },

      setGridColor: (color) => {
        set({ gridColor: color })
      },

      centerGridOnCurrentLocation: () => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              set({
                gridCenter: [position.coords.longitude, position.coords.latitude],
                gridEnabled: true
              })
            },
            (error) => {
              console.error('Could not get location:', error)
            }
          )
        }
      },

      // Auto-pause settings
      setAutoPauseEnabled: (enabled) => {
        set({ autoPauseEnabled: enabled })
      },

      setAutoPauseSeconds: (seconds) => {
        set({ autoPauseSeconds: seconds })
      },

      importRouteFromGPX: (gpxString, name) => {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(gpxString, 'application/xml')

          // Check for parse errors
          const parseError = doc.querySelector('parsererror')
          if (parseError) {
            return { success: false, error: 'Ongeldig XML formaat' }
          }

          // Find track points
          const trkpts = doc.querySelectorAll('trkpt')
          if (trkpts.length < 2) {
            // Try waypoints if no track
            const wpts = doc.querySelectorAll('wpt')
            if (wpts.length < 2) {
              return { success: false, error: 'Geen route punten gevonden in GPX bestand' }
            }
          }

          // Parse track points or waypoints
          const points: RoutePoint[] = []
          const trackPoints = trkpts.length > 0 ? trkpts : doc.querySelectorAll('wpt')

          trackPoints.forEach((pt) => {
            const lat = parseFloat(pt.getAttribute('lat') || '0')
            const lon = parseFloat(pt.getAttribute('lon') || '0')
            const timeEl = pt.querySelector('time')
            const timestamp = timeEl ? new Date(timeEl.textContent || '').getTime() : Date.now()

            if (!isNaN(lat) && !isNaN(lon)) {
              points.push({
                coordinates: [lon, lat],
                timestamp: isNaN(timestamp) ? Date.now() : timestamp
              })
            }
          })

          if (points.length < 2) {
            return { success: false, error: 'Niet genoeg geldige punten in GPX bestand' }
          }

          // Get route name from GPX or use provided name
          const gpxName = doc.querySelector('trk > name')?.textContent ||
                          doc.querySelector('metadata > name')?.textContent ||
                          name ||
                          `Import ${new Date().toLocaleDateString('nl-NL')}`

          // Calculate stats
          const totalDistance = calculateTotalDistance(points)
          const startTime = points[0].timestamp
          const endTime = points[points.length - 1].timestamp
          const totalDuration = endTime - startTime

          const route: RecordedRoute = {
            id: crypto.randomUUID(),
            name: gpxName,
            points,
            startTime,
            endTime,
            totalDistance,
            totalDuration: totalDuration > 0 ? totalDuration : 0,
            pausedDuration: 0,
            createdAt: new Date().toISOString()
          }

          set(state => ({
            savedRoutes: [route, ...state.savedRoutes]
          }))

          return { success: true, routeId: route.id }
        } catch (e) {
          console.error('GPX import error:', e)
          return { success: false, error: 'Fout bij importeren van GPX bestand' }
        }
      },

      updateRouteNotes: (id, notes) => {
        set(state => ({
          savedRoutes: state.savedRoutes.map(r =>
            r.id === id ? { ...r, notes } : r
          )
        }))
      },

      addPhotoToRoute: (routeId, photo) => {
        const newPhoto: RoutePhoto = {
          ...photo,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }

        set(state => ({
          savedRoutes: state.savedRoutes.map(r =>
            r.id === routeId
              ? { ...r, photos: [...(r.photos || []), newPhoto] }
              : r
          )
        }))
      },

      removePhotoFromRoute: (routeId, photoId) => {
        set(state => ({
          savedRoutes: state.savedRoutes.map(r =>
            r.id === routeId
              ? { ...r, photos: (r.photos || []).filter(p => p.id !== photoId) }
              : r
          )
        }))
      },

      getCurrentDistance: () => {
        const { currentPoints } = get()
        return calculateTotalDistance(currentPoints)
      },

      getCurrentDuration: () => {
        const { state, startTime, totalPausedTime, pauseStartTime } = get()
        if (!startTime) return 0

        const now = Date.now()
        let pausedTime = totalPausedTime

        // If currently paused, add the current pause duration
        if (state === 'paused' && pauseStartTime) {
          pausedTime += now - pauseStartTime
        }

        return now - startTime - pausedTime
      },

      getAverageSpeed: () => {
        const distance = get().getCurrentDistance()
        const duration = get().getCurrentDuration()

        if (duration === 0) return 0

        // Return speed in km/h
        return (distance / 1000) / (duration / 3600000)
      }
    }),
    {
      name: 'detectorapp-route-recording',
      version: 2,
      partialize: (state) => ({
        // Only persist saved routes and settings, not current recording state
        savedRoutes: state.savedRoutes,
        visibleRouteIds: Array.from(state.visibleRouteIds), // Convert Set to Array for JSON
        heatmapEnabled: state.heatmapEnabled,
        gridEnabled: state.gridEnabled,
        gridCenter: state.gridCenter,
        gridSize: state.gridSize,
        gridCount: state.gridCount,
        gridColor: state.gridColor,
        autoPauseEnabled: state.autoPauseEnabled,
        autoPauseSeconds: state.autoPauseSeconds
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        // Convert Array back to Set
        visibleRouteIds: new Set(persisted?.visibleRouteIds || [])
      })
    }
  )
)

// GPX Export function
export function exportRouteAsGPX(route: RecordedRoute): void {
  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="DetectorApp NL"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${route.name}</name>
    <time>${new Date(route.startTime).toISOString()}</time>
  </metadata>
  <trk>
    <name>${route.name}</name>
    <trkseg>
${route.points.map(p => `      <trkpt lat="${p.coordinates[1]}" lon="${p.coordinates[0]}">
        <time>${new Date(p.timestamp).toISOString()}</time>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${route.name.replace(/[^a-zA-Z0-9]/g, '-')}.gpx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
