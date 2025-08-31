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
  progressiveColors,
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
  const [selectedIndicator, setSelectedIndicator] = useState('Progressive Growth (2021-2025)')
  const [scale, setScale] = useState('Election district')
  const [progressiveColorScales, setProgressiveColorScales] = useState({})

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

    setProgressiveColorScales(progressiveColorScales)
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
    if (!progressiveIndicators['Progressive Evolution'].includes(selectedIndicator)) {
      setSelectedIndicator('Progressive Growth (2021-2025)')
    }
  }, [])

  useEffect(() => {
    const updateSelected = () => {
      if (scale == 'Election district') {
        Object.keys(shapes['election-districts']).forEach((k) => {
          let color = '#cccccc'
          let opacity = 0

          const evolutionData = data['progressive-evolution']
          const edData = evolutionData ? evolutionData[k] : null
          
          if (edData) {
            if (selectedIndicator === 'Progressive Growth (2021-2025)') {
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
        Object.keys(shapes['assembly-districts']).forEach((k) => {
          let color = '#666666'
          let opacity = 0.3

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
              scale={scale}
              setScale={setScale}
            />
      </Box>
      {selectedIndicator && progressiveColorScales[selectedIndicator] && (
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
              progressiveColorScales[selectedIndicator],
            )}
            clim={[0, 1]}
            format={(d) => `${d * 100}%`}
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
