import { useEffect, useState, useRef } from 'react'
import { Box, Container, IconButton, Switch, Image, Link } from 'theme-ui'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Themed } from '@theme-ui/mdx'
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
import { getMaxKey } from '../components/utils'
import { initializeColorScales, createMapInstance, updateDistrictColors } from '../lib/mapHelpers'
import { setupMapEventHandlers, updateLayerVisibility } from '../lib/mapEventHelpers'
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
    const { progressiveColorScales, demographicColorScales } = initializeColorScales(
      progressiveIndicators,
      demographicIndicators,
      progressiveColors,
      demographicColors
    )
    setProgressiveColorScales(progressiveColorScales)
    setDemographicColorScales(demographicColorScales)
  }, [])

  useEffect(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 40em)').matches

    map.current = createMapInstance(isMobile, mapStyles)

    map.current.on('load', () => {
      setup()
    })

    return () => map.current.remove()
  }, [])

  useEffect(() => {
    if (!map.current) return
    return setupMapEventHandlers(
      map.current,
      ['assembly-district', 'election-district'],
      scale,
      setSelected
    )
  }, [scale])

  useEffect(() => {
    if (!map.current) return
    updateLayerVisibility(map.current, scale, scaleLookup)
  }, [scale])

  useEffect(() => {
    if (dataView === 'Progressive Evolution' && !progressiveIndicators['Progressive Evolution'].includes(selectedIndicator)) {
      setSelectedIndicator('Performance Change (2021-2025)')
    } else if (dataView === 'Demographics' && !demographicIndicators['Demographics'].includes(selectedIndicator)) {
      setSelectedIndicator('Population')
    }
  }, [dataView])

  useEffect(() => {
    if (!map.current || !data['progressive-evolution']) return

    const updateColors = () => {
      updateDistrictColors(
        map,
        shapes,
        scale,
        data,
        selectedIndicator,
        dataView,
        { progressive: progressiveColorScales, demographic: demographicColorScales },
        selected,
        scaleLookup,
        evolutionColors
      )
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', () => {
        updateColors()
      })
    } else {
      updateColors()
    }
  }, [data, selected, selectedIndicator, scale, dataView, progressiveColorScales, demographicColorScales])

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
