import type { Layer } from 'ol/layer'

export interface LayerMetadata {
  name: string
  type: 'overlay' | 'base'
  category?: string
  zIndex?: number
  opacity?: number
  visible?: boolean
  symbol?: string
  color?: string
  description?: string
}

export interface LayerGroup {
  name: string
  layers: LayerMetadata[]
  collapsed?: boolean
}

export interface AMKValue {
  code: string
  label: string
  color: string
  description?: string
}

export const AMK_VALUES: AMKValue[] = [
  {
    code: 'value_1',
    label: 'Terrein van archeologische waarde',
    color: '#c4b5fd'
  },
  {
    code: 'value_2',
    label: 'Terrein van hoge archeologische waarde',
    color: '#8b5cf6'
  },
  {
    code: 'value_3',
    label: 'Terrein van zeer hoge archeologische waarde',
    color: '#6d28d9'
  },
  {
    code: 'value_4',
    label: 'Terrein van zeer hoge archeologische waarde, beschermd',
    color: '#4c1d95'
  }
]
