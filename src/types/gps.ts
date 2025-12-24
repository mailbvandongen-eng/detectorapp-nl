export interface GPSPosition {
  lat: number
  lng: number
}

export interface GPSConfig {
  smoothingFactor: number
  minRotationSpeed: number
  centerOnUser: boolean
  animationDuration: number
}

export interface GPSMarkerOptions {
  position: GPSPosition
  accuracy: number
  heading?: number
}
