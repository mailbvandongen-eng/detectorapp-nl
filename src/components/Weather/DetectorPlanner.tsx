import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, TrendingUp, Clock, Sun, Cloud, CloudRain, CloudSnow,
  Wind, Thermometer, Droplets, ChevronLeft, ChevronRight, Star
} from 'lucide-react'
import {
  useWeatherStore,
  useSettingsStore,
  calculateHourlyScore,
  getScoreLabel,
  getScoreColor,
  weatherCodeDescriptions
} from '../../store'
import type { HourlyForecast, WeatherCode } from '../../store'

interface DetectorPlannerProps {
  isOpen: boolean
  onClose: () => void
}

// Simple weather icon
function WeatherIconSmall({ code, size = 14 }: { code: WeatherCode; size?: number }) {
  if (code === 0) return <Sun size={size} className="text-yellow-500" />
  if (code >= 1 && code <= 3) return <Cloud size={size} className="text-gray-400" />
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={size} className="text-blue-500" />
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow size={size} className="text-cyan-500" />
  return <Cloud size={size} className="text-gray-400" />
}

// Score bar color
function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-lime-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

export function DetectorPlanner({ isOpen, onClose }: DetectorPlannerProps) {
  const weather = useWeatherStore()
  const settings = useSettingsStore()
  const [dayOffset, setDayOffset] = useState(0) // 0 = today, 1 = tomorrow, etc.

  const baseFontSize = 14 * settings.fontScale / 100

  // Calculate scores for all hourly data
  const hourlyScores = useMemo(() => {
    if (!weather.weatherData?.hourly) return []

    return weather.weatherData.hourly.map(hour => {
      const date = new Date(hour.time)
      const { score, reasons } = calculateHourlyScore(
        hour,
        weather.weatherData!.frostDays,
        date
      )
      return { hour, score, reasons, date }
    })
  }, [weather.weatherData])

  // Group by day
  const dayGroups = useMemo(() => {
    const groups: { date: string; label: string; hours: typeof hourlyScores }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    hourlyScores.forEach(item => {
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      const dateStr = itemDate.toISOString().split('T')[0]

      let existing = groups.find(g => g.date === dateStr)
      if (!existing) {
        const diffDays = Math.round((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        let label = ''
        if (diffDays === 0) label = 'Vandaag'
        else if (diffDays === 1) label = 'Morgen'
        else if (diffDays === 2) label = 'Overmorgen'
        else {
          const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
          label = days[itemDate.getDay()] + ' ' + itemDate.getDate() + '/' + (itemDate.getMonth() + 1)
        }

        existing = { date: dateStr, label, hours: [] }
        groups.push(existing)
      }
      existing.hours.push(item)
    })

    return groups
  }, [hourlyScores])

  // Current day data
  const currentDay = dayGroups[dayOffset] || dayGroups[0]

  // Find best time in visible range
  const bestTime = useMemo(() => {
    if (!currentDay?.hours.length) return null
    return currentDay.hours.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    , currentDay.hours[0])
  }, [currentDay])

  // Find best time overall (next 3 days)
  const bestTimeOverall = useMemo(() => {
    const allHours = dayGroups.slice(0, 3).flatMap(d => d.hours)
    if (!allHours.length) return null
    return allHours.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    , allHours[0])
  }, [dayGroups])

  // Check if conditions improve
  const improvement = useMemo(() => {
    if (!hourlyScores.length) return null
    const currentScore = hourlyScores[0]?.score || 0
    const futureScores = hourlyScores.slice(1)

    // Find first significant improvement (20+ points better)
    const improvedHour = futureScores.find(h => h.score >= currentScore + 20)
    if (improvedHour) {
      const diffHours = Math.round((improvedHour.date.getTime() - new Date().getTime()) / (1000 * 60 * 60))
      if (diffHours <= 48) {
        return {
          hour: improvedHour,
          hoursUntil: diffHours,
          scoreDiff: improvedHour.score - currentScore
        }
      }
    }
    return null
  }, [hourlyScores])

  if (!isOpen || !weather.weatherData) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1800] bg-black/50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="font-medium">Detectie Planner</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontSize: `${baseFontSize}px` }}>

            {/* Improvement alert */}
            {improvement && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp size={16} />
                  <span className="font-medium">Betere omstandigheden!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Over {improvement.hoursUntil < 24
                    ? `${improvement.hoursUntil} uur`
                    : `${Math.round(improvement.hoursUntil / 24)} dag${improvement.hoursUntil >= 48 ? 'en' : ''}`
                  } wordt het {getScoreLabel(improvement.hour.score).toLowerCase()} ({improvement.hour.score}%)
                </p>
              </div>
            )}

            {/* Best time highlight */}
            {bestTimeOverall && bestTimeOverall.score >= 40 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Star size={16} />
                  <span className="font-medium">Beste moment (komende 3 dagen)</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-amber-600">
                  <span className="text-sm">
                    {new Date(bestTimeOverall.hour.time).toLocaleDateString('nl-NL', { weekday: 'short' })}
                    {' '}
                    {new Date(bestTimeOverall.hour.time).getHours()}:00
                  </span>
                  <span className={`text-sm font-medium ${getScoreColor(bestTimeOverall.score)}`}>
                    {getScoreLabel(bestTimeOverall.score)} ({bestTimeOverall.score}%)
                  </span>
                  <span className="text-sm">{Math.round(bestTimeOverall.hour.temperature)}°</span>
                </div>
              </div>
            )}

            {/* Day selector */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
                disabled={dayOffset === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-0 outline-none"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium text-gray-700">
                {currentDay?.label || 'Vandaag'}
              </span>
              <button
                onClick={() => setDayOffset(Math.min(dayGroups.length - 1, dayOffset + 1))}
                disabled={dayOffset >= dayGroups.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-0 outline-none"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Timeline graph */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Detectie score per uur</div>

              {/* Graph */}
              <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-1 px-2 pointer-events-none">
                  <div className="border-b border-gray-200/50 text-[8px] text-gray-400">100</div>
                  <div className="border-b border-gray-200/50 text-[8px] text-gray-400">50</div>
                  <div className="text-[8px] text-gray-400">0</div>
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end px-1 pt-2 pb-3">
                  {currentDay?.hours.map((item, i) => {
                    const isBest = bestTime && item.hour.time === bestTime.hour.time
                    return (
                      <div
                        key={item.hour.time}
                        className="flex-1 mx-px flex flex-col items-center justify-end h-full"
                        title={`${new Date(item.hour.time).getHours()}:00 - ${item.score}% ${getScoreLabel(item.score)}\n${item.reasons.join(', ')}`}
                      >
                        <div
                          className={`w-full rounded-t transition-all ${getBarColor(item.score)} ${isBest ? 'ring-2 ring-yellow-400' : ''}`}
                          style={{ height: `${item.score}%` }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Time labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[7px] text-gray-400">
                  {currentDay?.hours.filter((_, i) => i % 4 === 0).map(item => (
                    <span key={item.hour.time}>{new Date(item.hour.time).getHours()}u</span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 text-[9px] text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-green-500" />
                  <span>Uitstekend</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-lime-500" />
                  <span>Goed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-amber-500" />
                  <span>Matig</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-red-500" />
                  <span>Lastig</span>
                </div>
              </div>
            </div>

            {/* Detailed hour list */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Details per uur</div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {currentDay?.hours.map(item => {
                  const isBest = bestTime && item.hour.time === bestTime.hour.time
                  return (
                    <div
                      key={item.hour.time}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        isBest ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      {/* Time */}
                      <div className="w-10 font-medium text-gray-600">
                        {new Date(item.hour.time).getHours()}:00
                      </div>

                      {/* Score bar */}
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getBarColor(item.score)}`}
                          style={{ width: `${Math.max(item.score, 5)}%` }}
                        />
                      </div>

                      {/* Score */}
                      <div className={`w-8 text-right font-medium ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </div>

                      {/* Weather icon */}
                      <WeatherIconSmall code={item.hour.weatherCode} />

                      {/* Temp */}
                      <div className="w-8 text-gray-600">
                        {Math.round(item.hour.temperature)}°
                      </div>

                      {/* Wind */}
                      <div className="w-10 text-gray-400 flex items-center gap-0.5">
                        <Wind size={10} />
                        <span>{Math.round(item.hour.windSpeed)}</span>
                      </div>

                      {/* Rain */}
                      {item.hour.precipitation > 0 && (
                        <div className="text-blue-500 flex items-center gap-0.5">
                          <Droplets size={10} />
                          <span>{item.hour.precipitation.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Best marker */}
                      {isBest && <Star size={12} className="text-yellow-500" />}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
