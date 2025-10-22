import { scaleLinear } from 'd3-scale'
import { interpolateLab } from 'd3-interpolate'
import maplibregl from 'maplibre-gl'

export const initializeColorScales = (
  progressiveIndicators,
  demographicIndicators,
  progressiveColors,
  demographicColors
) => {
  const progressiveColorScales = {}
  progressiveIndicators['Progressive Evolution'].forEach((d) => {
    progressiveColorScales[d] = scaleLinear()
      .domain([0, 1])
      .interpolate(interpolateLab)
      .range(['white', progressiveColors[d] || '#cc0000'])
  })

  const demographicColorScales = {}
  demographicIndicators['Demographics'].forEach((d) => {
    demographicColorScales[d] = scaleLinear()
      .domain([0, 1])
      .interpolate(interpolateLab)
      .range(['white', demographicColors[d] || '#1f77b4'])
  })

  return { progressiveColorScales, demographicColorScales }
}

export const createMapInstance = (isMobile, mapStyles) => {
  const defaultZoom = isMobile ? 9.8 : 10.4

  return new maplibregl.Map({
    container: 'map',
    style: mapStyles.monochrome,
    center: [-73.956, 40.7228],
    zoom: defaultZoom,
    minZoom: 9,
  })
}

export const updateDistrictColors = (
  map,
  shapes,
  scale,
  data,
  selectedIndicator,
  dataView,
  colorScales,
  selected,
  scaleLookup,
  evolutionColors
) => {
  const { progressive: progressiveColorScales, demographic: demographicColorScales } = colorScales

  if (scale === 'Election district') {
    Object.keys(shapes['election-districts']).forEach((k) => {
      let color = '#cccccc'
      let opacity = 0

      const evolutionData = data['progressive-evolution']
      const edData = evolutionData ? evolutionData[k] : null

      if (edData && dataView === 'Progressive Evolution') {
        if (selectedIndicator === 'Performance Change (2021-2025)') {
          color = evolutionColors[edData.trendCategory] || '#cccccc'
          opacity = Math.max(Math.min(Math.abs(edData.growthPoints) / 30, 1), 0.6)
        } else if (selectedIndicator === 'Maya Wiley 2021 Baseline') {
          const intensity = (edData.progressive2021 || 0) / 100
          color = progressiveColorScales['Maya Wiley 2021 Baseline'](intensity)
          opacity = 1
        } else if (selectedIndicator === 'Zohran Mamdani 2025 Current') {
          const intensity = (edData.progressive2025 || 0) / 100
          color = progressiveColorScales['Zohran Mamdani 2025 Current'](intensity)
          opacity = 1
        } else if (selectedIndicator === 'Growth Percentage') {
          const maxGrowth = 200
          const intensity = Math.min(Math.abs(edData.growthPercent || 0) / maxGrowth, 1)
          color = edData.growthPercent > 0 ?
            progressiveColorScales['Growth Percentage'](intensity) :
            '#ff4444'
          opacity = 1
        } else if (selectedIndicator === 'Vote Share Change') {
          const intensity = Math.min(Math.abs(edData.growthPoints || 0) / 50, 1)
          color = progressiveColorScales['Vote Share Change'](intensity)
          opacity = Math.max(Math.min(Math.abs(edData.growthPoints) / 30, 1), 0.6)
        }
      }

      const demographicData = data['demographics']
      const demoData = demographicData ? demographicData[k] : null

      if (demoData && dataView === 'Demographics') {
        const fieldMap = {
          'Population': 'population',
          'Median Household Income': 'median_income',
          'Median Age': 'median_age',
          'Renter Units': 'pct_renters',
        }
        
        const fieldName = fieldMap[selectedIndicator] || selectedIndicator
        const value = demoData[fieldName]
        if (value !== undefined && value !== null) {
          let intensity = 0

          if (selectedIndicator === 'Population') {
            intensity = Math.min(value / 10000, 1)
          } else if (selectedIndicator === 'Median Household Income') {
            intensity = Math.min(Math.max((value - 20000) / 180000, 0), 1)
          } else if (selectedIndicator === 'Median Age') {
            intensity = Math.min(Math.max((value - 20) / 60, 0), 1)
          } else if (selectedIndicator === 'Renter Units') {
            intensity = Math.min(Math.max(value / 100, 0), 1)
          } else if (selectedIndicator.includes('Hispanic') || selectedIndicator.includes('Black') ||
                     selectedIndicator.includes('White') || selectedIndicator.includes('Asian') ||
                     selectedIndicator.includes('Foreign')) {
            intensity = Math.min(Math.max(value, 0), 1)
          }

          color = demographicColorScales[selectedIndicator]
            ? demographicColorScales[selectedIndicator](intensity)
            : '#1f77b4'
          opacity = Math.max(intensity * 0.8 + 0.2, 0.3)
        } else {
          color = '#cccccc'
          opacity = 0.3
        }
      }

      map.current.setFeatureState(
        {
          source: 'election-districts',
          id: shapes['election-districts'][k].id,
        },
        {
          color,
          opacity,
          'line-width': selected[scaleLookup[scale]] === k ? 1.5 : 0.25,
        },
      )
    })
  }

  if (scale === 'Assembly district') {
    const assemblyData = data['assembly-demographics']
    
    Object.keys(shapes['assembly-districts']).forEach((k) => {
      let color = '#666666'
      let opacity = 0.3

      if (assemblyData && assemblyData[k] && dataView === 'Demographics') {
        const adData = assemblyData[k]
        const value = adData[selectedIndicator]
        
        if (value !== undefined && value !== null) {
          let intensity = 0

          if (selectedIndicator === 'Population') {
            intensity = Math.min(value / 300000, 1)
          } else if (selectedIndicator === 'Median Household Income') {
            intensity = Math.min(Math.max((value - 20000) / 180000, 0), 1)
          } else if (selectedIndicator === 'Median Age') {
            intensity = Math.min(Math.max((value - 20) / 60, 0), 1)
          } else if (selectedIndicator === 'Renter Units') {
            intensity = Math.min(Math.max(value / 100, 0), 1)
          }

          color = demographicColorScales[selectedIndicator]
            ? demographicColorScales[selectedIndicator](intensity)
            : '#1f77b4'
          opacity = Math.max(intensity * 0.8 + 0.2, 0.3)
        }
      }

      map.current.setFeatureState(
        {
          source: 'assembly-districts',
          id: shapes['assembly-districts'][k].id,
        },
        {
          color,
          opacity,
          'line-width': selected[scaleLookup[scale]] === k ? 1.5 : 0.5,
        },
      )
    })
  }
}

