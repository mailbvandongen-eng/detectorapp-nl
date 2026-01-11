import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Weather condition codes from Open-Meteo
export type WeatherCode =
  | 0    // Clear sky
  | 1 | 2 | 3  // Mainly clear, partly cloudy, overcast
  | 45 | 48    // Fog
  | 51 | 53 | 55  // Drizzle
  | 56 | 57    // Freezing drizzle
  | 61 | 63 | 65  // Rain
  | 66 | 67    // Freezing rain
  | 71 | 73 | 75  // Snow
  | 77         // Snow grains
  | 80 | 81 | 82  // Rain showers
  | 85 | 86    // Snow showers
  | 95 | 96 | 99  // Thunderstorm

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lon: number
  isCurrentLocation?: boolean
}

export interface HourlyForecast {
  time: string
  temperature: number
  precipitation: number
  precipitationProbability: number
  weatherCode: WeatherCode
  windSpeed: number
  windDirection: number
  humidity: number
}

export interface DailyForecast {
  date: string
  temperatureMax: number
  temperatureMin: number
  precipitationSum: number
  precipitationProbability: number
  weatherCode: WeatherCode
  windSpeedMax: number
  sunrise: string
  sunset: string
}

// Precipitation forecast per 15 minutes (for rain graph)
export interface PrecipitationForecast {
  time: string
  precipitation: number  // mm
}

// Pollen data
export interface PollenData {
  grass: number        // 0-5 scale
  birch: number
  alder: number
  mugwort: number
  ragweed: number
  olive: number
}

export interface WeatherData {
  location: SavedLocation
  current: {
    temperature: number
    apparentTemperature: number
    humidity: number
    precipitation: number
    weatherCode: WeatherCode
    windSpeed: number
    windDirection: number
    windGusts: number
    cloudCover: number
    isDay: boolean
    snowDepth?: number
  }
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  // Extra data for detecting conditions
  precipitation15min: PrecipitationForecast[]  // Next 2 hours per 15 min
  precipitation48h: PrecipitationForecast[]    // Next 48 hours per 15 min (extended view)
  frostDays: number  // Number of consecutive frost days (min temp < 0)
  pollen?: PollenData
  lastUpdated: number
}

interface WeatherState {
  // Data
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null

  // Saved locations
  savedLocations: SavedLocation[]
  selectedLocationId: string | null

  // Panel state
  weatherPanelOpen: boolean
  showBuienradar: boolean

