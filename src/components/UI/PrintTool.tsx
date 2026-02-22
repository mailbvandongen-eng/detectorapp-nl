import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, X, Download, FileImage, Loader2 } from 'lucide-react'
import { useMapStore, useSettingsStore } from '../../store'
import { isCommercialMode } from '../../config/buildMode'

type PrintFormat = 'png' | 'jpeg' | 'pdf'

export function PrintTool() {
  const map = useMapStore(state => state.map)
  const showPrintTool = useSettingsStore(state => state.showPrintTool)
  const showMeasureTool = useSettingsStore(state => state.showMeasureTool)
  const showDrawTool = useSettingsStore(state => state.showDrawTool)
  const [isOpen, setIsOpen] = useState(false)

  // Hide in commercial mode
  if (isCommercialMode()) return null
  const [isExporting, setIsExporting] = useState(false)
  const [format, setFormat] = useState<PrintFormat>('png')
  const [includeTitle, setIncludeTitle] = useState(true)
  const [title, setTitle] = useState('Kaart Export')

  const handleExport = async () => {
    if (!map) return

    setIsExporting(true)

    try {
      // Get the map canvas
      const mapTarget = map.getTargetElement()
      if (!mapTarget) throw new Error('Map target not found')

      const canvas = mapTarget.querySelector('canvas')
      if (!canvas) throw new Error('Canvas not found')

      // Create export canvas with title if needed
      const exportCanvas = document.createElement('canvas')
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const titleHeight = includeTitle ? 50 : 0
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height + titleHeight

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

      // Add title if enabled
      if (includeTitle) {
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(title, exportCanvas.width / 2, 35)
      }

      // Draw map
      ctx.drawImage(canvas, 0, titleHeight)

      // Add timestamp
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'right'
      const date = new Date().toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      ctx.fillText(date, exportCanvas.width - 10, exportCanvas.height - 10)

      // Add attribution
      ctx.textAlign = 'left'
      ctx.fillText('DetectorApp.nl', 10, exportCanvas.height - 10)

      // Export based on format
      const filename = `kaart-${new Date().toISOString().split('T')[0]}`

      if (format === 'pdf') {
        // For PDF, we'll use a simple approach with jsPDF-like behavior
        // Create a printable page
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          const imgData = exportCanvas.toDataURL('image/png')
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <style>
                  @media print {
                    body { margin: 0; padding: 0; }
                    img { max-width: 100%; height: auto; }
                  }
                  body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: white;
                  }
                  img { max-width: 100%; max-height: 100vh; }
                </style>
              </head>
              <body>
                <img src="${imgData}" />
                <script>
                  setTimeout(() => {
                    window.print();
                  }, 500);
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
        }
      } else {
        // Download as image
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const quality = format === 'jpeg' ? 0.92 : undefined

        exportCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${filename}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, mimeType, quality)
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Kon de kaart niet exporteren. Probeer het opnieuw.')
    } finally {
      setIsExporting(false)
    }
  }

  // Don't render if hidden
  if (!showPrintTool) return null

  // Calculate position dynamically based on which tools above are visible
  // Base position is 90px (under weather widget), each tool adds 48px (44px button + 4px gap)
  let topPosition = 90
  if (showMeasureTool) topPosition += 48
  if (showDrawTool) topPosition += 48

  return (
    <>
      {/* Print button - left side, dynamic position */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        style={{ top: `${topPosition}px` }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Kaart printen/exporteren"
      >
        <Printer size={20} className="text-indigo-500 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      </motion.button>

      {/* Print modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[1700]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-4 z-[1701] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-sm mx-auto my-auto max-h-[85vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-green-600">
                <span className="font-medium text-white">Kaart Exporteren</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title option */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={includeTitle}
                      onChange={(e) => setIncludeTitle(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Titel toevoegen
                  </label>
                  {includeTitle && (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="Titel..."
                    />
                  )}
                </div>

                {/* Format selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formaat
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <FormatButton
                      format="png"
                      selected={format === 'png'}
                      onClick={() => setFormat('png')}
                      icon={<FileImage size={16} />}
                      label="PNG"
                    />
                    <FormatButton
                      format="jpeg"
                      selected={format === 'jpeg'}
                      onClick={() => setFormat('jpeg')}
                      icon={<FileImage size={16} />}
                      label="JPEG"
                    />
                    <FormatButton
                      format="pdf"
                      selected={format === 'pdf'}
                      onClick={() => setFormat('pdf')}
                      icon={<Printer size={16} />}
                      label="Print"
                    />
                  </div>
                </div>

                {/* Export button */}
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors border-0 outline-none disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Exporteren...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>{format === 'pdf' ? 'Printen' : 'Downloaden'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function FormatButton({
  format,
  selected,
  onClick,
  icon,
  label
}: {
  format: PrintFormat
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-colors border-0 outline-none ${
        selected
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
