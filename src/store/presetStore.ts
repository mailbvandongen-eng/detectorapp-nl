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
    layers: ['AMK Monumenten', 'Gewaspercelen'],
    isBuiltIn: true  // Protected - cannot be deleted
  },
  {
    id: 'steentijd',
    name: 'Steentijd',
    icon: 'Mountain',
    layers: ['Hunebedden', 'Grafheuvels', 'Terpen', 'Essen', 'AMK Steentijd'],
    isBuiltIn: false
  },
  {
    id: 'romeins-midvroeg',
    name: 'Romeins - Mid vroeg',
    icon: 'Layers',
    layers: ['Romeinse wegen', 'AMK Romeins', 'AMK Vroege ME'],
    isBuiltIn: false
  },
  {
    id: 'midlaat-nieuwetijd',
    name: 'Mid laat - Nieuwe tijd',
    icon: 'Grid',
    layers: ['Kadastrale Grenzen', 'AMK Late ME'],
    isBuiltIn: false
  },
  {
    id: 'woii-militair',
    name: 'WOII en Militair',
    icon: 'Target',
    layers: ['WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden', 'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten'],
    isBuiltIn: false
  },
  {
    id: 'analyse',
    name: 'Analyse',
    icon: 'Search',
    layers: ['IKAW', 'Geomorfologie', 'Bodemkaart', 'AHN4 Multi-Hillshade NL', 'AHN4 Hoogtekaart Kleur', 'AMK Monumenten'],
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

// All overlay layer names for clearing - must match PresetButtons.tsx
const ALL_OVERLAYS = [
  // Base layer overlays
  'Labels Overlay', 'TMK 1850', 'Bonnebladen 1900',
  // Steentijd
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen', 'Essen',
  // Archeologie
  'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig',
  'Romeinse wegen', 'Romeinse wegen (Wereld)', 'Kastelen', 'IKAW', 'Archeo Landschappen',
  // Erfgoed
  'Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed',
  // Militair
  'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  // Paleokaarten
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  // UIKAV
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling',
  // Hoogtekaarten
  'AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m', 'World Hillshade',
  // Terrein
  'Veengebieden', 'Geomorfologie', 'Bodemkaart',
  // Fossielen
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  // Recreatie
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes',
  // Percelen
  'Gewaspercelen', 'Kadastrale Grenzen',
  // Provinciale Waardenkaarten - Zuid-Holland
  'Scheepswrakken', 'Woonheuvels ZH', 'Romeinse Forten', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen',
  // Provinciale Waardenkaarten - Gelderland
  'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken',
  // Provinciale Waardenkaarten - Zeeland
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
      version: 4,
      migrate: (persistedState: unknown, version: number) => {
        // v2.7.2: Complete preset overhaul - reset to new defaults
        if (version < 4) {
          // Force reset all presets to new defaults
          return {
            presets: [...BUILT_IN_PRESETS]
          }
        }
        return persistedState as PresetState
      }
    }
  )
)
