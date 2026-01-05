import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation, Crosshair, Link } from 'lucide-react'
import { CustomSelectWithFreeInput } from '../UI/CustomSelectWithFreeInput'
import { toLonLat } from 'ol/proj'
import { useVondstenStore } from '../../store/vondstenStore'
import { useLocalVondstenStore } from '../../store/localVondstenStore'
import { useAuthStore } from '../../store/authStore'
import { useGPSStore } from '../../store/gpsStore'
import { useMapStore } from '../../store/mapStore'
import { useSettingsStore } from '../../store/settingsStore'

interface Props {
  onClose: () => void
  initialLocation?: { lat: number; lng: number }
}

type LocationSource = 'gps' | 'map-center' | 'map-pick'

export function AddVondstForm({ onClose, initialLocation }: Props) {
  const user = useAuthStore(state => state.user)
  const gpsPosition = useGPSStore(state => state.position)
  const map = useMapStore(state => state.map)
  const addCloudVondst = useVondstenStore(state => state.addVondst)
  const addLocalVondst = useLocalVondstenStore(state => state.addVondst)
  const vondstenLocalOnly = useSettingsStore(state => state.vondstenLocalOnly)

  const [notes, setNotes] = useState('')
  const [objectType, setObjectType] = useState('')
  const [material, setMaterial] = useState('')
  const [period, setPeriod] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [length, setLength] = useState<number | undefined>(undefined)

  // Location state - use initialLocation if provided
  const [locationSource, setLocationSource] = useState<LocationSource>(
    initialLocation ? 'map-pick' : (gpsPosition ? 'gps' : 'map-center')
  )
  const [customLocation, setCustomLocation] = useState<{lat: number, lng: number} | null>(
    initialLocation || null
  )
  const [pickingLocation, setPickingLocation] = useState(false)

  // Get the effective location
  const getEffectiveLocation = () => {
    if (locationSource === 'gps' && gpsPosition) {
      return { lat: gpsPosition.lat, lng: gpsPosition.lng }
    }
    if (locationSource === 'map-pick' && customLocation) {
      return customLocation
    }
    // Fallback: map center
    if (map) {
      const center = map.getView().getCenter()
      if (center) {
        const [lng, lat] = toLonLat(center)
        return { lat, lng }
      }
    }
    return null
  }

  const effectiveLocation = getEffectiveLocation()

  // Handle map click when picking location
  useEffect(() => {
    if (!pickingLocation || !map) return

    const handleMapClick = (evt: any) => {
      const [lng, lat] = toLonLat(evt.coordinate)
      setCustomLocation({ lat, lng })
      setLocationSource('map-pick')
      setPickingLocation(false)
    }

    map.on('click', handleMapClick)
    return () => map.un('click', handleMapClick)
  }, [pickingLocation, map])

  const handlePickLocation = () => {
    setPickingLocation(true)
  }

  const handleUseGPS = () => {
    if (gpsPosition) {
      setLocationSource('gps')
      setCustomLocation(null)
    }
  }

  // Check if objectType is valid (not empty or placeholder)
  const isValidObjectType = objectType && objectType !== '-maak een keuze-'

  // Get clean values (replace placeholder with empty)
  const getCleanValue = (val: string) => (!val || val === '-maak een keuze-') ? '' : val

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const location = getEffectiveLocation()
    if (!location) {
      alert('Geen locatie beschikbaar')
      return
    }

    if (!isValidObjectType) {
      alert('Kies een objecttype')
      return
    }

    // For cloud storage, require user
    if (!vondstenLocalOnly && !user) {
      alert('Log in om vondsten in de cloud op te slaan')
      return
    }

    setSaving(true)
    try {
      if (vondstenLocalOnly) {
        // Save locally (no login needed)
        addLocalVondst({
          location: {
            lat: location.lat,
            lng: location.lng
          },
          notes,
          objectType: getCleanValue(objectType) as any,
          material: getCleanValue(material) as any,
          period: getCleanValue(period) as any,
          photoUrl: photoUrl || undefined,
          weight,
          length
        })
        alert('Vondst lokaal opgeslagen! ✅')
      } else {
        // Save to Firebase (requires login)
        const cleanObjectType = getCleanValue(objectType)
        const cleanMaterial = getCleanValue(material)
        const cleanPeriod = getCleanValue(period)
        await addCloudVondst({
          userId: user!.uid,
          location: {
            lat: location.lat,
            lng: location.lng,
            accuracy: locationSource === 'gps' ? 5 : 50 // Manual location has lower accuracy
          },
          timestamp: new Date().toISOString(),
          photos: [],
          notes,
          objectType: cleanObjectType as any,
          material: cleanMaterial as any,
          period: cleanPeriod as any,
          tags: [cleanPeriod.toLowerCase(), cleanObjectType.toLowerCase()].filter(Boolean),
          private: isPrivate
        })
        alert('Vondst opgeslagen in cloud! ✅')
      }
      onClose()
    } catch (error: any) {
      alert('Fout bij opslaan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // When picking location, show minimal UI so user can see the map
  if (pickingLocation) {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[2000] p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
      >
        <div className="bg-orange-500 text-white rounded-lg shadow-xl p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Crosshair size={24} className="animate-pulse" />
            <div>
              <div className="font-medium">Tik op de kaart</div>
              <div className="text-sm opacity-90">om locatie te kiezen</div>
            </div>
          </div>
          <button
            onClick={() => setPickingLocation(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Annuleren
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nieuwe Vondst</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Location display and buttons */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Locatie</label>
            {/* Show current location */}
            {effectiveLocation && (
              <div className="bg-blue-50 rounded px-3 py-2 mb-2">
                <div className="text-xs text-blue-800 font-mono">
                  {effectiveLocation.lat.toFixed(6)}°N, {effectiveLocation.lng.toFixed(6)}°E
                </div>
                <div className="text-xs text-blue-600 mt-0.5">
                  {locationSource === 'gps' ? '📍 GPS locatie' :
                   locationSource === 'map-pick' ? '🎯 Gekozen op kaart' :
                   '🗺️ Kaart midden'}
                </div>
              </div>
            )}
            {!effectiveLocation && (
              <div className="bg-red-50 rounded px-3 py-2 mb-2">
                <div className="text-xs text-red-600">Geen locatie beschikbaar</div>
              </div>
            )}
            <div className="flex gap-2">
              {gpsPosition && locationSource !== 'gps' && (
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-white text-green-700 rounded hover:bg-blue-50 transition-colors border-0 outline-none"
                >
                  <Navigation size={14} />
                  <span>GPS gebruiken</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePickLocation}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-blue-700 rounded hover:bg-blue-50 transition-colors bg-white outline-none border-0"
              >
                <Crosshair size={14} />
                <span>Kies op kaart</span>
              </button>
            </div>
          </div>

          {/* Object Type */}
          <CustomSelectWithFreeInput
            label="Objecttype"
            value={objectType}
            onChange={setObjectType}
            options={['Munt', 'Aardewerk', 'Gesp', 'Fibula', 'Ring', 'Speld', 'Sieraad', 'Gereedschap', 'Wapen', 'Anders']}
            required
            placeholder="Typ objecttype..."
          />

          {/* Material */}
          <CustomSelectWithFreeInput
            label="Materiaal"
            value={material}
            onChange={setMaterial}
            options={['Brons', 'IJzer', 'Zilver', 'Goud', 'Keramiek', 'Steen', 'Glas', 'Onbekend']}
            placeholder="Typ materiaal..."
          />

          {/* Period */}
          <CustomSelectWithFreeInput
            label="Periode"
            value={period}
            onChange={setPeriod}
            options={['Romeins (12 v.Chr.-450 n.Chr.)', 'IJzertijd', 'Middeleeuws (450-1500)', 'Nieuwetijd (1500-1800)', 'Modern (1800+)', 'Onbekend']}
            placeholder="Typ periode..."
          />

          {/* Weight & Length */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Gewicht (g)</label>
              <input
                type="number"
                value={weight ?? ''}
                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded px-3 py-1.5 bg-white outline-none text-sm text-gray-600 hover:bg-blue-50 transition-colors"
                style={{ border: 'none' }}
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Lengte (mm)</label>
              <input
                type="number"
                value={length ?? ''}
                onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded px-3 py-1.5 bg-white outline-none text-sm text-gray-600 hover:bg-blue-50 transition-colors"
                style={{ border: 'none' }}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Link size={12} className="text-blue-500" />
              Foto link
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full rounded px-3 py-1.5 bg-white outline-none text-sm text-gray-600 hover:bg-blue-50 transition-colors"
              style={{ border: 'none' }}
              placeholder="Bijvoorbeeld https://photos.google.com/..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notities</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded px-3 py-1.5 h-16 bg-white outline-none text-sm text-gray-600 hover:bg-blue-50 transition-colors resize-none"
              style={{ border: 'none' }}
              placeholder="Beschrijving..."
            />
          </div>

          {/* Storage info */}
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-xs text-gray-500">
              {vondstenLocalOnly ? (
                <>💾 Vondsten worden <strong>lokaal</strong> opgeslagen op dit apparaat.</>
              ) : (
                <>☁️ Vondsten worden in de <strong>cloud</strong> opgeslagen (vereist inloggen).</>
              )}
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-1.5 rounded hover:bg-blue-50 transition-colors bg-white outline-none text-sm text-gray-600"
              style={{ border: 'none' }}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving || !effectiveLocation || pickingLocation || !isValidObjectType}
              className="flex-1 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 outline-none text-sm"
              style={{ border: 'none' }}
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
