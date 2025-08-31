import { Box } from 'theme-ui'
import { Select } from './'
import { progressiveIndicators, progressiveColors } from '../components/constants'

const Options = ({
  selectedIndicator,
  setSelectedIndicator,
  scale,
  setScale,
}) => {
  const allIndicators = progressiveIndicators['Progressive Evolution']

  return (
    <>

      <Box
        sx={{
          display: ['none', 'block', 'block', 'block'],
          borderRadius: [0, '2px', '2px', '2px'],
          bg: 'rgb(255,255,255,0.9)',
          mr: [0, 4, 4, 4],
          mt: [0, 4, 4, 4],
          width: ['calc(100vw)', '400px', '400px', '400px'],
        }}
      >
        <Box sx={{ px: [4], py: [4] }}>
          <Box sx={{ mb: [4] }}>
            <Box
              as='label'
              htmlFor='indicator-select'
              sx={{
                fontSize: [3, 3, 3, 3],
                fontFamily: 'heading',
                letterSpacing: 'heading',
                textTransform: 'uppercase',
              }}
            >
              Data View
            </Box>
            <Select
              id='indicator-select'
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
            >

              {allIndicators.map((indicator) => (
                <option key={indicator} value={indicator}>
                  {indicator}
                </option>
              ))}
            </Select>
          </Box>
          <Box
            as='label'
            htmlFor='scale-select'
            sx={{
              fontSize: [3, 3, 3, 3],
              fontFamily: 'heading',
              letterSpacing: 'heading',
              textTransform: 'uppercase',
            }}
          >
            Show results by
            <Select
              id='scale-select'
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            >
              <option value='Election district'>Election district</option>
              <option value='Assembly district'>Assembly district</option>
            </Select>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Options
