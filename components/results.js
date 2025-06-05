import { Box } from 'theme-ui'
import { Row, Column } from './'
import { candidateColors } from './constants'
import { formatPercent } from './utils'
import results from '../data/sample'

const Results = ({ selected }) => {
  let totals = {}

  if (!selected || !results[selected]) {
    Object.entries(results).forEach((entry) => {
      for (const [candidate, votes] of Object.entries(entry[1].candidates)) {
        totals[candidate] = (totals[candidate] || 0) + votes
      }
    })
  } else {
    totals = results[selected].candidates
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
          }}
        >
          Election Results
        </Box>
        <Box sx={{ mt: [3] }}>
          {sortedTotals.map((k, v) => {
            return (
              <Row key={k} sx={{ mb: [1] }}>
                <Column start={[1]} width={[9]}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        height: '4px',
                        zIndex: 0,
                        bottom: '-2px',
                        left: 0,
                        width: `${(100 * k[1]) / total}%`,
                        bg: candidateColors[k[0]],
                      }}
                    />
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        fontSize: [3, 3, 3, 3],
                      }}
                    >
                      {k[0]}
                    </Box>
                  </Box>
                </Column>
                <Column start={[10]} width={[3]}>
                  <Box
                    sx={{
                      mt: '2px',
                      textAlign: 'right',
                      fontSize: [2, 2, 2, 2],
                      fontFamily: 'mono',
                      letterSpacing: 'mono',
                    }}
                  >
                    {k[1]}
                  </Box>
                </Column>
              </Row>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default Results
