import { useState } from 'react'
import { motion } from 'framer-motion'
import { useVondstenStore } from '../../store/vondstenStore'
import { useAuthStore } from '../../store/authStore'
import { useGPSStore } from '../../store/gpsStore'
import type { VondstObjectType, VondstMaterial, VondstPeriod } from '../../types/vondst'

interface Props {
  onClose: () => void
}

export function AddVondstForm({ onClose }: Props) {
  const user = useAuthStore(state => state.user)
  const position = useGPSStore(state => state.position)
  const addVondst = useVondstenStore(state => state.addVondst)

  const [notes, setNotes] = useState('')
  const [objectType, setObjectType] = useState<VondstObjectType>('Munt')
  const [material, setMaterial] = useState<VondstMaterial>('Brons')
  const [period, setPeriod] = useState<VondstPeriod>('Romeins (12 v.Chr.-450 n.Chr.)')
  const [depth, setDepth] = useState<number>(20)
  const [isPrivate, setIsPrivate] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !position) return

    setSaving(true)
    try {
      await addVondst({
        userId: user.uid,
        location: {
          lat: position.lat,
          lng: position.lng,
          accuracy: 5
        },
        timestamp: new Date().toISOString(),
        photos: [], // TODO: Photo upload
        notes,
        objectType,
        material,
        period,
        depth,
        tags: [period.toLowerCase(), objectType.toLowerCase()],
        private: isPrivate
      })

      alert('Vondst opgeslagen! ✅')
      onClose()
    } catch (error: any) {
      alert('Fout bij opslaan: ' + error.message)
    } finally {
      setSaving(false)
    }
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
        <div className="sticky top-0 bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nieuwe Vondst</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Locatie (GPS)</label>
            <div className="text-sm text-gray-600">
              {position ? (
                <>
                  Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                </>
              ) : (
                <span className="text-red-600">⚠️ GPS niet actief</span>
              )}
            </div>
          </div>

          {/* Object Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Object type</label>
            <select
              value={objectType}
              onChange={(e) => setObjectType(e.target.value as VondstObjectType)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Munt</option>
              <option>Aardewerk</option>
              <option>Gesp</option>
              <option>Fibula</option>
              <option>Ring</option>
              <option>Speld</option>
              <option>Sieraad</option>
              <option>Gereedschap</option>
              <option>Wapen</option>
              <option>Anders</option>
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium mb-1">Materiaal</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as VondstMaterial)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Brons</option>
              <option>IJzer</option>
              <option>Zilver</option>
              <option>Goud</option>
              <option>Keramiek</option>
              <option>Steen</option>
              <option>Glas</option>
              <option>Onbekend</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium mb-1">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as VondstPeriod)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Romeins (12 v.Chr.-450 n.Chr.)</option>
              <option>IJzertijd</option>
              <option>Middeleeuws (450-1500)</option>
              <option>Nieuwetijd (1500-1800)</option>
              <option>Modern (1800+)</option>
              <option>Onbekend</option>
            </select>
          </div>

          {/* Depth */}
          <div>
            <label className="block text-sm font-medium mb-1">Diepte (cm)</label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min="0"
              max="200"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notities</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Beschrijving, omstandigheden, etc..."
            />
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              id="private"
            />
            <label htmlFor="private" className="text-sm">
              Privé (alleen jij kunt deze vondst zien)
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving || !position}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
