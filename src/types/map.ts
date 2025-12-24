export interface MapViewOptions {
  center: [number, number] // [lng, lat]
  zoom: number
  rotation?: number
  minZoom?: number
  maxZoom?: number
}

export interface MapConfig {
  target: string
  view: MapViewOptions
}