  // Actions
  setWeatherData: (data: WeatherData | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  addLocation: (location: Omit<SavedLocation, 'id'>) => void
  removeLocation: (id: string) => void
  setSelectedLocation: (id: string | null) => void
  updateCurrentLocation: (lat: number, lon: number) => void

  toggleWeatherPanel: () => void
  setWeatherPanelOpen: (open: boolean) => void
  setShowBuienradar: (show: boolean) => void

  fetchWeather: (lat: number, lon: number) => Promise<void>
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Weather code descriptions
export const weatherCodeDescriptions: Record<number, string> = {
  0: 'Helder',
  1: 'Overwegend helder',
  2: 'Halfbewolkt',
  3: 'Bewolkt',
  45: 'Mist',
  48: 'Rijp/mist',
  51: 'Lichte motregen',
  53: 'Motregen',
  55: 'Dichte motregen',
  56: 'Lichte ijzel',
  57: 'Ijzel',
  61: 'Lichte regen',
  63: 'Regen',
  65: 'Hevige regen',
  66: 'Lichte ijsregen',
  67: 'IJsregen',
  71: 'Lichte sneeuw',
  73: 'Sneeuw',
  75: 'Hevige sneeuw',
  77: 'Korrelsneeuw',
  80: 'Lichte buien',
  81: 'Buien',
  82: 'Hevige buien',
  85: 'Lichte sneeuwbuien',
  86: 'Sneeuwbuien',
  95: 'Onweer',
  96: 'Onweer met hagel',
  99: 'Zwaar onweer met hagel'
}

// Wind direction to Dutch text
export function windDirectionToText(degrees: number): string {
  const directions = ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Calculate detecting score based on realistic conditions
export function calculateDetectingScore(data: WeatherData): { score: number; reasons: string[] } {
  let score = 100
  const reasons: string[] = []
  const current = data.current
  const month = new Date().getMonth() // 0-11

  // === TEMPERATURE ===
  // T-shirt weather (12-22°C) = perfect
  // 8-12°C or 22-26°C = good
  // 4-8°C or 26-30°C = moderate
  // <4°C or >30°C = poor
  // <0°C = very poor (frozen ground risk)
  if (current.temperature >= 12 && current.temperature <= 22) {
    // Perfect t-shirt weather
  } else if (current.temperature >= 8 && current.temperature < 12) {
    score -= 10
    reasons.push('Beetje fris')
  } else if (current.temperature > 22 && current.temperature <= 26) {
    score -= 10
    reasons.push('Beetje warm')
  } else if (current.temperature >= 4 && current.temperature < 8) {
    score -= 25
    reasons.push('Koud')
  } else if (current.temperature > 26 && current.temperature <= 30) {
    score -= 20
    reasons.push('Warm')
  } else if (current.temperature >= 0 && current.temperature < 4) {
    score -= 40
    reasons.push('Erg koud')
  } else if (current.temperature > 30) {
    score -= 35
    reasons.push('Te warm')
  } else if (current.temperature < 0) {
    score -= 50
    reasons.push('Vorst!')
  }

  // === FROST DAYS (frozen ground) ===
  // After multiple days of frost, the ground is frozen solid
  if (data.frostDays >= 3) {
    score -= 40
    reasons.push(`${data.frostDays} vorstdagen - bodem bevroren`)
  } else if (data.frostDays >= 1) {
    score -= 15
    reasons.push('Recent vorst')
  }

  // === SNOW ===
  if (current.snowDepth && current.snowDepth > 5) {
    score -= 50
    reasons.push('Sneeuw bedekt de grond')
  } else if (current.snowDepth && current.snowDepth > 0) {
    score -= 25
    reasons.push('Lichte sneeuwlaag')
  }

  // === WEATHER CODE (snow, thunderstorm) ===
  if (current.weatherCode >= 71 && current.weatherCode <= 77) {
    score -= 30
    reasons.push('Sneeuwval')
  } else if (current.weatherCode >= 85 && current.weatherCode <= 86) {
    score -= 25
    reasons.push('Sneeuwbuien')
  } else if (current.weatherCode >= 95) {
    score -= 35
    reasons.push('Onweer')
  } else if (current.weatherCode >= 65 || current.weatherCode === 82) {
    score -= 20
    reasons.push('Hevige regen')
  } else if ((current.weatherCode >= 61 && current.weatherCode <= 63) ||
             (current.weatherCode >= 80 && current.weatherCode <= 81)) {
    score -= 10
    reasons.push('Regen')
  } else if (current.weatherCode >= 51 && current.weatherCode <= 57) {
    score -= 5
    reasons.push('Motregen')
  }

  // === CURRENT PRECIPITATION ===
  if (current.precipitation > 2) {
    score -= 15
    reasons.push('Nu neerslag')
  }

  // === WIND ===
  if (current.windSpeed > 50) {
    score -= 25
    reasons.push('Storm')
  } else if (current.windSpeed > 35) {
    score -= 15
    reasons.push('Harde wind')
  } else if (current.windSpeed > 25) {
    score -= 8
    reasons.push('Stevig windje')
  }

  // === SEASON ===
  // Sept/Oct/Nov (8-10) = beste tijd (herfst, akkers geploegd)
  // March/April (2-3) = goed (voorjaar na ploegen)
  // May/June (4-5) = matig (gewassen groeien)
  // July/Aug (6-7) = slecht (gewassen vol)
  // Dec/Jan/Feb (11,0,1) = slecht (winter, vorst)
  if (month >= 8 && month <= 10) {
    // Herfst - beste tijd
    score += 10
    if (reasons.length === 0) reasons.push('Herfst - beste seizoen!')
  } else if (month >= 2 && month <= 3) {
    // Voorjaar
    score += 5
  } else if (month >= 4 && month <= 5) {
    // Late voorjaar - minder akkers
    score -= 10
    reasons.push('Gewassen groeien')
  } else if (month >= 6 && month <= 7) {
    // Zomer - moeilijk
    score -= 20
    reasons.push('Zomer - weinig vrije akkers')
  } else {
    // Winter
    score -= 15
    reasons.push('Winter')
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  return { score, reasons }
}

// Get score label
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Uitstekend'
  if (score >= 60) return 'Goed'
  if (score >= 40) return 'Matig'
  if (score >= 20) return 'Lastig'
  return 'Bijna onmogelijk'
}

// Get score color
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-lime-500'
  if (score >= 40) return 'text-amber-500'
  if (score >= 20) return 'text-orange-500'
  return 'text-red-500'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-lime-50 border-lime-200'
  if (score >= 40) return 'bg-amber-50 border-amber-200'
  if (score >= 20) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      // Initial state
      weatherData: null,
      isLoading: false,
      error: null,
      savedLocations: [
        { id: 'current', name: 'Huidige locatie', lat: 0, lon: 0, isCurrentLocation: true }
      ],
      selectedLocationId: 'current',
      weatherPanelOpen: false,
      showBuienradar: false,

      // Actions
      setWeatherData: (data) => set({ weatherData: data }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      addLocation: (location) => set(state => ({
        savedLocations: [...state.savedLocations, { ...location, id: generateId() }]
      })),

      removeLocation: (id) => set(state => ({
        savedLocations: state.savedLocations.filter(l => l.id !== id),
        selectedLocationId: state.selectedLocationId === id ? 'current' : state.selectedLocationId
      })),

      setSelectedLocation: (id) => set({ selectedLocationId: id }),

      updateCurrentLocation: (lat, lon) => set(state => ({
        savedLocations: state.savedLocations.map(l =>
          l.isCurrentLocation ? { ...l, lat, lon } : l
        )
      })),

      toggleWeatherPanel: () => set(state => ({ weatherPanelOpen: !state.weatherPanelOpen })),
      setWeatherPanelOpen: (open) => set({ weatherPanelOpen: open }),
      setShowBuienradar: (show) => set({ showBuienradar: show }),

      fetchWeather: async (lat, lon) => {
        const { setIsLoading, setError, setWeatherData, savedLocations, selectedLocationId } = get()

        setIsLoading(true)
        setError(null)

        try {
          // Main weather API call with past days for frost calculation
          const url = new URL('https://api.open-meteo.com/v1/forecast')
          url.searchParams.set('latitude', lat.toString())
          url.searchParams.set('longitude', lon.toString())
          url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,is_day,snow_depth')
          url.searchParams.set('hourly', 'temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m')
          url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset')
          url.searchParams.set('minutely_15', 'precipitation')
          url.searchParams.set('timezone', 'Europe/Amsterdam')
          url.searchParams.set('forecast_days', '7')
          url.searchParams.set('past_days', '7')  // Get past 7 days for frost calculation

          const response = await fetch(url.toString())

          if (!response.ok) {
            throw new Error('Kon weerdata niet ophalen')
          }

          const data = await response.json()

          // Calculate frost days (consecutive days with min temp < 0)
          let frostDays = 0
          const dailyMins = data.daily.temperature_2m_min || []
          const today = new Date().toISOString().split('T')[0]
          const todayIndex = data.daily.time.indexOf(today)

          // Count backwards from yesterday
          for (let i = todayIndex - 1; i >= 0; i--) {
            if (dailyMins[i] < 0) {
              frostDays++
            } else {
              break // Stop counting when we hit a non-frost day
            }
          }

          // Find current location info
          const selectedLocation = savedLocations.find(l => l.id === selectedLocationId) || savedLocations[0]

          // Get precipitation data
          const now = new Date()
          const precipitation15min: PrecipitationForecast[] = []
          const precipitation48h: PrecipitationForecast[] = []

          if (data.minutely_15?.time && data.minutely_15?.precipitation) {
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
            const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000)

            for (let i = 0; i < data.minutely_15.time.length; i++) {
              const time = new Date(data.minutely_15.time[i])

              // Skip past times
              if (time < now) continue

              // 2-hour data (15min intervals)
              if (time <= twoHoursLater) {
                precipitation15min.push({
                  time: data.minutely_15.time[i],
                  precipitation: data.minutely_15.precipitation[i]
                })
              }

              // 48-hour data (15min intervals but we'll sample every hour for display)
              if (time <= fortyEightHoursLater) {
                precipitation48h.push({
                  time: data.minutely_15.time[i],
                  precipitation: data.minutely_15.precipitation[i]
                })
              }
            }
          }

          // Filter hourly to current time onwards
          const currentHour = now.getHours()
          const todayStr = now.toISOString().split('T')[0]

          const hourlyFiltered = data.hourly.time
            .map((time: string, i: number) => ({
              time,
              temperature: data.hourly.temperature_2m[i],
              precipitation: data.hourly.precipitation[i],
              precipitationProbability: data.hourly.precipitation_probability[i],
              weatherCode: data.hourly.weather_code[i],
              windSpeed: data.hourly.wind_speed_10m[i],
              windDirection: data.hourly.wind_direction_10m[i],
              humidity: data.hourly.relative_humidity_2m[i]
            }))
            .filter((h: HourlyForecast) => new Date(h.time) >= now)
            .slice(0, 24)

          // Filter daily to today onwards
          const dailyFiltered = data.daily.time
            .map((date: string, i: number) => ({
              date,
              temperatureMax: data.daily.temperature_2m_max[i],
              temperatureMin: data.daily.temperature_2m_min[i],
              precipitationSum: data.daily.precipitation_sum[i],
              precipitationProbability: data.daily.precipitation_probability_max[i],
              weatherCode: data.daily.weather_code[i],
              windSpeedMax: data.daily.wind_speed_10m_max[i],
              sunrise: data.daily.sunrise[i],
              sunset: data.daily.sunset[i]
            }))
            .filter((d: DailyForecast) => d.date >= todayStr)

          // Transform to our format
          const weatherData: WeatherData = {
            location: { ...selectedLocation, lat, lon },
            current: {
              temperature: data.current.temperature_2m,
              apparentTemperature: data.current.apparent_temperature,
              humidity: data.current.relative_humidity_2m,
              precipitation: data.current.precipitation,
              weatherCode: data.current.weather_code,
              windSpeed: data.current.wind_speed_10m,
              windDirection: data.current.wind_direction_10m,
              windGusts: data.current.wind_gusts_10m,
              cloudCover: data.current.cloud_cover,
              isDay: data.current.is_day === 1,
              snowDepth: data.current.snow_depth
            },
            hourly: hourlyFiltered,
            daily: dailyFiltered,
            precipitation15min,
            precipitation48h,
            frostDays,
            lastUpdated: Date.now()
          }

          // Try to fetch pollen data (separate API call, don't fail if it doesn't work)
          try {
            const pollenUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
            pollenUrl.searchParams.set('latitude', lat.toString())
            pollenUrl.searchParams.set('longitude', lon.toString())
            pollenUrl.searchParams.set('current', 'grass_pollen,birch_pollen,alder_pollen,mugwort_pollen,ragweed_pollen,olive_pollen')

            const pollenResponse = await fetch(pollenUrl.toString())
            if (pollenResponse.ok) {
              const pollenData = await pollenResponse.json()
              if (pollenData.current) {
                // Convert to 0-5 scale (rough approximation)
                const toScale = (val: number) => Math.min(5, Math.round(val / 20))
                weatherData.pollen = {
                  grass: toScale(pollenData.current.grass_pollen || 0),
                  birch: toScale(pollenData.current.birch_pollen || 0),
                  alder: toScale(pollenData.current.alder_pollen || 0),
                  mugwort: toScale(pollenData.current.mugwort_pollen || 0),
                  ragweed: toScale(pollenData.current.ragweed_pollen || 0),
                  olive: toScale(pollenData.current.olive_pollen || 0)
                }
              }
            }
          } catch {
            // Pollen data failed, continue without it
          }

          setWeatherData(weatherData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Onbekende fout')
        } finally {
          setIsLoading(false)
        }
      }
    }),
    {
      name: 'detectorapp-weather',
      partialize: (state) => ({
        savedLocations: state.savedLocations,
        selectedLocationId: state.selectedLocationId,
        showBuienradar: state.showBuienradar
      })
    }
  )
)
