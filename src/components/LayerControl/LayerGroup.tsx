import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function LayerGroup({ title, children, defaultExpanded = true }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1 py-1 px-1 bg-transparent border-0 outline-none hover:bg-blue-100 transition-colors text-left"
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
      </button>

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
