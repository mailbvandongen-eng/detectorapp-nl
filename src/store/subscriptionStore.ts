import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium' | 'pro'

// Regions/countries
export type Region = 'nl' | 'be' | 'de' | 'fr'

// Layer tiers for layerRegistry
export type LayerTier = 'free' | 'premium' | 'pro'

interface SubscriptionState {
  // Current subscription status
  tier: SubscriptionTier
  unlockedRegions: Region[]

  // For development/testing - can be set to true to unlock all
  devMode: boolean

  // Actions
  setTier: (tier: SubscriptionTier) => void
  unlockRegion: (region: Region) => void
  lockRegion: (region: Region) => void
  setDevMode: (enabled: boolean) => void

  // Helper functions
  isRegionUnlocked: (region: Region) => boolean
  isLayerUnlocked: (layerName: string, layerTier?: LayerTier, layerRegions?: Region[]) => boolean
  canAccessPremiumFeatures: () => boolean
}

// Lagen die altijd gratis zijn (basis functionaliteit)
// Dit is een voorlopige lijst - we bespreken dit per laag later
export const FREE_LAYERS = [
  // Achtergronden (Esri basemaps)
  'Esri Licht',
  'Esri Straten',
  'Esri Satelliet',
  'Luchtfoto',
  'Labels Overlay',

  // Basis functionaliteit
  'Mijn Vondsten',
]

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Defaults - start as free tier with NL unlocked (for backwards compatibility)
      tier: 'free',
      unlockedRegions: ['nl'],
      devMode: true, // Start with devMode ON for development - set to false for production

      // Actions
      setTier: (tier) => set({ tier }),

      unlockRegion: (region) => set((state) => ({
        unlockedRegions: state.unlockedRegions.includes(region)
          ? state.unlockedRegions
          : [...state.unlockedRegions, region]
      })),

      lockRegion: (region) => set((state) => ({
        unlockedRegions: state.unlockedRegions.filter(r => r !== region)
      })),

      setDevMode: (devMode) => set({ devMode }),

      // Check if a region is unlocked
      isRegionUnlocked: (region) => {
        const state = get()
        if (state.devMode) return true
        if (state.tier === 'pro') return true
        return state.unlockedRegions.includes(region)
      },

      // Check if a layer is unlocked
      // layerTier: the tier required for this layer (from layerRegistry)
      // layerRegions: which regions this layer belongs to (from layerRegistry)
      isLayerUnlocked: (layerName, layerTier = 'free', layerRegions = ['nl']) => {
        const state = get()

        // Dev mode = everything unlocked
        if (state.devMode) return true

        // Free layers are always unlocked
        if (FREE_LAYERS.includes(layerName)) return true

        // Free tier layers are always unlocked
        if (layerTier === 'free') return true

        // Pro tier = everything
        if (state.tier === 'pro') return true

        // Premium tier = check regions
        if (state.tier === 'premium') {
          // Layer is unlocked if ANY of its regions are unlocked
          return layerRegions.some(region => state.unlockedRegions.includes(region))
        }

        // Free tier user trying to access premium/pro layer
        return false
      },

      // Quick check for premium features
      canAccessPremiumFeatures: () => {
        const state = get()
        return state.devMode || state.tier !== 'free'
      }
    }),
    {
      name: 'detectorapp-subscription',
      version: 1,
    }
  )
)

// Type for extended LayerDefinition with tier info
// This will be used when we update layerRegistry
export interface LayerTierInfo {
  tier: LayerTier
  regions: Region[]
}
