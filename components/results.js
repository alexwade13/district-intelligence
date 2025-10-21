import { useState } from 'react'
import { Box, IconButton } from 'theme-ui'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Row, Column } from './'
import { progressiveColors, scaleLookup } from './constants'
import { formatPercent, formatDate } from './utils'
import { color } from 'd3-color'


const Results = ({ data, selected, setSelectedIndicator, scale, selectedIndicator, dataView }) => {
  const [showResults, setShowResults] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.matchMedia('(max-width: 40em)').matches
    }
    return true
  })

  const evolutionData = data['progressive-evolution']
  const demographicData = data['demographics']

  if (dataView === 'Demographics' && !demographicData) {
    return (
      <>
        <Box sx={{ px: [4], py: [4] }}>
          <Box
            sx={{
              fontSize: [3, 3, 3, 3],
              fontFamily: 'heading',
              letterSpacing: 'heading',
              display: 'flex',
              mb: [2],
            }}
          >
            LOADING DEMOGRAPHIC DATA...
          </Box>
        </Box>
      </>
    )
  }

  if (dataView === 'Progressive Evolution' && !evolutionData) {
    return (
      <>
        <Box sx={{ px: [4], py: [4] }}>
          <Box
            sx={{
              fontSize: [3, 3, 3, 3],
              fontFamily: 'heading',
              letterSpacing: 'heading',
              display: 'flex',
              mb: [2],
            }}
          >
            LOADING EVOLUTION DATA...
          </Box>
        </Box>
      </>
    )
  }

  if (dataView === 'Demographics') {
    const assemblyData = data['assembly-demographics']
    
    if (!assemblyData) {
      return (
        <>
          <Box sx={{ px: [4], py: [4] }}>
            <Box sx={{ fontSize: [3], fontFamily: 'heading', letterSpacing: 'heading' }}>
              LOADING DEMOGRAPHIC DATA...
            </Box>
          </Box>
        </>
      )
    }
    
    let thisSelected = selected[scaleLookup[scale]]
    const districtData = thisSelected ? assemblyData[thisSelected] : null

    const fieldMap = {
      'Population': 'Population',
      'Median Household Income': 'Median Household Income',
      'Median Age': 'Median Age',
      'Renter Units': 'Renter Units',
    }

    const formatDemographicValue = (key, value) => {
      if (value === undefined || value === null || value === 0) return 'N/A'
      
      switch(key) {
        case 'Population':
          return value.toLocaleString()
        case 'Median Household Income':
          return '$' + Math.round(value).toLocaleString()
        case 'Median Age':
          return value.toFixed(1) + ' years'
        case 'Renter Units':
          return value.toFixed(1) + '%'
        default:
          return value
      }
    }

    return (
      <>
        <Box sx={{ px: [4], py: [4] }}>
          <Box
            sx={{
              fontSize: [3, 3, 3, 3],
              fontFamily: 'heading',
              letterSpacing: 'heading',
              display: 'flex',
              mb: [2],
            }}
          >
            <Box sx={{ textTransform: 'uppercase' }}>
              Demographic Data
            </Box>
            {thisSelected && districtData && (
              <Box
                sx={{
                  ml: 'auto',
                }}
              >
                AD {thisSelected}
              </Box>
            )}
            {!thisSelected && (
              <Box
                sx={{
                  ml: 'auto',
                  display: ['none', 'initial', 'initial', 'initial'],
                  textTransform: 'intial',
                }}
              >
                ALL ADS
              </Box>
            )}
            <IconButton
              onClick={() => setShowResults((prev) => !prev)}
              sx={{
                cursor: 'pointer',
                ml: 'auto',
                mt: ['-5px', -2, -2, -2],
                display: ['initial', 'none', 'none', 'none'],
              }}
            >
              {showResults && <ChevronUp size={28} />}
              {!showResults && <ChevronDown size={28} />}
            </IconButton>
          </Box>
          <Box sx={{ display: showResults ? 'initial' : 'none', mt: [4] }}>
            {districtData ? (
              <>
                {Object.entries(fieldMap).map(([displayName, fieldName]) => (
                  <Box key={displayName} sx={{ mb: [3] }}>
                    <Box sx={{ fontSize: [2], fontWeight: 'bold', mb: [1] }}>
                      {displayName}:
                    </Box>
                    <Box sx={{ fontSize: [3], fontFamily: 'mono', pl: [2] }}>
                      {formatDemographicValue(displayName, districtData[fieldName])}
                    </Box>
                  </Box>
                ))}
              </>
            ) : (
              <Box sx={{ fontSize: [2], color: '#666', fontStyle: 'italic', mt: [2] }}>
                Click on an assembly district to view demographic data
              </Box>
            )}
          </Box>
          <Box
            sx={{
              zIndex: 2,
              fontSize: [3, 3, 3, 3],
              mt: [4],
              display: [showResults ? 'block' : 'none'],
            }}
          >
            <Box sx={{ fontFamily: 'mono', fontSize: [1, 1, 1, 1] }}>
              DATA SOURCE: US Census Bureau ACS 5-Year Estimates
            </Box>
          </Box>
        </Box>
      </>
    )
  }

  if (evolutionData) {
    let totals = {}
    let totalReporting
    let thisSelected = selected[scaleLookup[scale]]
    let evolutionStats = null

    if (evolutionData) {
      if (thisSelected && evolutionData[thisSelected]) {
        // Show specific district data
        evolutionStats = evolutionData[thisSelected]
        if (evolutionStats && typeof evolutionStats === 'object') {
          const wiley2021 = evolutionStats.progressive2021 !== undefined ? evolutionStats.progressive2021.toFixed(2) : '0.00'
          const mamdani2025 = evolutionStats.progressive2025 !== undefined ? evolutionStats.progressive2025.toFixed(2) : '0.00'
          const growthPoints = evolutionStats.growthPoints !== undefined ? evolutionStats.growthPoints.toFixed(2) : '0.00'
          const growthPercent = evolutionStats.growthPercent !== undefined ? evolutionStats.growthPercent.toFixed(2) : '0.00'
          
          totals = {
            [`Maya Wiley 2021: ${wiley2021}%`]: evolutionStats.votes2021 || 0,
            [`Zohran Mamdani 2025: ${mamdani2025}%`]: evolutionStats.votes2025 || 0,
          }
          
          evolutionStats.displayGrowthPoints = growthPoints
          evolutionStats.displayGrowthPercent = growthPercent
          totalReporting = 1.0
        }
      } else {
        // Show overall Assembly District data (aggregate all election districts)
        const allDistricts = Object.values(evolutionData)
        let totalVotes2021 = 0
        let totalVotes2025 = 0
        let totalPercentage2021 = 0
        let totalPercentage2025 = 0
        let validDistricts = 0
        
        allDistricts.forEach(district => {
          if (district && district.votes2021 !== undefined && district.votes2025 !== undefined) {
            totalVotes2021 += district.votes2021 || 0
            totalVotes2025 += district.votes2025 || 0
            totalPercentage2021 += district.progressive2021 || 0
            totalPercentage2025 += district.progressive2025 || 0
            validDistricts++
          }
        })
        
        if (validDistricts > 0) {
          const avgPercentage2021 = (totalPercentage2021 / validDistricts).toFixed(2)
          const avgPercentage2025 = (totalPercentage2025 / validDistricts).toFixed(2)
          const avgGrowthPoints = (avgPercentage2025 - avgPercentage2021).toFixed(2)
          const avgGrowthPercent = avgPercentage2021 > 0 ? (((avgPercentage2025 - avgPercentage2021) / avgPercentage2021) * 100).toFixed(2) : '0.00'
          
          totals = {
            [`Maya Wiley 2021 (Avg): ${avgPercentage2021}%`]: totalVotes2021,
            [`Zohran Mamdani 2025 (Avg): ${avgPercentage2025}%`]: totalVotes2025,
          }
          
          // Create a temporary stats object for overall display
          evolutionStats = {
            displayGrowthPoints: avgGrowthPoints,
            displayGrowthPercent: avgGrowthPercent
          }
          totalReporting = 1.0
        }
      }
    }

    const total = Object.values(totals).reduce((a, b) => a + b, 0)
    const sortedTotals = Object.entries(totals).sort((a, b) => b[1] - a[1])

    return (
      <>
        <Box sx={{ px: [4], py: [4] }}>
          <Box
            sx={{
              fontSize: [3, 3, 3, 3],
              fontFamily: 'heading',
              letterSpacing: 'heading',
              display: 'flex',
              mb: [2],
            }}
          >
            <Box sx={{ textTransform: 'uppercase' }}>
              Electoral Performance Analysis
            </Box>
            {thisSelected && evolutionData && evolutionData[thisSelected] && (
                <Box
                  sx={{
                    ml: 'auto',
                  }}
                >
                  {scale == 'Assembly district'
                    ? `AD ${thisSelected}`
                    : `ED ${thisSelected.slice(0, 2)}-${thisSelected.slice(2, 5)}`}
                </Box>
              )}
            {!(thisSelected && evolutionData && evolutionData[thisSelected]) && (
              <Box
                sx={{
                  ml: 'auto',
                  display: ['none', 'initial', 'initial', 'initial'],
                  textTransform: 'intial',
                }}
              >
                ALL {scale == 'Assembly district' ? 'ADS' : 'EDS'}
              </Box>
            )}
            <IconButton
              onClick={() => setShowResults((prev) => !prev)}
              sx={{
                cursor: 'pointer',
                ml: 'auto',
                mt: ['-5px', -2, -2, -2],
                display: ['initial', 'none', 'none', 'none'],
              }}
            >
              {showResults && <ChevronUp size={28} />}
              {!showResults && <ChevronDown size={28} />}
            </IconButton>
          </Box>
          <Box sx={{ display: showResults ? 'initial' : 'none', mt: [4] }}>
            {sortedTotals && sortedTotals.length > 0 && sortedTotals.map((k, v) => {
              return (
                <Box key={k[0]} sx={{ mb: [2] }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        height: '6px',
                        zIndex: 1,
                        bottom: '-5px',
                        left: 0,
                        width: `${(100 * k[1]) / total}%`,
                        bg: k[0].includes('Maya Wiley') ? '#ff6600' : 
                             k[0].includes('Zohran Mamdani') ? '#cc0000' : '#cc0000',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        height: '6px',
                        zIndex: 0,
                        bottom: '-5px',
                        left: 0,
                        width: `100%`,
                        bg: 'rgb(220,220,220)',
                      }}
                    />
                    <Box sx={{ display: 'flex' }}>
                      <Box
                        sx={{
                          zIndex: 2,
                          fontSize: [3, 3, 3, 3],
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedIndicator(k[0])}
                      >
                        {k[0]}
                      </Box>
                      <Box
                        sx={{
                          ml: 'auto',
                          mt: '4px',
                          fontSize: [1, 1, 1, 1],
                          fontFamily: 'mono',
                          letterSpacing: 'mono',
                          pl: '4px',
                          pr: '4px',
                        }}
                      >
                        {k[1]}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
            })}

            {evolutionStats && thisSelected && (
              <Box sx={{ mt: [3], pt: [3], borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: [2] }}>
                  <Box sx={{ fontSize: [2], fontWeight: 'bold' }}>
                    Growth Points:
                  </Box>
                  <Box sx={{ fontSize: [2], fontFamily: 'mono' }}>
                    +{evolutionStats.displayGrowthPoints}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ fontSize: [2], fontWeight: 'bold' }}>
                    Growth Rate:
                  </Box>
                  <Box sx={{ fontSize: [2], fontFamily: 'mono' }}>
                    +{evolutionStats.displayGrowthPercent}%
                  </Box>
                </Box>
              </Box>
            )}

            {(() => {
              const getMethodologyContent = () => {
                switch(selectedIndicator) {
                  case 'Performance Change (2021-2025)':
                    return {
                      title: 'Growth Categories',
                      content: (
                        <>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Data Sources:</strong> Maya Wiley 2021 vs. Zohran Mamdani 2025 mayoral primary results
                          </Box>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Calculation:</strong> Growth Points = 2025% - 2021%
                          </Box>
                          <Box sx={{ fontSize: [1] }}>
                            <strong>Categories:</strong>
                            <br />Major Growth: +10 points or more
                            <br />Growth: 0 to +10 points  
                            <br />Decline: -10 to 0 points
                            <br />Major Decline: -10 points or more
                          </Box>
                        </>
                      )
                    }
                  case 'Maya Wiley 2021 Baseline':
                    return {
                      title: '2021 Baseline Performance',
                      content: (
                        <>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Data Source:</strong> 2021 NYC mayoral primary election results
                          </Box>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Candidate:</strong> Maya D. Wiley
                          </Box>
                          <Box sx={{ fontSize: [1] }}>
                            <strong>Visualization:</strong> Color intensity represents vote percentage in each Election District
                          </Box>
                        </>
                      )
                    }
                  case 'Zohran Mamdani 2025 Current':
                    return {
                      title: '2025 Current Performance',
                      content: (
                        <>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Data Source:</strong> 2025 NYC mayoral primary election results
                          </Box>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Candidate:</strong> Zohran Kwame Mamdani
                          </Box>
                          <Box sx={{ fontSize: [1] }}>
                            <strong>Visualization:</strong> Color intensity represents vote percentage in each Election District
                          </Box>
                        </>
                      )
                    }
                  case 'Growth Percentage':
                    return {
                      title: 'Relative Growth Rate',
                      content: (
                        <>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Data Sources:</strong> Maya Wiley 2021 vs. Zohran Mamdani 2025 results
                          </Box>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Calculation:</strong> ((2025% - 2021%) / 2021%) × 100
                          </Box>
                          <Box sx={{ fontSize: [1] }}>
                            <strong>Shows:</strong> Percentage change relative to 2021 baseline
                          </Box>
                        </>
                      )
                    }
                  case 'Vote Share Change':
                    return {
                      title: 'Absolute Vote Share Change',
                      content: (
                        <>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Data Sources:</strong> Maya Wiley 2021 vs. Zohran Mamdani 2025 results
                          </Box>
                          <Box sx={{ fontSize: [1], mb: [2] }}>
                            <strong>Calculation:</strong> 2025% - 2021% (absolute point difference)
                          </Box>
                          <Box sx={{ fontSize: [1] }}>
                            <strong>Visualization:</strong> Color intensity represents magnitude of change
                          </Box>
                        </>
                      )
                    }
                  default:
                    return {
                      title: 'Methodology',
                      content: (
                        <Box sx={{ fontSize: [1] }}>
                          Election data comparison between 2021 and 2025 NYC mayoral primaries
                        </Box>
                      )
                    }
                }
              }
              
              const methodology = getMethodologyContent()
              
              return (
                <Box sx={{ mt: [4], p: [3], bg: '#f0f8ff', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <Box sx={{ fontSize: [2], fontWeight: 'bold', mb: [2], color: '#2c5282' }}>
                    {methodology.title}
                  </Box>
                  {methodology.content}
                </Box>
              )
            })()}

          </Box>
          <Box
            sx={{
              zIndex: 2,
              fontSize: [3, 3, 3, 3],
              mt: [4],
              display: [showResults ? 'block' : 'none'],
            }}
          >
            <Box sx={{ fontFamily: 'mono', fontSize: [1, 1, 1, 1] }}>
              DATA SOURCE: NYC BOE 2021 & 2025 CVR
            </Box>
          </Box>
        </Box>
      </>
    )
  }
}

export default Results
