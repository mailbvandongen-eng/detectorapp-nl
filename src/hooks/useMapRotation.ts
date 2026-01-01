import { useEffect, useRef } from 'react'
import { useMapStore } from '../store/mapStore'
import { useGPSStore } from '../store/gpsStore'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Animation-free map rotation hook
 * - Uses requestAnimationFrame for smooth updates
 * - Rate-limited rotation (max 60°/sec)
 * - No conflicting animate() calls
 */
export function useMapRotation() {
  const map = useMapStore(state => state.map)
  const setRotation = useMapStore(state => state.setRotation)
  const smoothHeading = useGPSStore(state => state.smoothHeading)
  const tracking = useGPSStore(state => state.tracking)
  const headingUpMode = useSettingsStore(state => state.headingUpMode)

  const currentRotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)

  // Max rotation speed: 90 degrees per second
  const MAX_ROTATION_SPEED = (90 * Math.PI) / 180 // radians per second

  useEffect(() => {
    if (!map) return

    // Heading-up mode OFF: reset to north
    if (!headingUpMode) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      const currentRot = map.getView().getRotation()
      if (Math.abs(currentRot) > 0.01) {
        // Smooth reset to north
        map.getView().animate({ rotation: 0, duration: 400 })
      }
      currentRotationRef.current = 0
      targetRotationRef.current = 0
      setRotation(0)
      return
    }

    // Not tracking: stop animation
    if (!tracking || smoothHeading === null) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    // Convert heading to map rotation (negative because map rotates opposite)
    targetRotationRef.current = -(smoothHeading * Math.PI) / 180

    // Animation loop
    const animate = (timestamp: number) => {
      if (!map) return

      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0.016
      lastTimeRef.current = timestamp

      const current = currentRotationRef.current
      const target = targetRotationRef.current

      // Calculate shortest path (handle wrap-around)
      let diff = target - current
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI

      // Rate limiting: max rotation speed
      const maxDelta = MAX_ROTATION_SPEED * deltaTime
      const clampedDiff = Math.max(-maxDelta, Math.min(maxDelta, diff))

      // Apply if significant change
      if (Math.abs(diff) > 0.001) {
        const newRotation = current + clampedDiff
        currentRotationRef.current = newRotation

        // Direct rotation - no animation
        map.getView().setRotation(newRotation)

        // Update store (in degrees for display)
        const degrees = ((-newRotation * 180) / Math.PI + 360) % 360
        setRotation(degrees)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation loop
    if (!animationFrameRef.current) {
      lastTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [map, tracking, smoothHeading, headingUpMode, setRotation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}
