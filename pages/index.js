import { useEffect, useState, useRef } from 'react'
import { Box, Container, IconButton, Switch } from 'theme-ui'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Themed } from '@theme-ui/mdx'
import maplibregl from 'maplibre-gl'
import { Row, Column, Input, Autocomplete, Results } from '../components'
import { addLabels, addShapes } from '../components/layers'
import {
  handleShapeClick,
  handleShapeClickOff,
  handleShapeMouseMove,
  handleShapeMouseMoveoff,
  getMaxKey,
} from '../components/utils'
import { googleProtocol, createGoogleStyle } from 'maplibre-google-maps'
import {
  boroughColors,
  candidateColors,
  mapStyles,
} from '../components/constants'
import shapes from '../data'
import results from '../data/sample'

const Index = () => {
  const map = useRef()
  const [selected, setSelected] = useState()
  const [showRegions, setShowRegions] = useState()

  const setup = () => {
    addShapes(map.current, 'districts', 0.5)
    addLabels(map.current)
    handleShapeClick(map.current, 'districts', 'district', setSelected)
    handleShapeClickOff(map.current, 'districts', 'district', setSelected)
    handleShapeMouseMove(map.current, 'districts', 'district')
    handleShapeMouseMoveoff(map.current)
  }

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: 'map',
      style: mapStyles.monochrome,
      center: [-73.956, 40.7228],
      zoom: 10.4,
      minZoom: 10,
    })

    map.current.on('load', () => {
      setup()
    })

    return () => map.current.remove()
  }, [])

  useEffect(() => {
    const updateSelected = () => {
      Object.keys(shapes['districts']).forEach((k) => {
        map.current.setFeatureState(
          { source: 'districts', id: shapes['districts'][k].id },
          {
            color: candidateColors[getMaxKey(results.districts[k].candidates)],
            opacity: results.districts[k].reporting > 0.3 ? 1 : 0,
            'line-width': 0.5,
          },
        )
      })

      if (selected && shapes['districts'][selected]) {
        map.current.setFeatureState(
          { source: 'districts', id: shapes['districts'][selected].id },
          {
            color:
              candidateColors[
                getMaxKey(results.districts[selected].candidates)
              ],
            opacity: results.districts[selected].reporting > 0.3 ? 1 : 0,
            'line-width': 1.5,
          },
        )
      }
    }

    if (map.current) {
      if (!map.current.isStyleLoaded()) {
        map.current.once('idle', () => {
          updateSelected()
        })
      } else {
        updateSelected()
      }
    }
  }, [selected])

  // const zoomTo = () => {
  //   if (selected) {
  //     const bounds = new maplibregl.LngLatBounds()

  //     let id
  //     zones.features.forEach((feature) => {
  //       if (feature.properties.zone == selected) {
  //         const coords = feature.geometry.coordinates
  //         id = feature.id
  //         if (feature.geometry.type === 'Polygon') {
  //           coords[0].forEach((c) => bounds.extend(c))
  //         } else if (feature.geometry.type === 'MultiPolygon') {
  //           coords.forEach((poly) => {
  //             poly[0].forEach((c) => bounds.extend(c))
  //           })
  //         }
  //       }
  //     })

  //     map.current.fitBounds(bounds, { padding: 150, animate: false })
  //   }
  // }

  const resetView = () => {
    map.current.flyTo({
      center: [-73.956, 40.7228],
      zoom: 10.4,
    })
  }

  return (
    <>
      <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
        {/*<Autocomplete
          selected={selected}
          setSelected={setSelected}
          zoomTo={zoomTo}
        />*/}
        <Results selected={selected} />
      </Box>
      <Box
        id='map'
        sx={{
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
