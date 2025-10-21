import { Box } from 'theme-ui'
import { Select } from './'
import { progressiveIndicators, demographicIndicators, allIndicators, progressiveColors, demographicColors } from '../components/constants'

const Options = ({
  selectedIndicator,
  setSelectedIndicator,
  scale,
  setScale,
  dataView,
  setDataView,
}) => {
  const currentIndicators = allIndicators[dataView] || progressiveIndicators['Progressive Evolution']
  const currentColors = dataView === 'Demographics' ? demographicColors : progressiveColors

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
          {/* Temporarily hidden - Progressive Evolution data type 
          <Box sx={{ mb: [4] }}>
            <Box
              as='label'
              htmlFor='data-view-select'
              sx={{
                fontSize: [3, 3, 3, 3],
                fontFamily: 'heading',
                letterSpacing: 'heading',
                textTransform: 'uppercase',
              }}
            >
              Data Type
            </Box>
            <Select
              id='data-view-select'
              value={dataView}
              onChange={(e) => setDataView(e.target.value)}
            >
              <option value='Progressive Evolution'>Progressive Evolution</option>
              <option value='Demographics'>Demographics</option>
            </Select>
          </Box>
          */}
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
              {currentIndicators.map((indicator) => (
                <option key={indicator} value={indicator}>
                  {indicator}
                </option>
              ))}
            </Select>
          </Box>
          {/* Scale selector temporarily hidden - only showing Assembly districts
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
              <option value='Assembly district'>Assembly district</option>
            </Select>
          </Box>
          */}
        </Box>
      </Box>
    </>
  )
}

export default Options
