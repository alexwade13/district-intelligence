import { useEffect, useState, useRef } from 'react'
import { Box, Container, IconButton, Switch, Image, Link } from 'theme-ui'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Themed } from '@theme-ui/mdx'
import maplibregl from 'maplibre-gl'
import { scaleLinear } from 'd3-scale'
import { interpolateLab } from 'd3-interpolate'
import { range } from 'd3-array'
import {
  Row,
  Column,
  Input,
  Autocomplete,
  Results,
  Options,
  Colorbar,
} from '../components'
import { addLabels, addShapes } from '../components/layers'
import {
  handleShapeClick,
  handleShapeClickOff,
  handleShapeMouseMove,
  handleShapeMouseMoveoff,
  createShapeMouseMoveHandler,
  createShapeMouseMoveOffHandler,
  createShapeClickHandler,
  createShapeClickOffHandler,
  updateShapeVisibility,
  getMaxKey,
} from '../components/utils'
import {
  boroughColors,
  progressiveIndicators,
  demographicIndicators,
  progressiveColors,
  demographicColors,
  evolutionColors,
  mapStyles,
  scaleLookup,
  analysisLookup,
} from '../components/constants'
import load from '../components/load'
import shapes from '../data'

const Index = () => {
  const { data, error } = load()

  const map = useRef()
  const [selected, setSelected] = useState({})
  const [selectedIndicator, setSelectedIndicator] = useState('Population')
  const [dataView, setDataView] = useState('Demographics')
  const [scale, setScale] = useState('Assembly district')
  const [progressiveColorScales, setProgressiveColorScales] = useState({})
  const [demographicColorScales, setDemographicColorScales] = useState({})

  const setup = async () => {
    addShapes(map.current, 'election-districts', 0.25)
    addShapes(map.current, 'assembly-districts', 0.25)
    addLabels(map.current)
  }

  useEffect(() => {
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

    setProgressiveColorScales(progressiveColorScales)
    setDemographicColorScales(demographicColorScales)
  }, [])

  useEffect(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 40em)').matches

    const defaultZoom = isMobile ? 9.8 : 10.4

    map.current = new maplibregl.Map({
      container: 'map',
      style: mapStyles.monochrome,
      center: [-73.956, 40.7228],
      zoom: defaultZoom,
      minZoom: 9,
    })

    map.current.on('load', () => {
      setup()
    })

    return () => map.current.remove()
  }, [])

  useEffect(() => {
    if (!map.current) return

    const layers = ['assembly-district', 'election-district']
    const handlers = {}
    const foo = 2

    layers.forEach((layer) => {
      handlers[layer] = {}
      handlers[layer].move = createShapeMouseMoveHandler(map.current, layer)
      handlers[layer].moveOff = createShapeMouseMoveOffHandler(map.current)
      handlers[layer].click = createShapeClickHandler(
        map.current,
        layer,
        setSelected,
      )
      handlers[layer].clickOff = createShapeClickOffHandler(
        map.current,
        layer,
        setSelected,
      )

      const addHandlers = () => {
        map.current.on('mousemove', `${layer}s-fill`, handlers[layer].move)
        map.current.on('click', `${layer}s-fill`, handlers[layer].click)
        map.current.on('mousemove', handlers[layer].moveOff)
        map.current.on('click', handlers[layer].clickOff)
      }

      if (!map.current.isStyleLoaded()) {
        map.current.once('idle', () => {
          addHandlers()
        })
      } else {
        addHandlers()
      }
    })

    return () => {
      layers.forEach((layer) => {
        map.current.off('mousemove', `${layer}s-fill`, handlers[layer].move)
        map.current.off('click', `${layer}s-fill`, handlers[layer].click)
        map.current.off('mousemove', handlers[layer].moveOff)
        map.current.off('click', handlers[layer].clickOff)
      })
    }
  }, [map.current, scale])

  useEffect(() => {
    if (!map.current) return

    const update = () => {
      const layers = ['election-district', 'assembly-district']

      updateShapeVisibility(map.current, `${scaleLookup[scale]}s`, 'visible')

      layers.forEach((l) => {
        if (!(l == scaleLookup[scale])) {
          updateShapeVisibility(map.current, `${l}s`, 'none')
        }
      })
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', () => {
        update()
      })
    } else {
      update()
    }
  }, [map.current, scale])

  useEffect(() => {
    if (dataView === 'Progressive Evolution' && !progressiveIndicators['Progressive Evolution'].includes(selectedIndicator)) {
      setSelectedIndicator('Performance Change (2021-2025)')
    } else if (dataView === 'Demographics' && !demographicIndicators['Demographics'].includes(selectedIndicator)) {
      setSelectedIndicator('Population')
    }
  }, [dataView])

  useEffect(() => {
    const updateSelected = () => {
      if (scale == 'Election district') {
        Object.keys(shapes['election-districts']).forEach((k) => {
          let color = '#cccccc'
          let opacity = 0

          // Handle progressive evolution data
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

          // Handle demographic data
          const demographicData = data['demographics']
          const demoData = demographicData ? demographicData[k] : null

          if (demoData && dataView === 'Demographics') {
            // Map display names to JSON field names
            const fieldMap = {
              'Population': 'population',
              'Median Household Income': 'median_income',
              'Median Age': 'median_age',
              'Renter Units': 'pct_renters',
            }
            
            const fieldName = fieldMap[selectedIndicator] || selectedIndicator
            const value = demoData[fieldName]
            if (value !== undefined && value !== null) {
              // Normalize value based on indicator type
              let intensity = 0

              if (selectedIndicator === 'Population') {
                // Normalize population (assume max around 10,000 for NYC EDs)
                intensity = Math.min(value / 10000, 1)
              } else if (selectedIndicator === 'Median Household Income') {
                // Normalize income (assume range $20k-$200k)
                intensity = Math.min(Math.max((value - 20000) / 180000, 0), 1)
              } else if (selectedIndicator === 'Median Age') {
                // Normalize age (assume range 20-80)
                intensity = Math.min(Math.max((value - 20) / 60, 0), 1)
              } else if (selectedIndicator === 'Renter Units') {
                // Normalize renter rate (0-100 scale)
                intensity = Math.min(Math.max(value / 100, 0), 1)
              } else if (selectedIndicator.includes('Hispanic') || selectedIndicator.includes('Black') ||
                         selectedIndicator.includes('White') || selectedIndicator.includes('Asian') ||
                         selectedIndicator.includes('Foreign')) {
                // Normalize demographic percentages (0-1 scale already)
                intensity = Math.min(Math.max(value, 0), 1)
              }

              color = demographicColorScales[selectedIndicator]
                ? demographicColorScales[selectedIndicator](intensity)
                : '#1f77b4'
              opacity = Math.max(intensity * 0.8 + 0.2, 0.3)  // Ensure minimum opacity
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

      if (scale == 'Assembly district') {
        const assemblyData = data['assembly-demographics']
        
        Object.keys(shapes['assembly-districts']).forEach((k) => {
          let color = '#666666'
          let opacity = 0.3

          // Handle assembly district demographics
          if (assemblyData && assemblyData[k] && dataView === 'Demographics') {
            const adData = assemblyData[k]
            const value = adData[selectedIndicator]
            
            if (value !== undefined && value !== null) {
              let intensity = 0

              if (selectedIndicator === 'Population') {
                // Normalize population for ADs (larger than EDs, max ~300k)
                intensity = Math.min(value / 300000, 1)
              } else if (selectedIndicator === 'Median Household Income') {
                // Normalize income (assume range $20k-$200k)
                intensity = Math.min(Math.max((value - 20000) / 180000, 0), 1)
              } else if (selectedIndicator === 'Median Age') {
                // Normalize age (assume range 20-80)
                intensity = Math.min(Math.max((value - 20) / 60, 0), 1)
              } else if (selectedIndicator === 'Renter Units') {
                // Normalize renter rate (0-100 scale)
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

    if (data['progressive-evolution']) {
      if (map.current) {
        if (!map.current.isStyleLoaded()) {
          map.current.once('idle', () => {
            updateSelected()
          })
        } else {
          updateSelected()
        }
      }
    }
  }, [data, selected, selectedIndicator, scale])

  const resetView = () => {
    map.current.flyTo({
      center: [-73.956, 40.7228],
      zoom: 10.4,
    })
  }

  return (
    <>
      {data.status && data.status.error && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, zIndex: 2000 }}>
          <Box
            sx={{ bg: 'rgb(255,255,255,0.9)', width: '100vw', height: '100vh' }}
          >
            <Box
              sx={{
                fontFamily: 'heading',
                lineHeight: '1.2em',
                letterSpacing: 'heading',
                fontSize: [5, 6, 6, 6],
                position: 'absolute',
                textAlign: 'center',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              Sorry, we're currently experiencing technical difficulties
            </Box>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1000,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            borderRadius: [0, '2px', '2px', '2px'],
            bg: 'rgb(255,255,255,0.9)',
            ml: [0, 4, 4, 4],
            mt: [0, 4, 4, 4],
            width: ['calc(100vw)', '400px', '400px', '400px'],
          }}
        >
                  <Results
          data={data}
          selected={selected}
          scale={scale}
          setSelectedIndicator={setSelectedIndicator}
          selectedIndicator={selectedIndicator}
          dataView={dataView}
        />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: [0, 'initial', 'initial', 'initial'],
          top: ['initial', 0, 0, 0],
          right: 0,
        }}
      >
                    <Options
              selectedIndicator={selectedIndicator}
              setSelectedIndicator={setSelectedIndicator}
              dataView={dataView}
              setDataView={setDataView}
              scale={scale}
              setScale={setScale}
            />
      </Box>
      {selectedIndicator && (
        <Box
          sx={{
            position: 'absolute',
            right: ['24px'],
            top: ['380px'],
            zIndex: 5000,
            color: 'black',
            fontSize: [0, 0, 0, 1],
            fontFamily: 'heading',
            textTransform: 'uppercase',
            letterSpacing: 'mono',
            display: ['none', 'block', 'block', 'block'],
          }}
        >
          <Colorbar
            horizontal={true}
            bottom={true}
            colormap={range(0, 1, 0.1).map(
              dataView === 'Demographics' && demographicColorScales[selectedIndicator]
                ? demographicColorScales[selectedIndicator]
                : progressiveColorScales[selectedIndicator] || ((x) => '#1f77b4'),
            )}
            clim={[0, 1]}
            format={(d) => {
              if (dataView === 'Demographics') {
                if (selectedIndicator === 'Median Household Income') {
                  return `$${Math.round(d * 180000 + 20000)}`
                } else if (selectedIndicator === 'Median Age') {
                  return `${Math.round(d * 60 + 20)}`
                } else if (selectedIndicator === 'Population') {
                  return `${Math.round(d * 10000)}`
                } else {
                  return `${Math.round(d * 100)}%`
                }
              } else {
                return `${d * 100}%`
              }
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: [6],
          right: 0,
          zIndex: 1000,
          borderRadius: 2,
          display: ['none', 'initial', 'intial', 'initial'],
        }}
      >
        <Link href='https://socialists.nyc/'>
          <Image
            sx={{ mb: ['-12px'], mr: [5], width: 200 }}
            src='/logos/nycdsa-square-transparent.png'
          />
        </Link>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: ['28px', 6, 6, 6],
          left: ['initial', 0, 0, 0],
          right: [4, 'initial', 'initial', 'initial'],
          zIndex: 1000,
          borderRadius: 2,
        }}
      >
        <Link
          href='https://socialists.nyc/join?source=results'
          sx={{
            textAlign: 'center',
            ml: [2, 5, 5, 5],
            fontSize: [20, 32, 32, 32],
            fontFamily: 'heading',
            bg: 'black',
            borderRadius: '2px',
            color: 'white',
            px: ['10px', '10px', '10px', '10px'],
            pt: [1],
            pb: ['6px'],
            '&:hover': {
              color: 'rgb(200,200,200)',
              textDecoration: 'none',
            },
          }}
        >
          JOIN DSA
        </Link>
      </Box>
      <Box
        id='map'
        sx={{
          touchAction: 'pan-x pan-y',
          userSelect: 'none',
          zIndex: -1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
        }}
      ></Box>
    </>
  )
}

export default Index
