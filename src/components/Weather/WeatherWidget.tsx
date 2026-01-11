import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind,
  Thermometer, Droplets, ChevronDown, ChevronUp, X, RefreshCw,
  Navigation, Snowflake, Flower2, AlertTriangle
} from 'lucide-react'
import {
  useWeatherStore,
  useSettingsStore,
  useGPSStore,
  useLayerStore,
  weatherCodeDescriptions,
  windDirectionToText,
  calculateDetectingScore,
  getScoreLabel,
  getScoreColor,
  getScoreBgColor
} from '../../store'
import { Layers } from 'lucide-react'
import type { WeatherCode, PrecipitationForecast, PollenData } from '../../store'

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

// Wind compass with N/Z/O/W
function WindCompass({ degrees, size = 36 }: { degrees: number; size?: number }) {
  // Wind direction: degrees is where wind comes FROM, arrow shows where it goes TO
  const arrowRotation = degrees + 180

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Compass circle */}
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100" />

      {/* Cardinal directions */}
      <span className="absolute text-[7px] font-bold text-red-500" style={{ top: 1 }}>N</span>
      <span className="absolute text-[7px] font-medium text-gray-500" style={{ bottom: 1 }}>Z</span>
      <span className="absolute text-[7px] font-medium text-gray-500" style={{ right: 2 }}>O</span>
      <span className="absolute text-[7px] font-medium text-gray-500" style={{ left: 2 }}>W</span>

      {/* Wind arrow */}
      <div
        className="absolute transition-transform duration-300"
        style={{ transform: `rotate(${arrowRotation}deg)` }}
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4L12 20M12 4L8 8M12 4L16 8"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// Precipitation graph (Buienalarm style)
function PrecipitationGraph({ data }: { data: PrecipitationForecast[] }) {
  if (!data || data.length === 0) return null

  const maxPrecip = Math.max(...data.map(d => d.precipitation), 0.5)
  const hasRain = data.some(d => d.precipitation > 0)

  // Format time
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">Neerslag komende 2 uur</span>
        {!hasRain && (
          <span className="text-[10px] text-green-600 font-medium">Droog</span>
        )}
      </div>

      {/* Graph */}
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-200/50" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end px-0.5">
          {data.map((d, i) => {
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
          <span>Nu</span>
          <span>+1u</span>
          <span>+2u</span>
        </div>
      </div>

      {/* Legend */}
      {hasRain && (
        <div className="flex items-center gap-2 text-[9px] text-gray-500">
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
      )}
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
  const { activeLayers, toggleLayer } = useLayerStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const windLayerActive = activeLayers.includes('wind')

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
  const pollen = weather.weatherData?.pollen

  // Calculate detecting score
  const { score, reasons } = weather.weatherData
    ? calculateDetectingScore(weather.weatherData)
    : { score: 0, reasons: [] }

  // Background color based on detecting score
  const bgColor = weather.weatherData ? getScoreBgColor(score) : 'bg-white/95 border-gray-200'

  return (
    <motion.div
      className={`fixed left-2 z-[700] backdrop-blur-sm rounded-xl shadow-sm border transition-all ${bgColor}`}
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
            <div className="flex items-center gap-2">
              {/* Weather icon + temp + feels like */}
              <div className="flex items-center gap-1.5">
                <WeatherIcon code={current.weatherCode} size={22} />
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold text-gray-800">
                    {Math.round(current.temperature)}°
                  </span>
                  <span className="text-[9px] text-gray-400">
                    voelt {Math.round(current.apparentTemperature)}°
                  </span>
                </div>
              </div>

              {/* Wind speed + compass + layer button */}
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-medium text-gray-600">{Math.round(current.windSpeed)}</span>
                  <span className="text-[8px] text-gray-400">km/u</span>
                </div>
                <WindCompass degrees={current.windDirection} size={32} />
                {/* Wind layer toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayer('wind')
                  }}
                  className={`p-1 rounded-md border-0 outline-none transition-colors ${
                    windLayerActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title="Windkaart aan/uit"
                >
                  <Layers size={14} />
                </button>
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

            {/* Detecting score bar */}
            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-200/50">
              <span className="text-[10px] text-gray-500">Detecteren</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    score >= 80 ? 'bg-green-500' :
                    score >= 60 ? 'bg-lime-500' :
                    score >= 40 ? 'bg-amber-500' :
                    score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(score, 5)}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
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
                    <PrecipitationGraph data={precipitation15min} />
                  )}

                  {/* Pollen info */}
                  {pollen && (
                    <PollenIndicator pollen={pollen} />
                  )}

                  {/* Hourly forecast */}
                  {hourly.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/50">
                      <div className="text-[10px] text-gray-500 mb-1">Komende uren</div>
                      <HourlyForecast hourly={hourly} />
                    </div>
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
  )
}
