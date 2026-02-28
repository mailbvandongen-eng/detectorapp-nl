import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useLayerStore } from './layerStore'
import { useMapStore } from './mapStore'

export interface Preset {
  id: string
  name: string
  icon: string  // lucide icon name
  layers: string[]
  baseLayer?: string  // Optional base layer to activate (e.g., 'Luchtfoto')
  layerOpacities?: Record<string, number>  // Optional per-layer opacity overrides
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
    layers: ['AMK Monumenten', 'Gewaspercelen', 'Geomorfologie', 'AHN4 Hoogtekaart Kleur', 'Kadastrale Grenzen'],
    baseLayer: 'Luchtfoto',  // Luchtfoto als standaard voor detectie
    layerOpacities: {
      'AMK Monumenten': 0.50,
      'Gewaspercelen': 0.25,
      'Geomorfologie': 0.25,
      'AHN4 Hoogtekaart Kleur': 0.25
    },
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
    name: 'Romeins - Mid vroeg',
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
    name: 'Mid laat - Nieuwe tijd',
    icon: 'Grid',
    // Historische structuren en erfgoed
    layers: [
      'AMK Late ME', 'Kastelen', 'Essen', 'Rijksmonumenten',
      'Gewaspercelen', 'Kadastrale Grenzen', 'Oude Kernen'
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
      'IKAW', 'Geomorfologie', 'Bodemkaart',
      'AHN4 Multi-Hillshade NL', 'AHN4 Hoogtekaart Kleur'
    ],
    isBuiltIn: false
  }
]

interface PresetState {
  presets: Preset[]
  customDefaults: Preset[] | null  // User's saved defaults (null = use BUILT_IN_PRESETS)

  // Actions
  applyPreset: (id: string) => void
  createPreset: (name: string, icon: string) => void
  updatePreset: (id: string, changes: Partial<Pick<Preset, 'name' | 'icon' | 'layers'>>) => void
  deletePreset: (id: string) => void
  saveAsDefaults: () => void  // Save current presets as user's defaults
  resetToDefaults: () => void  // Reset to user's defaults (or BUILT_IN if no custom)
  resetToBuiltIn: () => void  // Reset to original BUILT_IN_PRESETS
}

// All overlay layer names for clearing - must match PresetButtons.tsx
const ALL_OVERLAYS = [
  // Base layer overlays
  'Labels Overlay', 'TMK 1850', 'Bonnebladen 1900',
  // Steentijd
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen',
  // Archeologie
  'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig',
  'Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Romeinse Forten', 'Kastelen', 'IKAW',
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
  'Scheepswrakken', 'Woonheuvels ZH', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen',
  // Provinciale Waardenkaarten - Gelderland
  'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken',
  // Provinciale Waardenkaarten - Zeeland
  'Verdronken Dorpen'
]

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [...BUILT_IN_PRESETS],
      customDefaults: null,

      applyPreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id)
        if (!preset) return

        const layerStore = useLayerStore.getState()
        const mapStore = useMapStore.getState()

        // Turn off all overlays
        ALL_OVERLAYS.forEach(layer => layerStore.setLayerVisibility(layer, false))

        // Turn on preset layers
        preset.layers.forEach(layer => layerStore.setLayerVisibility(layer, true))

        // Apply layer opacities if specified
        if (preset.layerOpacities) {
          Object.entries(preset.layerOpacities).forEach(([layerName, opacity]) => {
            layerStore.setLayerOpacity(layerName, opacity)
          })
        }

        // Set base layer if specified
        if (preset.baseLayer) {
          const baseLayerNames = ['Esri Licht', 'Esri Straten', 'Esri Satelliet', 'Luchtfoto', 'TMK 1850', 'Bonnebladen 1900']
          // Set OL layer visibility (for when OL is primary)
          baseLayerNames.forEach(layerName => {
            layerStore.setLayerVisibility(layerName, layerName === preset.baseLayer)
          })
          // Also update ArcGIS basemap (for when ArcGIS is primary)
          mapStore.setBasemap(preset.baseLayer)
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

      saveAsDefaults: () => {
        const currentPresets = get().presets
        set({ customDefaults: [...currentPresets] })
        console.log('💾 Presets opgeslagen als standaard')
      },

      resetToDefaults: () => {
        const { customDefaults } = get()
        if (customDefaults) {
          set({ presets: [...customDefaults] })
          console.log('🔄 Presets hersteld naar eigen standaard')
        } else {
          set({ presets: [...BUILT_IN_PRESETS] })
          console.log('🔄 Presets hersteld naar originele standaard')
        }
      },

      resetToBuiltIn: () => {
        set({ presets: [...BUILT_IN_PRESETS], customDefaults: null })
        console.log('🔄 Presets gereset naar originele instellingen')
      }
    }),
    {
      name: 'detectorapp-presets',
      version: 14,
      migrate: (persistedState: unknown, version: number) => {
        // v14: Changed Detectie baseLayer from 'Esri Licht' to 'Luchtfoto'
        // v13: Changed AMK opacity from 60% to 50% in Detectie preset
        // v12: Updated Detectie preset with specific opacities and added Kadastrale Grenzen
        // v11: Added Geomorfologie and AHN4 Hoogtekaart Kleur to Detectie preset with low opacity
        // v10: Removed non-existent 'Archeo Landschappen' from Terrein Analyse preset
        if (version < 14) {
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
