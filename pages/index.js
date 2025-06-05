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
  const [selectedCandidate, setSelectedCandidate] = useState('All Candidates')
  const [showRegions, setShowRegions] = useState()
  
  // Get unique list of candidates
  const allCandidates = Object.keys(candidateColors)

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
        const districtResults = results.districts[k]
        let color = '#cccccc'
        let opacity = 0
        
        if (selectedCandidate === 'All Candidates') {
          // Show leading candidate for each district
          const leadingCandidate = getMaxKey(districtResults.candidates)
          if (leadingCandidate) {
            color = candidateColors[leadingCandidate] || '#cccccc'
            opacity = 0.3 + (districtResults.reporting * 0.7) // Scale opacity based on reporting
          }
        } else if (districtResults.candidates[selectedCandidate] !== undefined) {
          // Show only the selected candidate's results
          const totalVotes = Object.values(districtResults.candidates).reduce((a, b) => a + b, 0)
          const candidateVoteShare = totalVotes > 0 
            ? districtResults.candidates[selectedCandidate] / totalVotes 
            : 0
        
          // Show the candidate's color with opacity based on vote share and reporting
          color = candidateColors[selectedCandidate] || '#cccccc'
          opacity = 0.3 + (candidateVoteShare * 0.7 * districtResults.reporting)
        }
        // If candidate not in district, keep opacity at 0 (invisible)


        map.current.setFeatureState(
          { source: 'districts', id: shapes['districts'][k].id },
          {
            color,
            opacity,
            'line-width': selected === k ? 1.5 : 0.5,
          }
        )
      })
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
  }, [selected, selectedCandidate])

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
      <Box sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1000, p: 3, bg: 'background', borderRadius: 2, m: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <label htmlFor="candidate-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Filter by Candidate:</label>
          <select
            id="candidate-select"
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '250px',
              fontSize: '16px',
              backgroundColor: 'white',
            }}
          >
            <option value="All Candidates">All Candidates</option>
            {allCandidates.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </Box>
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
