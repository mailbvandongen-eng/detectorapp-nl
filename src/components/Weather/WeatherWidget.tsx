import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind,
  Droplets, ChevronDown, ChevronUp, RefreshCw,
  Navigation, Flower2, Type
} from 'lucide-react'
import {
  useWeatherStore,
  useSettingsStore,
  useGPSStore,
  weatherCodeDescriptions,
  windDirectionToText
} from '../../store'
import type { WeatherCode, PrecipitationForecast, PollenData } from '../../store'
// RainRadar modal replaced by RainRadarLayer (map overlay)

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

// Precipitation graph (Buienalarm style) - compact version
function PrecipitationGraph({ data }: { data: PrecipitationForecast[] }) {
  if (!data || data.length === 0) return null

  const maxPrecip = Math.max(...data.map(d => d.precipitation), 0.5)
  const hasRain = data.some(d => d.precipitation > 0)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '0.83em' }} className="text-gray-500">Neerslag 2 uur</span>
        {!hasRain && <span style={{ fontSize: '0.83em' }} className="text-green-600 font-medium">Droog</span>}
      </div>

      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end px-0.5">
          {data.map((d, i) => {
            const height = (d.precipitation / maxPrecip) * 100
            const intensity = d.precipitation > 2 ? 'bg-blue-600' :
                             d.precipitation > 0.5 ? 'bg-blue-500' :
                             d.precipitation > 0 ? 'bg-blue-400' : 'bg-transparent'
            return (
              <div key={i} className="flex-1 mx-px">
                <div
                  className={`w-full rounded-t transition-all ${intensity}`}
                  style={{ height: `${Math.max(height, d.precipitation > 0 ? 8 : 0)}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-gray-400" style={{ fontSize: '0.67em' }}>
          <span>Nu</span>
          <span>+1u</span>
          <span>+2u</span>
        </div>
      </div>
    </div>
  )
}

// Pollen indicator
function PollenIndicator({ pollen }: { pollen: PollenData }) {
  const levels = [
    { name: 'Gras', value: pollen.grass },
    { name: 'Berk', value: pollen.birch },
    { name: 'Els', value: pollen.alder },
    { name: 'Bijvoet', value: pollen.mugwort }
  ].filter(p => p.value > 0).sort((a, b) => b.value - a.value)

  if (levels.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-green-600" style={{ fontSize: '0.83em' }}>
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
    <div className={`flex items-center gap-1.5 ${color}`} style={{ fontSize: '0.83em' }}>
      <Flower2 size={12} />
      <span>
        {maxLevel.name}: {maxLevel.value >= 4 ? 'Zeer hoog' : maxLevel.value >= 3 ? 'Hoog' : maxLevel.value >= 2 ? 'Matig' : 'Laag'}
      </span>
    </div>
  )
}

// Hourly mini forecast
function HourlyForecast({ hourly }: { hourly: any[] }) {
  const upcomingHours = hourly.slice(0, 6)
  if (upcomingHours.length === 0) return null

  return (
    <div className="space-y-1">
      <div className="text-gray-500" style={{ fontSize: '0.83em' }}>Komende uren</div>
      <div className="flex gap-1">
        {upcomingHours.map((hour, i) => {
          const time = new Date(hour.time)
          const isNow = i === 0
          return (
            <div
              key={hour.time}
              className={`flex flex-col items-center p-1.5 rounded-lg flex-1 ${
                isNow ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              <span className="text-gray-500" style={{ fontSize: '0.75em' }}>
                {isNow ? 'Nu' : `${time.getHours()}u`}
              </span>
              <WeatherIcon code={hour.weatherCode} size={14} />
              <span className="font-medium" style={{ fontSize: '0.83em' }}>{Math.round(hour.temperature)}°</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function WeatherWidget() {
  const showWeatherButton = useSettingsStore(state => state.showWeatherButton)
  const showFontSliders = useSettingsStore(state => state.showFontSliders)
  const weatherFontScale = useSettingsStore(state => state.weatherFontScale)
  const setWeatherFontScale = useSettingsStore(state => state.setWeatherFontScale)
  const gps = useGPSStore()
  const weather = useWeatherStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const baseFontSize = 12 * weatherFontScale / 100
  const showBuienradar = useWeatherStore(state => state.showBuienradar)
  const setShowBuienradar = useWeatherStore(state => state.setShowBuienradar)

  // Collapse widget when buienradar is opened
  useEffect(() => {
    if (showBuienradar) {
      setIsExpanded(false)
    }
  }, [showBuienradar])

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

  return (
    <>
      {/* Backdrop when expanded - click to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[1099]"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Widget */}
      <motion.div
        className="fixed left-2 z-[1100] bg-white shadow-lg border border-gray-200 select-none rounded-xl"
        style={{ top: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))', width: isExpanded ? '200px' : 'auto', maxWidth: '200px' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        layout
      >
        {weather.isLoading && !current ? (
          <div className="p-3 flex items-center gap-2" style={{ fontSize: `${baseFontSize}px` }}>
            <RefreshCw size={16} className="animate-spin text-blue-500" />
            <span className="text-gray-500" style={{ fontSize: '1.17em' }}>Laden...</span>
          </div>
        ) : current ? (
          <div className="p-2.5" style={{ fontSize: `${baseFontSize}px` }}>
            {/* Collapsed view - always visible as header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full border-0 outline-none bg-transparent p-0"
            >
              <div className="flex items-center gap-3">
                {/* Weather + temp */}
                <div className="flex items-center gap-2">
                  <WeatherIcon code={current.weatherCode} size={24} />
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-gray-800" style={{ fontSize: '1.5em' }}>
                      {Math.round(current.temperature)}°
                    </span>
                  </div>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-1">
                  <Wind size={14} className="text-gray-400" />
                  <span className="text-gray-600" style={{ fontSize: '1.17em' }}>{Math.round(current.windSpeed)}</span>
                  <WindArrow degrees={current.windDirection} size={12} />
                </div>

                {/* Expand */}
                <div className="ml-auto">
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </div>
              {/* Weather description - always visible */}
              <div className="text-gray-500 text-left mt-1" style={{ fontSize: '0.92em' }}>
                {weatherCodeDescriptions[current.weatherCode] || 'Onbekend'}
                <span className="text-gray-400 ml-1">· {Math.round(current.apparentTemperature)}°</span>
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
                    {/* Weather details grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.83em' }}>
                          <Droplets size={12} className="text-blue-500" />
                          <span>Vocht</span>
                        </div>
                        <div className="font-bold text-blue-600" style={{ fontSize: '1.17em' }}>
                          {current.humidity}%
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.83em' }}>
                          <Wind size={12} className="text-gray-500" />
                          <span>Windstoten</span>
                        </div>
                        <div className="font-bold text-gray-600" style={{ fontSize: '1.17em' }}>
                          {Math.round(current.windGusts)} km/u
                        </div>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.83em' }}>
                          <Navigation size={12} className="text-cyan-500" />
                          <span>Wind</span>
                        </div>
                        <div className="font-bold text-cyan-600" style={{ fontSize: '1.17em' }}>
                          {windDirectionToText(current.windDirection)}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-500" style={{ fontSize: '0.83em' }}>
                          <Cloud size={12} className="text-purple-500" />
                          <span>Bewolking</span>
                        </div>
                        <div className="font-bold text-purple-600" style={{ fontSize: '1.17em' }}>
                          {current.cloudCover}%
                        </div>
                      </div>
                    </div>

                    {/* Buienradar button - toggles map overlay */}
                    <button
                      onClick={() => setShowBuienradar(!showBuienradar)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors border-0 cursor-pointer ${
                        showBuienradar
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      <CloudRain size={16} className={showBuienradar ? 'text-white' : 'text-blue-500'} />
                      <span className={`font-medium ${showBuienradar ? 'text-white' : 'text-blue-700'}`} style={{ fontSize: '1.17em' }}>
                        Buienradar
                      </span>
                      <span className={`ml-auto ${showBuienradar ? 'text-blue-100' : 'text-blue-500'}`} style={{ fontSize: '1em' }}>
                        {showBuienradar ? 'Aan' : 'Uit'}
                      </span>
                    </button>

                    {/* Precipitation graph */}
                    {precipitation15min.length > 0 && (
                      <PrecipitationGraph data={precipitation15min} />
                    )}

                    {/* Hourly forecast */}
                    {hourly.length > 0 && (
                      <HourlyForecast hourly={hourly} />
                    )}

                    {/* Pollen info */}
                    {pollen && (
                      <PollenIndicator pollen={pollen} />
                    )}

                    {/* Last updated */}
                    <div className="text-gray-400 text-center pt-1" style={{ fontSize: '0.75em' }}>
                      Bijgewerkt: {new Date(weather.weatherData!.lastUpdated).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Font size slider - only show when showFontSliders is enabled */}
                    {showFontSliders && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                        <Type size={12} className="text-gray-400" />
                        <input
                          type="range"
                          min="80"
                          max="150"
                          step="10"
                          value={weatherFontScale}
                          onChange={(e) => setWeatherFontScale(parseInt(e.target.value))}
                          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-gray-400 w-8" style={{ fontSize: '0.83em' }}>{weatherFontScale}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : weather.error ? (
          <button
            onClick={() => {
              const loc = gps.position || DEFAULT_LOCATION
              weather.fetchWeather(loc.lat, loc.lon)
            }}
            className="p-3 flex flex-col items-start gap-1 border-0 outline-none bg-transparent"
            style={{ fontSize: `${baseFontSize}px` }}
          >
            <div className="flex items-center gap-2">
              <Cloud size={18} className="text-red-400" />
              <span className="text-red-500" style={{ fontSize: '1.17em' }}>Fout</span>
            </div>
            <span className="text-gray-400" style={{ fontSize: '0.9em' }}>Tik om opnieuw te laden</span>
          </button>
        ) : (
          <button
            onClick={() => {
              const loc = gps.position || DEFAULT_LOCATION
              weather.fetchWeather(loc.lat, loc.lon)
            }}
            className="p-3 flex items-center gap-2 border-0 outline-none bg-transparent"
            style={{ fontSize: `${baseFontSize}px` }}
          >
            <Cloud size={18} className="text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: '1.17em' }}>Weer laden</span>
          </button>
        )}
      </motion.div>

      {/* Rain Radar is now a map layer, controlled via App.tsx */}
    </>
  )
}
