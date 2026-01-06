import { useState } from 'react'
import { Trash2, Eye, EyeOff, FileText } from 'lucide-react'
import { useCustomLayerStore, type CustomLayer } from '../../store/customLayerStore'

interface Props {
  layer: CustomLayer
}

export function CustomLayerItem({ layer }: Props) {
  const { toggleVisibility, removeLayer } = useCustomLayerStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const featureCount = layer.features.features.length
  const geometryTypes = [...new Set(layer.features.features.map(f => f.geometry?.type).filter(Boolean))]

  const handleDelete = () => {
    if (showConfirm) {
      removeLayer(layer.id)
    } else {
      setShowConfirm(true)
      // Auto-hide confirm after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <div className="flex items-center justify-between py-1.5 group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Layer info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 truncate">{layer.name}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FileText size={10} />
            <span>{featureCount} {featureCount === 1 ? 'feature' : 'features'}</span>
            {geometryTypes.length > 0 && (
              <>
                <span className="mx-0.5">·</span>
                <span>{geometryTypes.join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Visibility toggle */}
        <button
          onClick={() => toggleVisibility(layer.id)}
          className={`p-1 rounded transition-colors border-0 outline-none ${
            layer.visible
              ? 'text-purple-500 hover:bg-purple-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={layer.visible ? 'Verbergen' : 'Tonen'}
        >
          {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className={`p-1 rounded transition-colors border-0 outline-none ${
            showConfirm
              ? 'text-white bg-red-500 hover:bg-red-600'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
          title={showConfirm ? 'Klik nogmaals om te verwijderen' : 'Verwijderen'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
