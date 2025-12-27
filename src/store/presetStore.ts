import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useLayerStore } from './layerStore'

export interface Preset {
  id: string
  name: string
  icon: string  // lucide icon name
  layers: string[]
  isBuiltIn: boolean
}

// Built-in presets - only Detectie is protected (isBuiltIn: true)
const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'detectie',
    name: 'Detectie',
    icon: 'Compass',
    layers: ['AHN4 Multi-Hillshade NL', 'AHN 0.5m', 'Geomorfologie', 'AMK Monumenten'],
    isBuiltIn: true  // Protected - cannot be deleted
  },
  {
    id: 'uiterwaarden',
    name: 'Uiterwaarden',
    icon: 'Waves',
    layers: ['UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling'],
    isBuiltIn: false
  },
  {
    id: 'recreatie',
    name: 'Recreatie',
    icon: 'TreePalm',
    layers: ['Parken', 'Speeltuinen', 'Strandjes'],
    isBuiltIn: false
  },
  {
    id: 'hillshade',
    name: 'Hillshade',
    icon: 'Mountain',
    layers: ['AHN 0.5m', 'Geomorfologie', 'AHN4 Multi-Hillshade NL'],
    isBuiltIn: false
  },
  {
    id: 'analyse',
    name: 'Analyse',
    icon: 'Search',
    layers: ['IKAW', 'Geomorfologie', 'Bodemkaart', 'AHN4 Multi-Hillshade NL', 'AMK Monumenten'],
    isBuiltIn: false
  },
  {
    id: 'woii',
    name: 'WOII',
    icon: 'Target',
    layers: ['WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden', 'Verdedigingslinies', 'Militaire Objecten'],
    isBuiltIn: false
  },
  {
    id: 'percelen',
    name: 'Percelen',
    icon: 'Grid',
    layers: ['Gewaspercelen', 'Kadastrale Grenzen', 'AMK Monumenten'],
    isBuiltIn: false
  }
]

interface PresetState {
  presets: Preset[]

  // Actions
  applyPreset: (id: string) => void
  createPreset: (name: string, icon: string) => void
  updatePreset: (id: string, changes: Partial<Pick<Preset, 'name' | 'icon' | 'layers'>>) => void
  deletePreset: (id: string) => void
  resetToDefaults: () => void
}

// All overlay layer names for clearing
const ALL_OVERLAYS = [
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen',
  'AMK Monumenten', 'Romeinse wegen', 'Kastelen', 'IKAW', 'Archeo Landschappen',
  'Rijksmonumenten', 'Werelderfgoed', 'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  'Religieus Erfgoed',
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Buffer', 'UIKAV Expert', 'UIKAV Indeling',
  'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m', 'World Hillshade',
  'Veengebieden', 'Geomorfologie', 'Bodemkaart',
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes',
  'Gewaspercelen', 'Kadastrale Grenzen',
  'Scheepswrakken', 'Woonheuvels ZH', 'Romeinse Forten', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen',
  'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken',
  'Verdronken Dorpen'
]

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [...BUILT_IN_PRESETS].map(p => ({
        ...p,
        // Ensure only Detectie is protected (migration for existing users)
        isBuiltIn: p.id === 'detectie'
      })),

      applyPreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id)
        if (!preset) return

        const layerStore = useLayerStore.getState()

        // Turn off all overlays
        ALL_OVERLAYS.forEach(layer => layerStore.setLayerVisibility(layer, false))

        // Turn on preset layers
        preset.layers.forEach(layer => layerStore.setLayerVisibility(layer, true))

        console.log(`🎨 Preset toegepast: ${preset.name}`)
      },

      createPreset: (name: string, icon: string) => {
        const layerStore = useLayerStore.getState()

        // Get currently visible layers
        const visibleLayers = Object.entries(layerStore.visible)
          .filter(([layerName, isVisible]) => isVisible && ALL_OVERLAYS.includes(layerName))
          .map(([layerName]) => layerName)

        const newPreset: Preset = {
          id: `custom-${Date.now()}`,
          name,
          icon,
          layers: visibleLayers,
          isBuiltIn: false
        }

        set(state => ({
          presets: [...state.presets, newPreset]
        }))

        console.log(`✨ Preset aangemaakt: ${name} met ${visibleLayers.length} lagen`)
      },

      updatePreset: (id: string, changes: Partial<Pick<Preset, 'name' | 'icon' | 'layers'>>) => {
        set(state => ({
          presets: state.presets.map(p =>
            p.id === id && !p.isBuiltIn
              ? { ...p, ...changes }
              : p
          )
        }))
      },

      deletePreset: (id: string) => {
        set(state => ({
          presets: state.presets.filter(p => p.id !== id || p.isBuiltIn)
        }))
      },

      resetToDefaults: () => {
        set({ presets: [...BUILT_IN_PRESETS] })
      }
    }),
    {
      name: 'detectorapp-presets',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as PresetState
        if (version < 2) {
          // Migration: ensure only Detectie is protected
          return {
            ...state,
            presets: state.presets.map(p => ({
              ...p,
              isBuiltIn: p.id === 'detectie'
            }))
          }
        }
        return state
      }
    }
  )
)
