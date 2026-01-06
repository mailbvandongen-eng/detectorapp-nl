import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useLayerStore } from './layerStore'

export interface Preset {
  id: string
  name: string
  icon: string  // lucide icon name
  layers: string[]
  baseLayer?: string  // Optional base layer to activate (e.g., 'Luchtfoto')
  isBuiltIn: boolean
}

// Built-in presets - only Detectie is protected (isBuiltIn: true)
// Logisch ontworpen presets per periode/gebruik:
// - Steentijd: luchtfoto + reliëf om zandverstuivingen te zien
// - Romeins/Vroege ME: percelen zijn belangrijk voor nederzettingspatronen
// - Late ME/Nieuw: kadaster en historische structuren
// - WOII: militaire objecten en linies
// - Analyse: bodem en terrein voor onderzoek
const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'detectie',
    name: 'Detectie',
    icon: 'Compass',
    layers: ['AMK Monumenten', 'Gewaspercelen'],
    baseLayer: 'CartoDB (licht)',  // Explicit default base layer
    isBuiltIn: false  // Now editable like other presets
  },
  {
    id: 'steentijd',
    name: 'Steentijd',
    icon: 'Mountain',
    // Luchtfoto achtergrond om zandverstuivingen/heide te herkennen
    // Reliëfkaart voor grafheuvels en oude structuren
    // Labels overlay voor plaatsnamen
    layers: [
      'Hunebedden', 'Grafheuvels', 'Terpen', 'FAMKE Steentijd', 'AMK Steentijd',
      'AHN4 Multi-Hillshade NL', 'Labels Overlay'
    ],
    baseLayer: 'Luchtfoto',
    isBuiltIn: false
  },
  {
    id: 'romeins-midvroeg',
    name: 'Romeins - Vroege ME',
    icon: 'Layers',
    // Percelen belangrijk voor nederzettingspatronen
    // Romeinse wegen en forten
    layers: [
      'Romeinse wegen (regio)', 'Romeinse Forten', 'AMK Romeins', 'AMK Vroege ME',
      'Gewaspercelen', 'Kadastrale Grenzen'
    ],
    isBuiltIn: false
  },
  {
    id: 'midlaat-nieuwetijd',
    name: 'Late ME - Nieuw',
    icon: 'Grid',
    // Historische structuren en erfgoed
    layers: [
      'AMK Late ME', 'Kastelen', 'Essen', 'Rijksmonumenten',
      'Kadastrale Grenzen', 'Oude Kernen'
    ],
    isBuiltIn: false
  },
  {
    id: 'woii-militair',
    name: 'WOII & Militair',
    icon: 'Target',
    layers: [
      'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
      'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten'
    ],
    isBuiltIn: false
  },
  {
    id: 'analyse',
    name: 'Terrein Analyse',
    icon: 'Search',
    // Bodem en terrein voor onderzoek, reliëf en hoogtekaart
    layers: [
      'IKAW', 'Geomorfologie', 'Bodemkaart', 'Archeo Landschappen',
      'AHN4 Multi-Hillshade NL', 'AHN4 Hoogtekaart Kleur'
    ],
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
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen',
  // Archeologie
  'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig',
  'Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Kastelen', 'IKAW', 'Archeo Landschappen',
  // Erfgoed
  'Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed', 'Essen',
  // Militair
  'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  // Paleokaarten
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  // UIKAV
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling',
  // Hoogtekaarten
  'AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m',
  // Terrein
  'Veengebieden', 'Geomorfologie', 'Bodemkaart',
  // Fossielen
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  // Recreatie
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes', 'Kringloopwinkels',
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
      presets: [...BUILT_IN_PRESETS],

      applyPreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id)
        if (!preset) return

        const layerStore = useLayerStore.getState()

        // Turn off all overlays
        ALL_OVERLAYS.forEach(layer => layerStore.setLayerVisibility(layer, false))

        // Turn on preset layers
        preset.layers.forEach(layer => layerStore.setLayerVisibility(layer, true))

        // Set base layer if specified
        if (preset.baseLayer) {
          const baseLayerNames = ['CartoDB (licht)', 'OpenStreetMap', 'Luchtfoto', 'TMK 1850', 'Bonnebladen 1900']
          baseLayerNames.forEach(layerName => {
            layerStore.setLayerVisibility(layerName, layerName === preset.baseLayer)
          })
        }

        console.log(`🎨 Preset toegepast: ${preset.name}${preset.baseLayer ? ` (${preset.baseLayer})` : ''}`)
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
            p.id === id ? { ...p, ...changes } : p
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
      version: 7,
      migrate: (persistedState: unknown, version: number) => {
        // v2.10.5: Detectie heeft baseLayer, Steentijd heeft Labels Overlay
        if (version < 7) {
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
