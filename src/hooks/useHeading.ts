import { useEffect, useRef, useCallback } from 'react'
import { useGPSStore } from '../store/gpsStore'

/**
 * Circular buffer for heading smoothing
 * Uses weighted moving average for smooth, responsive heading
 */
class HeadingBuffer {
  private buffer: number[] = []
  private readonly size: number
  private readonly weights: number[]

  constructor(size = 8) {
    this.size = size
    // Exponential weights: newer samples have more weight
    // [0.5, 1, 2, 4, 8, 16, 32, 64] normalized
    this.weights = Array.from({ length: size }, (_, i) => Math.pow(2, i))
    const sum = this.weights.reduce((a, b) => a + b, 0)
    this.weights = this.weights.map(w => w / sum)
  }

  add(heading: number): void {
    // Handle wrap-around when adding to buffer
    if (this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1]
      let diff = heading - last
      if (diff > 180) heading -= 360
      if (diff < -180) heading += 360
    }

    this.buffer.push(heading)
    if (this.buffer.length > this.size) {
      this.buffer.shift()
    }
  }

  getSmoothed(): number | null {
    if (this.buffer.length === 0) return null
    if (this.buffer.length === 1) return this.normalizeHeading(this.buffer[0])

    // Weighted average
    let sum = 0
    let weightSum = 0
    const startIdx = this.size - this.buffer.length

    for (let i = 0; i < this.buffer.length; i++) {
      const weight = this.weights[startIdx + i]
      sum += this.buffer[i] * weight
      weightSum += weight
    }

    return this.normalizeHeading(sum / weightSum)
  }

  private normalizeHeading(h: number): number {
    return ((h % 360) + 360) % 360
  }

  clear(): void {
    this.buffer = []
  }
}

/**
 * Unified heading hook with smooth filtering
 * - Uses circular buffer with weighted moving average
 * - Handles GPS vs compass source switching
 * - Provides rate-limited, jitter-free heading
 */
export function useHeading() {
  const tracking = useGPSStore(state => state.tracking)
  const headingSource = useGPSStore(state => state.headingSource)
  const speed = useGPSStore(state => state.speed)
  const setSmoothedHeading = useGPSStore(state => state.setSmoothedHeading)

  const gpsBufferRef = useRef(new HeadingBuffer(6))
  const compassBufferRef = useRef(new HeadingBuffer(10))
  const lastUpdateRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Rate limiting: max 30 updates per second
  const MIN_UPDATE_INTERVAL = 33 // ~30fps

  const processHeading = useCallback((rawHeading: number, source: 'gps' | 'compass') => {
    const now = performance.now()
    if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) return

    const buffer = source === 'gps' ? gpsBufferRef.current : compassBufferRef.current
    buffer.add(rawHeading)

    const smoothed = buffer.getSmoothed()
    if (smoothed !== null) {
      lastUpdateRef.current = now
      setSmoothedHeading(smoothed)
    }
  }, [setSmoothedHeading])

  // GPS heading handler
  useEffect(() => {
    if (!tracking) return

    const handlePosition = (pos: GeolocationPosition) => {
      // Only use GPS heading when moving fast enough
      const SPEED_THRESHOLD = 0.8 // m/s (~3 km/h)
      if (
        pos.coords.heading !== null &&
        pos.coords.speed !== null &&
        pos.coords.speed > SPEED_THRESHOLD &&
        pos.coords.accuracy < 20 // Good GPS accuracy
      ) {
        processHeading(pos.coords.heading, 'gps')
      }
    }

    const id = navigator.geolocation.watchPosition(handlePosition, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 500,
      timeout: 10000
    })

    return () => navigator.geolocation.clearWatch(id)
  }, [tracking, processHeading])

  // Compass heading handler
  useEffect(() => {
    if (!tracking || headingSource !== 'compass') return

    let lastCompassUpdate = 0
    const COMPASS_THROTTLE = 50 // 20Hz max

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = performance.now()
      if (now - lastCompassUpdate < COMPASS_THROTTLE) return
      lastCompassUpdate = now

      if (event.alpha !== null) {
        // Convert alpha to compass heading
        const heading = (360 - event.alpha) % 360
        processHeading(heading, 'compass')
      }
    }

    const handleWebkitOrientation = (event: any) => {
      const now = performance.now()
      if (now - lastCompassUpdate < COMPASS_THROTTLE) return
      lastCompassUpdate = now

      if (event.webkitCompassHeading !== undefined) {
        processHeading(event.webkitCompassHeading, 'compass')
      }
    }

    window.addEventListener('deviceorientationabsolute', handleOrientation)
    window.addEventListener('deviceorientation', handleWebkitOrientation)

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation)
      window.removeEventListener('deviceorientation', handleWebkitOrientation)
    }
  }, [tracking, headingSource, processHeading])

  // Clear buffers when tracking stops
  useEffect(() => {
    if (!tracking) {
      gpsBufferRef.current.clear()
      compassBufferRef.current.clear()
    }
  }, [tracking])

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}
