/**
 * Convert UIKAV shapefiles to GeoJSON
 * Analyzes fields and converts archaeological expectation data
 */

import shapefile from 'shapefile'
import fs from 'fs'
import path from 'path'

const SHAPEFILE_DIR = 'C:/Archeo bronnen/Uiterwaarden Rivierengebied/DIGITALE BIJLAGEN - original/20_BASISKAARTEN_ARCHEOLOGIE/Shapefiles'
const OUTPUT_DIR = './public/data/uikav'

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * Convert a shapefile to GeoJSON and analyze fields
 */
async function convertShapefile(shapefileName, outputName) {
  const shpPath = path.join(SHAPEFILE_DIR, `${shapefileName}.shp`)
  const dbfPath = path.join(SHAPEFILE_DIR, `${shapefileName}.dbf`)

  console.log(`\n📦 Converting ${shapefileName}...`)
  console.log(`   SHP: ${shpPath}`)
  console.log(`   DBF: ${dbfPath}`)

  try {
    const features = []
    let fieldNames = new Set()
    let sampleProperties = null

    // Read shapefile
    const source = await shapefile.open(shpPath, dbfPath)

    let result = await source.read()
    let count = 0

    while (!result.done) {
      if (result.value) {
        features.push(result.value)
        count++

        // Collect field names from first feature
        if (count === 1 && result.value.properties) {
          sampleProperties = result.value.properties
          Object.keys(result.value.properties).forEach(key => fieldNames.add(key))
        }
      }
      result = await source.read()
    }

    // Create GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: features
    }

    // Save to file
    const outputPath = path.join(OUTPUT_DIR, `${outputName}.geojson`)
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2))

    console.log(`✅ Converted ${count} features`)
    console.log(`   Output: ${outputPath}`)
    console.log(`   Fields: ${Array.from(fieldNames).join(', ')}`)

    // Show sample properties
    if (sampleProperties) {
      console.log(`   Sample data:`)
      Object.entries(sampleProperties).slice(0, 10).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    }

    return {
      name: outputName,
      count,
      fields: Array.from(fieldNames),
      sampleProperties
    }
  } catch (error) {
    console.error(`❌ Error converting ${shapefileName}:`, error.message)
    return null
  }
}

/**
 * Main conversion process
 */
async function main() {
  console.log('🚀 UIKAV Shapefile Converter')
  console.log('=' .repeat(50))

  const conversions = [
    { input: 'Expert-aanpassingen', output: 'uikav_expert_aanpassingen' },
    { input: 'Bufferlaag', output: 'uikav_bufferlaag' },
    { input: 'Archeo_point', output: 'uikav_archeo_punten' },
    { input: 'Archeo_polygon', output: 'uikav_archeo_vlakken' },
    { input: 'Uiterwaarden_indeling_KMMINMAX', output: 'uikav_uiterwaarden_indeling' }
  ]

  const results = []

  for (const { input, output } of conversions) {
    const result = await convertShapefile(input, output)
    if (result) {
      results.push(result)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Conversion Summary:')
  console.log('=' .repeat(50))

  results.forEach(result => {
    console.log(`\n${result.name}:`)
    console.log(`  Features: ${result.count}`)
    console.log(`  Fields: ${result.fields.length}`)
    console.log(`  Field names: ${result.fields.join(', ')}`)
  })

  console.log('\n✅ All conversions complete!')
  console.log(`📁 Output directory: ${OUTPUT_DIR}`)
}

main().catch(console.error)
