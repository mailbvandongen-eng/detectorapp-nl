import { Check, Loader2, AlertCircle } from 'lucide-react'
import { useLayerStore } from '../../store'
import type { LoadingState } from '../../store/layerStore'

interface Props {
  name: string
  type: 'overlay' | 'base'
}

export function LayerItem({ name, type }: Props) {
  const visible = useLayerStore(state => state.visible[name])
  const loadingState = useLayerStore(state => state.loadingState[name]) as LoadingState | undefined
  const toggleLayer = useLayerStore(state => state.toggleLayer)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)

  const isLoading = loadingState === 'loading'
  const hasError = loadingState === 'error'

  const handleChange = (e: React.MouseEvent) => {
    // Stop event propagation to prevent panel close-on-click-outside from triggering
    e.stopPropagation()

    // Disable during loading
    if (isLoading) return

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

  const isChecked = visible ?? false

  return (
    <button
      onClick={handleChange}
      disabled={isLoading}
      className={`w-full flex items-center justify-between py-1 pl-3 pr-2 border-0 outline-none transition-colors text-left ${
        isLoading
          ? 'opacity-70 cursor-wait bg-transparent'
          : isChecked
            ? 'bg-blue-50 hover:bg-blue-100'
            : 'bg-transparent hover:bg-blue-50'
      }`}
      style={{ fontSize: 'inherit' }}
    >
      <span className={hasError ? 'text-red-500' : 'text-gray-600'}>
        {name}
        {hasError && <AlertCircle size={12} className="inline ml-1 text-red-500" />}
      </span>
      <div
        className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-100 flex-shrink-0"
        style={{
          backgroundColor: isLoading ? '#93c5fd' : isChecked ? '#3b82f6' : 'white',
          border: isLoading ? '2px solid #93c5fd' : isChecked ? '2px solid #3b82f6' : '2px solid #60a5fa',
          color: 'white'
        }}
      >
        {isLoading ? (
          <Loader2 size={10} strokeWidth={3} className="animate-spin" />
        ) : isChecked ? (
          <Check size={12} strokeWidth={3} />
        ) : null}
      </div>
    </button>
  )
}
