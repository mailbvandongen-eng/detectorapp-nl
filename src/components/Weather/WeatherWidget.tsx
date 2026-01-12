import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind,
  Thermometer, Droplets, ChevronDown, ChevronUp, X, RefreshCw,
  Navigation, Snowflake, Flower2, AlertTriangle, Calendar
} from 'lucide-react'
import {
  useWeatherStore,
  useSettingsStore,
  useGPSStore,
  weatherCodeDescriptions,
  windDirectionToText,
  calculateDetectingScore,
  getScoreLabel,
  getScoreColor
} from '../../store'
import type { WeatherCode, PrecipitationForecast, PollenData } from '../../store'
import { DetectorPlanner } from './DetectorPlanner'

// Default location: center of Netherlands
const DEFAULT_LOCATION = { lat: 52.1326, lon: 5.2913 }

// Weather icon based on code
function WeatherIcon({ code, size = 18 }: { code: WeatherCode; size?: number }) {
  if (code === 0) return <Sun size={size} className="text-yellow-500" />
  if (code >= 1 && code <= 3) return <Cloud size={size} className="text-gray-400" />
  if (code === 45 || code === 48) return <CloudFog size={size} className="text-gray-400" />
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={size} className="text-blue-500" />
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow size={size} className="text-cyan-500" />
  if (code >= 95) return <CloudLightning size={size} className="text-purple-500" />
  return <Cloud size={size} className="text-gray-400" />
}

// Wind direction arrow
function WindArrow({ degrees, size = 14 }: { degrees: number; size?: number }) {
  return (
    <div style={{ transform: `rotate(${degrees + 180}deg)` }} className="inline-flex">
      <Navigation size={size} className="text-blue-500" />
    </div>
  )
}

// Precipitation graph (Buienalarm style) - expandable
function PrecipitationGraph({ data, data48h }: { data: PrecipitationForecast[]; data48h: PrecipitationForecast[] }) {
  const [isExtended, setIsExtended] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)

  if (!data || data.length === 0) return null

  // For extended view: sample every 4th point (hourly instead of 15-min)
  const extendedData = data48h ? data48h.filter((_, i) => i % 4 === 0) : []
  const displayData = isExtended ? extendedData : data

  // For extended view with slider: show 12 hours at a time
  const windowSize = isExtended ? 12 : data.length
  const maxSliderPosition = isExtended ? Math.max(0, extendedData.length - windowSize) : 0
  const visibleData = isExtended
    ? extendedData.slice(sliderPosition, sliderPosition + windowSize)
    : data

  const maxPrecip = Math.max(...visibleData.map(d => d.precipitation), 0.5)
  const hasRain = visibleData.some(d => d.precipitation > 0)
  const hasRainAnywhere = (isExtended ? extendedData : data).some(d => d.precipitation > 0)

  // Find next rain time
  const findNextRain = () => {
    const dataToCheck = isExtended ? extendedData : data
    for (const d of dataToCheck) {
      if (d.precipitation > 0.1) {
        const time = new Date(d.time)
        const now = new Date()
        const diffMs = time.getTime() - now.getTime()
        const diffHours = Math.round(diffMs / (1000 * 60 * 60))
        if (diffHours < 1) return 'Nu regen'
        if (diffHours < 24) return `Regen over ${diffHours}u`
        const diffDays = Math.round(diffHours / 24)
        return `Regen over ${diffDays} dag${diffDays > 1 ? 'en' : ''}`
      }
    }
    return null
  }

  // Format time for tooltip
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Format time labels for extended view
  const formatExtendedLabel = (timeStr: string) => {
    const date = new Date(timeStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    if (isToday) return `${date.getHours()}u`
    if (isTomorrow) return `mor ${date.getHours()}u`
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Get time labels for visible window
  const getTimeLabels = () => {
    if (!isExtended) return ['Nu', '+1u', '+2u']

    if (visibleData.length === 0) return []
    const first = new Date(visibleData[0].time)
    const middle = visibleData[Math.floor(visibleData.length / 2)]
    const last = visibleData[visibleData.length - 1]

    return [
      formatExtendedLabel(visibleData[0].time),
      formatExtendedLabel(middle?.time || visibleData[0].time),
      formatExtendedLabel(last?.time || visibleData[0].time)
    ]
  }

  const nextRain = findNextRain()
  const timeLabels = getTimeLabels()

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setIsExtended(!isExtended)
            setSliderPosition(0)
          }}
          className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-500 transition-colors border-0 outline-none bg-transparent p-0"
        >
          <span>Neerslag {isExtended ? '48 uur' : '2 uur'}</span>
          <ChevronDown size={10} className={`transition-transform ${isExtended ? 'rotate-180' : ''}`} />
        </button>
        {!hasRainAnywhere ? (
          <span className="text-[10px] text-green-600 font-medium">Droog</span>
        ) : nextRain ? (
          <span className="text-[10px] text-blue-500 font-medium">{nextRain}</span>
        ) : null}
      </div>

      {/* Graph */}
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {[...Array(isExtended ? 12 : 8)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-200/50" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end px-0.5">
          {visibleData.map((d, i) => {
            const height = (d.precipitation / maxPrecip) * 100
            const intensity = d.precipitation > 2 ? 'bg-blue-600' :
                             d.precipitation > 0.5 ? 'bg-blue-500' :
                             d.precipitation > 0 ? 'bg-blue-400' : 'bg-transparent'
            return (
              <div
                key={i}
                className="flex-1 mx-px"
                title={`${formatTime(d.time)}: ${d.precipitation.toFixed(1)} mm`}
              >
                <div
                  className={`w-full rounded-t transition-all ${intensity}`}
                  style={{ height: `${Math.max(height, d.precipitation > 0 ? 8 : 0)}%` }}
                />
              </div>
            )
          })}
        </div>

        {/* Time labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[8px] text-gray-400">
          {timeLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      {/* Slider for extended view */}
      {isExtended && maxSliderPosition > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400">Nu</span>
          <input
            type="range"
            min={0}
            max={maxSliderPosition}
            value={sliderPosition}
            onChange={(e) => setSliderPosition(parseInt(e.target.value))}
            className="flex-1 h-1 accent-blue-500"
          />
          <span className="text-[9px] text-gray-400">+48u</span>
        </div>
      )}

      {/* Legend - always visible */}
      <div className="flex items-center justify-between text-[9px] text-gray-500">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-blue-400" />
            <span>Licht</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
            <span>Matig</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-blue-600" />
            <span>Zwaar</span>
          </div>
        </div>
        {!hasRainAnywhere && (
          <span className="text-green-600">Geen regen verwacht</span>
        )}
      </div>
    </div>
  )
}

