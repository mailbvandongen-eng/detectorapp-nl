/**
 * Build Mode Configuration
 *
 * Controls which features/themes are visible based on build type:
 * - 'commercial': Focused product for serious detectorists (monumenten, AHN, historisch)
 * - 'personal': Full version with all features including EU expansion
 */

export type BuildMode = 'commercial' | 'personal'

// Get build mode from environment variable, default to 'personal' for development
export const BUILD_MODE: BuildMode =
  (import.meta.env.VITE_BUILD_MODE as BuildMode) || 'personal'

/**
 * Theme groups that are visible in each build mode
 */
export const VISIBLE_THEMES: Record<BuildMode, string[]> = {
  commercial: [
    // Kern - waar de app om draait
    'Archeologische lagen',
    'Archeologische verwachtingen',
    'Erfgoed & Monumenten',
    'WOII & Militair',
    'Hillshade & LiDAR',
    'Terrein & Bodem',
    'Percelen',
    'Recreatie',
  ],
  personal: [
    // Alles
    'Steentijd & Prehistorie',
    'Paleokaarten',
    'Archeologische lagen',
    'Archeologische verwachtingen',
    'Erfgoed & Monumenten',
    'WOII & Militair',
    'Hillshade & LiDAR',
    'Terrein & Bodem',
    'Percelen',
    'Provinciale Thema\'s',
    'Fossielen, Mineralen & Goud',
    'Recreatie',
  ]
}

/**
 * Base layers visible in each build mode
 */
export const VISIBLE_BASE_LAYERS: Record<BuildMode, string[]> = {
  commercial: [
    'Esri Licht',
    'Esri Straten',
    'Esri Satelliet',
    'Luchtfoto',
    'TMK 1850',
    'Bonnebladen 1900',
  ],
  personal: [
    'Esri Licht',
    'Esri Straten',
    'Esri Satelliet',
    'Luchtfoto',
    'TMK 1850',
    'Bonnebladen 1900',
  ]
}

/**
 * Special sections visible in each build mode
 */
export const VISIBLE_SPECIAL_SECTIONS: Record<BuildMode, string[]> = {
  commercial: ['Specials (3D)'],
  personal: ['Specials (3D)']
}

/**
 * Check if a theme group should be visible
 */
export function isThemeVisible(themeName: string): boolean {
  return VISIBLE_THEMES[BUILD_MODE].includes(themeName)
}

/**
 * Check if a base layer should be visible
 */
export function isBaseLayerVisible(layerName: string): boolean {
  return VISIBLE_BASE_LAYERS[BUILD_MODE].includes(layerName)
}

/**
 * Check if a special section should be visible
 */
export function isSpecialSectionVisible(sectionName: string): boolean {
  return VISIBLE_SPECIAL_SECTIONS[BUILD_MODE].includes(sectionName)
}

/**
 * Get current build mode label for UI
 */
export function getBuildModeLabel(): string {
  return BUILD_MODE === 'commercial' ? 'DetectorApp NL' : 'DetectorApp NL (Full)'
}
