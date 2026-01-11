import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind,
  Thermometer, Droplets, ChevronDown, ChevronUp, X, Radio, RefreshCw,
  Navigation, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { useWeatherStore, useSettingsStore, useGPSStore, weatherCodeDescriptions, windDirectionToText } from '../../store'
import type { WeatherCode } from '../../store'

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

// Detecting conditions indicator (weather affects metal detecting)
function DetectingScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 3) return 'text-green-500'
    if (score >= 2) return 'text-lime-500'
    if (score >= 1) return 'text-amber-500'
    return 'text-red-500'
  }

  const getLabel = () => {
    if (score >= 3) return 'Uitstekend'
    if (score >= 2) return 'Goed'
    if (score >= 1) return 'Matig'
    return 'Slecht'
  }

  return (
    <div className={`text-xs font-medium ${getColor()}`}>
      {getLabel()}
    </div>
  )
}

// Calculate detecting score based on weather
function calculateDetectingScore(temp: number, windSpeed: number, precipitation: number, weatherCode: number): number {
  let score = 3

  // Temperature: ideal 10-20°C
  if (temp < 0 || temp > 30) score -= 1
  else if (temp < 5 || temp > 25) score -= 0.5

  // Wind: lower is better
  if (windSpeed > 40) score -= 1.5
  else if (windSpeed > 25) score -= 1
  else if (windSpeed > 15) score -= 0.5

  // Precipitation
  if (precipitation > 2) score -= 1.5
  else if (precipitation > 0.5) score -= 1
  else if (precipitation > 0) score -= 0.5

  // Weather code (rain, snow, thunderstorm)
  if (weatherCode >= 95) score -= 1 // Thunderstorm
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) score -= 0.5 // Rain

  return Math.max(0, Math.min(3, score))
}

// Hourly mini forecast
function HourlyForecast({ hourly }: { hourly: any[] }) {
  const now = new Date()
  const currentHour = now.getHours()

  // Filter to show next 8 hours
  const upcomingHours = hourly.filter(h => {
    const hourTime = new Date(h.time)
    return hourTime >= now
  }).slice(0, 8)

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

// Buienradar Modal
function BuienradarModal({ onClose, position }: { onClose: () => void; position: { lat: number; lon: number } | null }) {
  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <div className="flex items-center gap-2">
            <Radio size={18} />
            <span className="font-medium">Buienradar</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors border-0 outline-none">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Buienradar map */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://gadgets.buienradar.nl/gadget/zoommap/?lat=52.1&lng=5.18&ovession=1&zoom=8&naam=Nederland&size=2&voor=1"
              className="absolute inset-0 w-full h-full border-0"
              title="Buienradar"
              loading="lazy"
            />
          </div>

          {/* Local buienalarm */}
          {position && (
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`https://gadgets.buienradar.nl/gadget/buienradarwijzer/?lat=${position.lat}&lng=${position.lon}&ovession=1&naam=Jouw%20locatie&size=1`}
                className="w-full h-28 border-0"
                title="Buienalarm"
                loading="lazy"
              />
            </div>
          )}

          {/* Link */}
          <a
            href="https://www.buienradar.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            <Radio size={14} />
            Open Buienradar.nl
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function WeatherWidget() {
  const showWeatherButton = useSettingsStore(state => state.showWeatherButton)
  const gps = useGPSStore()
  const weather = useWeatherStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showBuienradar, setShowBuienradar] = useState(false)

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

  // Calculate detecting score
  const detectingScore = current
    ? calculateDetectingScore(
        current.temperature,
        current.windSpeed,
        current.precipitation,
        current.weatherCode
      )
    : 0

  // Background color based on detecting score
  const getBgColor = () => {
    if (!current) return 'bg-white/95 border-gray-200'
    if (detectingScore >= 2.5) return 'bg-green-50/95 border-green-200'
    if (detectingScore >= 1.5) return 'bg-lime-50/95 border-lime-200'
    if (detectingScore >= 0.8) return 'bg-amber-50/95 border-amber-200'
    return 'bg-red-50/95 border-red-200'
  }

  return (
    <>
      <motion.div
        className={`fixed left-2 z-[700] backdrop-blur-sm rounded-xl shadow-sm border transition-all ${getBgColor()}`}
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
          <div className="p-2.5">
            {/* Collapsed view - compact */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full border-0 outline-none bg-transparent p-0"
            >
              <div className="flex items-center gap-3">
                {/* Weather icon + temp */}
                <div className="flex items-center gap-1.5">
                  <WeatherIcon code={current.weatherCode} size={22} />
                  <span className="text-xl font-bold text-gray-800">
                    {Math.round(current.temperature)}°
                  </span>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Wind size={14} />
                  <span>{Math.round(current.windSpeed)}</span>
                  <WindArrow degrees={current.windDirection} size={12} />
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
                <span className="text-[10px] text-gray-500">Detecteren:</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      detectingScore >= 2.5 ? 'bg-green-500' :
                      detectingScore >= 1.5 ? 'bg-lime-500' :
                      detectingScore >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(detectingScore / 3) * 100}%` }}
                  />
                </div>
                <DetectingScore score={detectingScore} />
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
                  <div className="pt-2 mt-2 border-t border-gray-200/50 space-y-2">
                    {/* Weather description */}
                    <div className="text-xs text-gray-600">
                      {weatherCodeDescriptions[current.weatherCode] || 'Onbekend'}
                      <span className="text-gray-400 ml-1">
                        · Voelt als {Math.round(current.apparentTemperature)}°
                      </span>
                    </div>

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

                    {/* Hourly forecast */}
                    {hourly.length > 0 && (
                      <div className="pt-2 border-t border-gray-200/50">
                        <div className="text-[10px] text-gray-500 mb-1">Komende uren</div>
                        <HourlyForecast hourly={hourly} />
                      </div>
                    )}

                    {/* Buienradar button */}
                    <button
                      onClick={() => setShowBuienradar(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-xs border-0 outline-none"
                    >
                      <Radio size={14} />
                      Buienradar
                    </button>

                    {/* Last updated */}
                    <div className="text-[9px] text-gray-400 text-center">
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

      {/* Buienradar Modal */}
      <AnimatePresence>
        {showBuienradar && (
          <BuienradarModal
            onClose={() => setShowBuienradar(false)}
            position={gps.position || DEFAULT_LOCATION}
          />
        )}
      </AnimatePresence>
    </>
  )
}
