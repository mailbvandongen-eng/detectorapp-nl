import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Navigation, Crosshair, Camera, X, Trash2, ChevronDown, Edit3, Route } from 'lucide-react'
import { toLonLat } from 'ol/proj'
import { useGPSStore } from '../../store/gpsStore'
import { useMapStore } from '../../store/mapStore'
import { useUIStore } from '../../store/uiStore'
import { useCustomPointLayerStore, DEFAULT_VONDSTEN_LAYER_ID } from '../../store/customPointLayerStore'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'

interface Props {
  onClose: () => void
  initialLocation?: { lat: number; lng: number }
}

type LocationSource = 'gps' | 'map-center' | 'map-pick'
type SaveTarget = string // layer ID - defaults to DEFAULT_VONDSTEN_LAYER_ID

// Reusable dropdown component matching app style
function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Typ hier...'
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFreeInput, setIsFreeInput] = useState(false)
  const [freeInputValue, setFreeInputValue] = useState('')

  const isCustomValue = value && !options.includes(value)

  const handleFreeInputSelect = () => {
    setIsFreeInput(true)
    setFreeInputValue(isCustomValue ? value : '')
    setIsOpen(false)
  }

  const handleFreeInputSubmit = () => {
    if (freeInputValue.trim()) {
      onChange(freeInputValue.trim())
    }
    setIsFreeInput(false)
  }

  if (isFreeInput) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
        </label>
        <input
          type="text"
          value={freeInputValue}
          onChange={(e) => setFreeInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleFreeInputSubmit() }
            if (e.key === 'Escape') setIsFreeInput(false)
          }}
          onBlur={handleFreeInputSubmit}
          placeholder={placeholder}
          autoFocus
          className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
          style={{ border: 'none', outline: 'none' }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
        style={{ border: 'none', outline: 'none' }}
      >
        <span className={!value ? 'text-gray-400' : ''}>
          {value || 'Selecteer...'}
          {isCustomValue && <Edit3 size={12} className="inline ml-1 text-orange-500" />}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {/* Free input option */}
          <button
            type="button"
            onClick={handleFreeInputSelect}
            className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2"
            style={{ border: 'none', outline: 'none' }}
          >
            <Edit3 size={12} />
            Eigen invoer...
          </button>
          <div className="border-t border-gray-100" />
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => { onChange(option); setIsOpen(false) }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                option === value ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ border: 'none', outline: 'none' }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddVondstForm({ onClose, initialLocation }: Props) {
  const gpsPosition = useGPSStore(state => state.position)
  const map = useMapStore(state => state.map)
  const vondstFormPhoto = useUIStore(state => state.vondstFormPhoto)
  const customLayers = useCustomPointLayerStore(state => state.layers)
  const addPointToLayer = useCustomPointLayerStore(state => state.addPoint)

  // Get active route info for linking
  const routeState = useRouteRecordingStore(state => state.state)
  const routeStartTime = useRouteRecordingStore(state => state.startTime)
  const savedRoutes = useRouteRecordingStore(state => state.savedRoutes)

  // Generate a temporary route name for active recording
  const getActiveRouteName = () => {
    if (routeState === 'idle' || !routeStartTime) return null
    return `Route ${new Date(routeStartTime).toLocaleDateString('nl-NL')} ${new Date(routeStartTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
  }

  // Check if we're currently recording a route
  const isRecordingRoute = routeState === 'recording' || routeState === 'paused'
  const activeRouteName = getActiveRouteName()

  const [notes, setNotes] = useState('')
  const [objectType, setObjectType] = useState('')
  const [material, setMaterial] = useState('')
  const [period, setPeriod] = useState('')
  const [saving, setSaving] = useState(false)
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [length, setLength] = useState<number | undefined>(undefined)
  const [saveTarget, setSaveTarget] = useState<SaveTarget>(DEFAULT_VONDSTEN_LAYER_ID)

  // Photo state - initialize from store
  const [photo, setPhoto] = useState<File | null>(vondstFormPhoto)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Generate photo preview URL
  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo)
      setPhotoPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPhotoPreview(null)
    }
  }, [photo])

  // Location state
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

  const handlePickLocation = () => setPickingLocation(true)

  const handleUseGPS = () => {
    if (gpsPosition) {
      setLocationSource('gps')
      setCustomLocation(null)
    }
  }

  // Handle camera capture
  const handleTakePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) setPhoto(file)
    }
    input.click()
  }

  const handleRemovePhoto = () => setPhoto(null)

  const isValidObjectType = !!objectType

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const location = getEffectiveLocation()
    if (!location) {
      alert('Geen locatie beschikbaar')
      return
    }

    if (!objectType) {
      alert('Vul een naam/type in')
      return
    }

    setSaving(true)
    try {
      // Build notes with extra details for Vondsten layer
      let fullNotes = notes || ''
      if (saveTarget === DEFAULT_VONDSTEN_LAYER_ID) {
        const details: string[] = []
        if (material) details.push(`Materiaal: ${material}`)
        if (period) details.push(`Periode: ${period}`)
        if (weight) details.push(`Gewicht: ${weight}g`)
        if (length) details.push(`Lengte: ${length}mm`)
        if (details.length > 0) {
          fullNotes = details.join(' | ') + (notes ? ` | ${notes}` : '')
        }
      }

      // Save to custom layer with optional route link
      addPointToLayer(saveTarget, {
        coordinates: [location.lng, location.lat],
        name: objectType,
        category: saveTarget === DEFAULT_VONDSTEN_LAYER_ID ? objectType : 'Overig',
        notes: fullNotes || '',
        // Link to active route if recording
        ...(isRecordingRoute && routeStartTime ? {
          routeId: `recording-${routeStartTime}`, // Temporary ID, will be updated when route is saved
          routeName: activeRouteName || undefined
        } : {})
      })

      const layerName = customLayers.find(l => l.id === saveTarget)?.name || 'Vondsten'
      alert(`Toegevoegd aan ${layerName}! ✅`)
      onClose()
    } catch (error: any) {
      alert('Fout bij opslaan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Layer options for save target - all custom layers
  const saveTargetOptions = useMemo(() => {
    return customLayers.map(layer => ({
      id: layer.id,
      name: layer.name,
      color: layer.color
    }))
  }, [customLayers])

  // When picking location, show minimal UI
  if (pickingLocation) {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[2000] p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
      >
        <div className="bg-orange-500 text-white rounded-xl shadow-xl p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Crosshair size={24} className="animate-pulse" />
            <div>
              <div className="font-medium">Tik op de kaart</div>
              <div className="text-sm opacity-90">om locatie te kiezen</div>
            </div>
          </div>
          <button
            onClick={() => setPickingLocation(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border-0 outline-none"
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold">Nieuwe Vondst</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors border-0 outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Photo section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Vondst"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors border-0 outline-none shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="w-full h-32 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-gray-500 border-2 border-dashed border-gray-200"
                  style={{ outline: 'none' }}
                >
                  <Camera size={32} />
                  <span className="text-sm">Maak een foto</span>
                </button>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locatie</label>
              {effectiveLocation && (
                <div className="bg-orange-50 rounded-xl px-4 py-3 mb-2">
                  <div className="text-sm text-orange-800 font-mono">
                    {effectiveLocation.lat.toFixed(6)}°N, {effectiveLocation.lng.toFixed(6)}°E
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {locationSource === 'gps' ? '📍 GPS locatie' :
                     locationSource === 'map-pick' ? '🎯 Gekozen op kaart' :
                     '🗺️ Kaart midden'}
                  </div>
                </div>
              )}
              {!effectiveLocation && (
                <div className="bg-red-50 rounded-xl px-4 py-3 mb-2">
                  <div className="text-sm text-red-600">Geen locatie beschikbaar</div>
                </div>
              )}
              <div className="flex gap-2">
                {gpsPosition && locationSource !== 'gps' && (
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border-0 outline-none"
                  >
                    <Navigation size={16} />
                    GPS
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePickLocation}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border-0 outline-none"
                >
                  <Crosshair size={16} />
                  Kies op kaart
                </button>
              </div>
            </div>

            {/* Save target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opslaan naar</label>
              <div className="flex flex-wrap gap-2">
                {saveTargetOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSaveTarget(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-0 outline-none ${
                      saveTarget === option.id
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Object Type - for Vondsten layer with dropdown */}
            {saveTarget === DEFAULT_VONDSTEN_LAYER_ID && (
              <SelectField
                label="Type vondst"
                value={objectType}
                onChange={setObjectType}
                options={['Munt', 'Aardewerk', 'Gesp', 'Fibula', 'Ring', 'Speld', 'Sieraad', 'Gereedschap', 'Wapen', 'Anders']}
                required
                placeholder="Typ type vondst..."
              />
            )}

            {/* Name field for other layers */}
            {saveTarget !== DEFAULT_VONDSTEN_LAYER_ID && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Naam<span className="text-orange-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  placeholder="Naam van het punt..."
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                  style={{ border: 'none', outline: 'none' }}
                />
              </div>
            )}

            {/* Material & Period - only for Vondsten layer */}
            {saveTarget === DEFAULT_VONDSTEN_LAYER_ID && (
              <>
                <SelectField
                  label="Materiaal"
                  value={material}
                  onChange={setMaterial}
                  options={['Brons', 'IJzer', 'Zilver', 'Goud', 'Koper', 'Lood', 'Tin', 'Keramiek', 'Steen', 'Glas', 'Bot', 'Hout', 'Leer', 'Onbekend']}
                  placeholder="Typ materiaal..."
                />

                <SelectField
                  label="Periode"
                  value={period}
                  onChange={setPeriod}
                  options={['Steentijd', 'Bronstijd', 'IJzertijd', 'Romeins', 'Middeleeuws', 'Nieuwetijd', 'Modern', 'Onbekend']}
                  placeholder="Typ periode..."
                />

                {/* Weight & Length */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gewicht (g)</label>
                    <input
                      type="number"
                      value={weight ?? ''}
                      onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                      style={{ border: 'none', outline: 'none' }}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lengte (mm)</label>
                    <input
                      type="number"
                      value={length ?? ''}
                      onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                      style={{ border: 'none', outline: 'none' }}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notities</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all resize-none h-20"
                style={{ border: 'none', outline: 'none' }}
                placeholder="Beschrijving, context, vindplaats details..."
              />
            </div>

            {/* Storage info */}
            <div className="rounded-xl px-4 py-3 bg-orange-50">
              <p className="text-sm text-orange-700">
                💾 Opgeslagen in "Mijn Lagen" op dit apparaat
              </p>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="p-5 pt-0 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium border-0 outline-none"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving || !effectiveLocation || pickingLocation || !objectType}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border-0 outline-none"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