// Pollen indicator
function PollenIndicator({ pollen }: { pollen: PollenData }) {
  // Find the highest pollen level
  const levels = [
    { name: 'Gras', value: pollen.grass },
    { name: 'Berk', value: pollen.birch },
    { name: 'Els', value: pollen.alder },
    { name: 'Bijvoet', value: pollen.mugwort }
  ].filter(p => p.value > 0).sort((a, b) => b.value - a.value)

  if (levels.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-green-600">
        <Flower2 size={12} />
        <span>Lage pollenconcentratie</span>
      </div>
    )
  }

  const maxLevel = levels[0]
  const color = maxLevel.value >= 4 ? 'text-red-500' :
                maxLevel.value >= 3 ? 'text-orange-500' :
                maxLevel.value >= 2 ? 'text-amber-500' : 'text-green-600'

  return (
    <div className={`flex items-center gap-1.5 text-[10px] ${color}`}>
      <Flower2 size={12} />
      <span>
        {maxLevel.name}: {maxLevel.value >= 4 ? 'Zeer hoog' : maxLevel.value >= 3 ? 'Hoog' : maxLevel.value >= 2 ? 'Matig' : 'Laag'}
      </span>
    </div>
  )
}

// Hourly mini forecast
function HourlyForecast({ hourly }: { hourly: any[] }) {
  const upcomingHours = hourly.slice(0, 8)
  if (upcomingHours.length === 0) return null

  return (
    <div className="flex gap-1 overflow-x-auto py-1 -mx-1 px-1">
      {upcomingHours.map((hour, i) => {
        const time = new Date(hour.time)
        const isNow = i === 0
        return (
          <div
            key={hour.time}
            className={`flex flex-col items-center p-1.5 rounded-lg min-w-[40px] ${
              isNow ? 'bg-blue-100' : 'bg-gray-50'
            }`}
          >
            <span className="text-[9px] text-gray-500">
              {isNow ? 'Nu' : `${time.getHours()}:00`}
            </span>
            <WeatherIcon code={hour.weatherCode} size={14} />
            <span className="text-[10px] font-medium">{Math.round(hour.temperature)}°</span>
            {hour.precipitationProbability > 20 && (
              <span className="text-[8px] text-blue-500">{hour.precipitationProbability}%</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function WeatherWidget() {
  const showWeatherButton = useSettingsStore(state => state.showWeatherButton)
  const gps = useGPSStore()
  const weather = useWeatherStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showPlanner, setShowPlanner] = useState(false)

  // Safe top position
  const safeTopStyle = { top: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }

  // Fetch weather on mount and when GPS changes
  useEffect(() => {
    if (!showWeatherButton) return

    const loc = gps.position || DEFAULT_LOCATION
    if (!weather.weatherData || Date.now() - weather.weatherData.lastUpdated > 10 * 60 * 1000) {
      weather.fetchWeather(loc.lat, loc.lon)
    }
  }, [showWeatherButton, gps.position?.lat])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!showWeatherButton) return

    const interval = setInterval(() => {
      const loc = gps.position || DEFAULT_LOCATION
      weather.fetchWeather(loc.lat, loc.lon)
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [showWeatherButton, gps.position?.lat])

  if (!showWeatherButton) return null

  const current = weather.weatherData?.current
  const hourly = weather.weatherData?.hourly || []
  const precipitation15min = weather.weatherData?.precipitation15min || []
  const precipitation48h = weather.weatherData?.precipitation48h || []
  const pollen = weather.weatherData?.pollen

  // Calculate detecting score
  const { score, reasons } = weather.weatherData
    ? calculateDetectingScore(weather.weatherData)
    : { score: 0, reasons: [] }

  return (
    <>
      {/* Backdrop when expanded - click to close */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-[1099]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed left-2 backdrop-blur-sm rounded-xl shadow-sm border transition-all bg-white border-gray-200 ${isExpanded ? 'z-[1100]' : 'z-[700]'}`}
        style={safeTopStyle}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
      {weather.isLoading && !current ? (
        <div className="p-3 flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">Laden...</span>
        </div>
      ) : current ? (
        <div className="p-2.5 min-w-[160px]">
          {/* Collapsed view - compact */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full border-0 outline-none bg-transparent p-0"
          >
            <div className="flex items-center gap-4">
              {/* Weather icon + temp + feels like */}
              <div className="flex items-center gap-2">
                <WeatherIcon code={current.weatherCode} size={24} />
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold text-gray-800">
                    {Math.round(current.temperature)}°
                  </span>
                  <span className="text-[9px] text-gray-400">
                    voelt {Math.round(current.apparentTemperature)}°
                  </span>
                </div>
              </div>

              {/* Wind speed + arrow */}
              <div className="flex items-center gap-1">
                <Wind size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{Math.round(current.windSpeed)}</span>
                <WindArrow degrees={current.windDirection} size={14} />
              </div>

              {/* Expand indicator */}
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Detecting score bar - clickable for planner */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowPlanner(true)
              }}
              className="w-full flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-200/50 border-0 border-t bg-transparent p-0 outline-none hover:opacity-80 transition-opacity"
            >
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Calendar size={10} className="text-gray-400" />
                Detecteren
              </span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    score >= 70 ? 'bg-green-500' :
                    score >= 50 ? 'bg-yellow-500' :
                    score >= 30 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(score, 5)}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </button>
          </button>

          {/* Expanded view */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 mt-2 border-t border-gray-200/50 space-y-3">
                  {/* Weather description */}
                  <div className="text-xs text-gray-600">
                    {weatherCodeDescriptions[current.weatherCode] || 'Onbekend'}
                    <span className="text-gray-400 ml-1">
                      · Voelt als {Math.round(current.apparentTemperature)}°
                    </span>
                  </div>

                  {/* Frost warning */}
                  {weather.weatherData && weather.weatherData.frostDays > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 bg-blue-50 rounded px-2 py-1">
                      <Snowflake size={12} />
                      <span>
                        {weather.weatherData.frostDays} vorstdag{weather.weatherData.frostDays > 1 ? 'en' : ''} - bodem mogelijk bevroren
                      </span>
                    </div>
                  )}

                  {/* Snow warning */}
                  {current.snowDepth && current.snowDepth > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-cyan-600 bg-cyan-50 rounded px-2 py-1">
                      <Snowflake size={12} />
                      <span>Sneeuwlaag: {current.snowDepth} cm</span>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Droplets size={12} className="text-blue-400" />
                      <span>Vocht: {current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Wind size={12} className="text-gray-400" />
                      <span>Stoten: {Math.round(current.windGusts)} km/u</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Navigation size={12} className="text-blue-400" />
                      <span>Wind: {windDirectionToText(current.windDirection)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Cloud size={12} className="text-gray-400" />
                      <span>Bewolking: {current.cloudCover}%</span>
                    </div>
                  </div>

                  {/* Precipitation graph */}
                  {precipitation15min.length > 0 && (
                    <PrecipitationGraph data={precipitation15min} data48h={precipitation48h} />
                  )}

                  {/* Hourly forecast */}
                  {hourly.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/50">
                      <div className="text-[10px] text-gray-500 mb-1">Komende uren</div>
                      <HourlyForecast hourly={hourly} />
                    </div>
                  )}

                  {/* Pollen info - at the bottom */}
                  {pollen && (
                    <PollenIndicator pollen={pollen} />
                  )}

                  {/* Last updated */}
                  <div className="text-[9px] text-gray-400 text-center pt-1">
                    Bijgewerkt: {new Date(weather.weatherData!.lastUpdated).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => {
            const loc = gps.position || DEFAULT_LOCATION
            weather.fetchWeather(loc.lat, loc.lon)
          }}
          className="p-3 flex items-center gap-2 border-0 outline-none bg-transparent"
        >
          <Cloud size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">Weer laden</span>
        </button>
      )}
    </motion.div>

      {/* Detector Planner Modal */}
      <DetectorPlanner
        isOpen={showPlanner}
        onClose={() => setShowPlanner(false)}
      />
    </>
  )
}
