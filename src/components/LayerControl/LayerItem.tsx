import { Check, Loader2, AlertCircle, Lock, Tag } from 'lucide-react'
import { useLayerStore, useSubscriptionStore } from '../../store'
import type { LoadingState } from '../../store/layerStore'
import { layerRegistry } from '../../layers/layerRegistry'

interface Props {
  name: string
  type: 'overlay' | 'base'
  hasOverlay?: boolean  // Show Labels Overlay toggle for this base layer
}

export function LayerItem({ name, type, hasOverlay }: Props) {
  const visible = useLayerStore(state => state.visible[name])
  const labelsVisible = useLayerStore(state => state.visible['Labels Overlay'])
  const loadingState = useLayerStore(state => state.loadingState[name]) as LoadingState | undefined
  const toggleLayer = useLayerStore(state => state.toggleLayer)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const isLayerUnlocked = useSubscriptionStore(state => state.isLayerUnlocked)

  const isLoading = loadingState === 'loading'
  const hasError = loadingState === 'error'

  // Check subscription status for this layer
  const layerDef = layerRegistry[name]
  const tier = layerDef?.tier ?? 'free'
  const regions = layerDef?.regions ?? ['nl']
  const isUnlocked = isLayerUnlocked(name, tier, regions)
  const isLocked = !isUnlocked

  const handleChange = (e: React.MouseEvent) => {
    // Stop event propagation to prevent panel close-on-click-outside from triggering
    e.stopPropagation()

    // Disable during loading or if layer is locked
    if (isLoading || isLocked) return

    if (type === 'overlay') {
      toggleLayer(name)
    } else {
      // For base layers, turn off all other base layers
      const baseLayerNames = ['CartoDB (licht)', 'OpenStreetMap', 'Luchtfoto', 'TMK 1850', 'Bonnebladen 1900']
      baseLayerNames.forEach(layerName => {
        setLayerVisibility(layerName, layerName === name)
      })
    }
  }

  const handleLabelsToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLayerVisibility('Labels Overlay', !labelsVisible)
  }

  const isChecked = visible ?? false

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleChange}
        disabled={isLoading || isLocked}
        className={`flex-1 flex items-center justify-between py-1 pl-3 pr-2 border-0 outline-none transition-colors text-left ${
          isLocked
            ? 'opacity-50 cursor-not-allowed bg-gray-50'
            : isLoading
              ? 'opacity-70 cursor-wait bg-transparent'
              : isChecked
                ? 'bg-blue-50 hover:bg-blue-100'
                : 'bg-transparent hover:bg-blue-50'
        }`}
        style={{ fontSize: 'inherit' }}
        title={isLocked ? 'Premium laag - upgrade om te ontgrendelen' : undefined}
      >
        <span className={`flex items-center gap-1 ${hasError ? 'text-red-500' : isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {name}
          {hasError && <AlertCircle size={12} className="text-red-500" />}
          {isLocked && <Lock size={12} className="text-amber-500" />}
        </span>
        <div
          className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-100 flex-shrink-0"
          style={{
            backgroundColor: isLocked ? '#e5e7eb' : isLoading ? '#93c5fd' : isChecked ? '#3b82f6' : 'white',
            border: isLocked ? '2px solid #d1d5db' : isLoading ? '2px solid #93c5fd' : isChecked ? '2px solid #3b82f6' : '2px solid #60a5fa',
            color: 'white'
          }}
        >
          {isLocked ? (
            <Lock size={10} strokeWidth={3} className="text-gray-400" />
          ) : isLoading ? (
            <Loader2 size={10} strokeWidth={3} className="animate-spin" />
          ) : isChecked ? (
            <Check size={12} strokeWidth={3} />
          ) : null}
        </div>
      </button>

      {/* Labels Overlay toggle - only shown for base layers that support it */}
      {hasOverlay && isChecked && (
        <button
          onClick={handleLabelsToggle}
          className={`p-1 rounded transition-colors border-0 outline-none ${
            labelsVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
          title={labelsVisible ? 'Labels verbergen' : 'Labels tonen'}
        >
          <Tag size={12} />
        </button>
      )}
    </div>
  )
}
