import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, MapPin, Calendar, Ruler, Scale } from 'lucide-react'
import { useLocalVondstenStore } from '../../store/localVondstenStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function VondstenDashboard({ isOpen, onClose }: Props) {
  const vondsten = useLocalVondstenStore(state => state.vondsten)

  // Calculate statistics
  const stats = {
    total: vondsten.length,
    byType: {} as Record<string, number>,
    byMaterial: {} as Record<string, number>,
    byPeriod: {} as Record<string, number>,
    byCondition: {} as Record<string, number>,
    avgDepth: 0,
    totalWeight: 0,
    recent: vondsten.slice(-5).reverse()
  }

  let totalDepth = 0
  let depthCount = 0

  vondsten.forEach(v => {
    // By type
    stats.byType[v.objectType] = (stats.byType[v.objectType] || 0) + 1
    // By material
    stats.byMaterial[v.material] = (stats.byMaterial[v.material] || 0) + 1
    // By period
    stats.byPeriod[v.period] = (stats.byPeriod[v.period] || 0) + 1
    // By condition
    if (v.condition) {
      stats.byCondition[v.condition] = (stats.byCondition[v.condition] || 0) + 1
    }
    // Depth
    if (v.depth) {
      totalDepth += v.depth
      depthCount++
    }
    // Weight
    if (v.weight) {
      stats.totalWeight += v.weight
    }
  })

  stats.avgDepth = depthCount > 0 ? Math.round(totalDepth / depthCount) : 0

  // Sort by count descending
  const sortedByCount = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])

  const maxBarWidth = (obj: Record<string, number>) => {
    const max = Math.max(...Object.values(obj), 1)
    return max
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1600] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-4 z-[1601] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-md mx-auto my-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                <span className="font-medium">Mijn Vondsten Dashboard</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {vondsten.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nog geen vondsten</p>
                  <p className="text-sm mt-1">Voeg je eerste vondst toe via de oranje knop of long-press op de kaart</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <SummaryCard
                      icon={<MapPin size={20} />}
                      value={stats.total}
                      label="Totaal"
                      color="bg-orange-100 text-orange-700"
                    />
                    <SummaryCard
                      icon={<Ruler size={20} />}
                      value={stats.avgDepth > 0 ? `${stats.avgDepth}cm` : '-'}
                      label="Gem. diepte"
                      color="bg-blue-100 text-blue-700"
                    />
                    <SummaryCard
                      icon={<Scale size={20} />}
                      value={stats.totalWeight > 0 ? `${stats.totalWeight.toFixed(1)}g` : '-'}
                      label="Tot. gewicht"
                      color="bg-green-100 text-green-700"
                    />
                  </div>

                  {/* By Type */}
                  <StatSection title="Per Type" data={sortedByCount(stats.byType)} max={maxBarWidth(stats.byType)} color="bg-orange-500" />

                  {/* By Period */}
                  <StatSection title="Per Periode" data={sortedByCount(stats.byPeriod)} max={maxBarWidth(stats.byPeriod)} color="bg-amber-500" />

                  {/* By Material */}
                  <StatSection title="Per Materiaal" data={sortedByCount(stats.byMaterial)} max={maxBarWidth(stats.byMaterial)} color="bg-blue-500" />

                  {/* By Condition */}
                  {Object.keys(stats.byCondition).length > 0 && (
                    <StatSection title="Per Conditie" data={sortedByCount(stats.byCondition)} max={maxBarWidth(stats.byCondition)} color="bg-green-500" />
                  )}

                  {/* Recent finds */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={14} />
                      Recente Vondsten
                    </h3>
                    <div className="space-y-2">
                      {stats.recent.map(v => (
                        <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-sm text-gray-800">{v.objectType}</span>
                            <span className="text-gray-400 mx-1">-</span>
                            <span className="text-sm text-gray-600">{v.material}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(v.timestamp).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Summary card component
function SummaryCard({ icon, value, label, color }: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
}) {
  return (
    <div className={`rounded-lg p-3 ${color}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">
        {icon}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  )
}

// Statistics section with bar chart
function StatSection({ title, data, max, color }: {
  title: string
  data: [string, number][]
  max: number
  color: string
}) {
  if (data.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="space-y-1.5">
        {data.slice(0, 6).map(([label, count]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-24 text-xs text-gray-600 truncate" title={label}>
              {label}
            </div>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="w-6 text-xs text-gray-600 text-right font-medium">{count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
