import { useState, useRef, useEffect } from 'react'
import { Search, X, Navigation } from 'lucide-react'
import { useMapStore } from '../../store/mapStore'
import { useGPSStore } from '../../store/gpsStore'
import { useNavigationStore } from '../../store/navigationStore'
import { fromLonLat } from 'ol/proj'

interface SearchResult {
  id: string
  weergavenaam: string
  type: string
  centroide_ll?: string // "POINT(lng lat)"
}

export function SearchBox() {
  const map = useMapStore(state => state.map)
  const gpsPosition = useGPSStore(state => state.position)
  const startNavigation = useNavigationStore(state => state.startNavigation)
  const isNavigating = useNavigationStore(state => state.isNavigating)
  const loading = useNavigationStore(state => state.loading)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number>()

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        // PDOK Locatieserver - Nederlandse adressen
        const response = await fetch(
          `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(query)}&rows=7`
        )
        const data = await response.json()

        if (data.response?.docs) {
          setResults(data.response.docs)
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const getCoordinates = async (resultId: string): Promise<{lng: number, lat: number} | null> => {
    try {
      const response = await fetch(
        `https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup?id=${encodeURIComponent(resultId)}`
      )
      const data = await response.json()

      if (data.response?.docs?.[0]?.centroide_ll) {
        const centroid = data.response.docs[0].centroide_ll
        const match = centroid.match(/POINT\(([^ ]+) ([^)]+)\)/)
        if (match) {
          return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
          }
        }
      }
    } catch (error) {
      console.error('Lookup error:', error)
    }
    return null
  }

  const handleSelect = async (result: SearchResult) => {
    if (!map) return

    const coords = await getCoordinates(result.id)
    if (coords) {
      // Zoom to location
      const view = map.getView()
      view.animate({
        center: fromLonLat([coords.lng, coords.lat]),
        zoom: 16,
        duration: 1000
      })
    }

    // Clear and close
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleNavigate = async (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger handleSelect

    if (!gpsPosition) {
      alert('GPS positie niet beschikbaar. Zet GPS aan.')
      return
    }

    const coords = await getCoordinates(result.id)
    if (coords) {
      await startNavigation(
        coords,
        result.weergavenaam,
        { lng: gpsPosition.lng, lat: gpsPosition.lat }
      )
    }

    // Clear and close
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'adres': return '🏠'
      case 'weg': return '🛣️'
      case 'woonplaats': return '🏘️'
      case 'gemeente': return '🏛️'
      case 'provincie': return '🗺️'
      case 'postcode': return '📮'
      default: return '📍'
    }
  }

  return (
    <div className="search-box">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Zoek adres of plaats..."
          className="search-input"
        />
        {query && (
          <button onClick={handleClear} className="search-clear">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li
              key={result.id}
              className="search-result-item"
            >
              <div
                className="search-result-content"
                onClick={() => handleSelect(result)}
              >
                <span className="search-result-icon">
                  {getTypeIcon(result.type)}
                </span>
                <span className="search-result-text">
                  {result.weergavenaam}
                </span>
              </div>
              <button
                className="search-navigate-btn"
                onClick={(e) => handleNavigate(result, e)}
                disabled={loading || !gpsPosition}
                title={gpsPosition ? 'Navigeer hierheen' : 'GPS niet actief'}
              >
                <Navigation size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && searching && (
        <div className="search-loading">Zoeken...</div>
      )}
    </div>
  )
}
