import { useState, useCallback } from 'react'

interface HeightResult {
  lat: number
  lon: number
  height: number | null
  unit: string
}

interface HeightQueryState {
  loading: boolean
  error: string | null
  result: HeightResult | null
}

// Worker URL - update this after deploying the worker
const WORKER_URL = import.meta.env.VITE_AHN_WORKER_URL || 'https://ahn-height.your-subdomain.workers.dev'

export function useHeightQuery() {
  const [state, setState] = useState<HeightQueryState>({
    loading: false,
    error: null,
    result: null
  })

  const queryHeight = useCallback(async (lat: number, lon: number) => {
    setState({ loading: true, error: null, result: null })

    try {
      const response = await fetch(`${WORKER_URL}?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json() as HeightResult | { error: string }

      if ('error' in data) {
        setState({ loading: false, error: data.error, result: null })
      } else {
        setState({ loading: false, error: null, result: data })
      }
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        result: null
      })
    }
  }, [])

  const clearResult = useCallback(() => {
    setState({ loading: false, error: null, result: null })
  }, [])

  return {
    ...state,
    queryHeight,
    clearResult
  }
}
