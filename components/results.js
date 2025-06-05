import { Box } from 'theme-ui'
import { Row, Column } from './'
import { candidateColors } from './constants'
import { formatPercent, formatDate } from './utils'
import { color } from 'd3-color'
import results from '../data/sample'

const Results = ({ selected }) => {
  let totals = {}
  let totalReporting

  if (!selected || !results.districts[selected]) {
    Object.entries(results.districts).forEach((entry) => {
      for (const [candidate, votes] of Object.entries(entry[1].candidates)) {
        totals[candidate] = (totals[candidate] || 0) + votes
      }
    })
    totalReporting = results.reporting
  } else {
    totals = results.districts[selected].candidates
    totalReporting = results.districts[selected].reporting
  }

  const total = Object.values(totals).reduce((a, b) => a + b, 0)
  const sortedTotals = Object.entries(totals).sort((a, b) => b[1] - a[1])

  return (
    <Box
      sx={{
        borderRadius: [0, '2px', '2px', '2px'],
        bg: 'rgb(255,255,255,0.9)',
        ml: [0, 4, 4, 4],
        mt: [0, 4, 4, 4],
        width: ['calc(100vw)', '400px', '400px', '400px'],
      }}
    >
      <Box sx={{ px: [4], py: [4] }}>
        <Box
          sx={{
            fontSize: [3, 3, 3, 3],
            fontFamily: 'heading',
            letterSpacing: 'heading',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          <Box>Election Results</Box>
          {selected && results.districts[selected] && (
            <Box sx={{ ml: 'auto' }}>
              {selected.slice(0, 2)}-{selected.slice(2, 5)}
            </Box>
          )}
        </Box>
        <Box sx={{ mt: [3] }}>
          {sortedTotals.map((k, v) => {
            return (
              <Box key={k} sx={{ mb: [2] }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      height: '6px',
                      zIndex: 1,
                      bottom: '-5px',
                      left: 0,
                      width: `${(100 * k[1]) / total}%`,
                      bg: candidateColors[k[0]],
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
                      }}
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
                      <Box sx={{ color: 'muted' }} as='span'>
                        {' '}
                        ({formatPercent(k[1] / total)})
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
        <Box
          sx={{
            zIndex: 2,
            fontSize: [3, 3, 3, 3],
            mt: [5],
          }}
        >
          <Box sx={{ fontFamily: 'mono', fontSize: [1, 1, 1, 1] }}>
            {formatPercent(totalReporting)} REPORTING
          </Box>
          <Box sx={{ fontFamily: 'mono', fontSize: [1, 1, 1, 1] }}>
            LAST UPDATED {formatDate(results.last_updated)}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Results
