import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { useLayerStore } from '../../store'

interface Props {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  layerNames?: string[]  // Optional: list of layer names in this group for active indicator
}

export function LayerGroup({ title, children, defaultExpanded = true, layerNames }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const visible = useLayerStore(state => state.visible)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)

  // Count active layers in this group
  const activeCount = layerNames?.filter(name => visible[name]).length || 0
  const totalCount = layerNames?.length || 0
  const allActive = totalCount > 0 && activeCount === totalCount
  const someActive = activeCount > 0 && activeCount < totalCount

  // Toggle all layers in this group
  const toggleAllLayers = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!layerNames) return

    const newState = !allActive
    layerNames.forEach(name => {
      setLayerVisibility(name, newState)
    })
  }

  return (
    <div className="mb-0.5">
      <div className="flex items-center gap-1 py-1 px-1 hover:bg-blue-100 transition-colors">
        {/* Group checkbox - toggle all layers */}
        {layerNames && layerNames.length > 0 && (
          <button
            onClick={toggleAllLayers}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              allActive
                ? 'bg-blue-500 border-blue-500'
                : someActive
                  ? 'bg-blue-200 border-blue-400'
                  : 'bg-white border-gray-300'
            }`}
          >
            {(allActive || someActive) && (
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-white">
                <path
                  d="M2 5 L4 7 L8 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-1 bg-transparent border-0 outline-none text-left"
        >
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-gray-400"
          >
            <ChevronRight size={14} />
          </motion.span>
          {expanded ? (
            <FolderOpen size={16} className="text-blue-500" />
          ) : (
            <Folder size={16} className="text-blue-500" />
          )}
          <span className="text-sm text-gray-700 font-medium">{title}</span>
          {/* Active layers indicator - show when collapsed and has active layers */}
          {!expanded && activeCount > 0 && (
            <span className="ml-auto mr-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
            className="ml-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
