import { Box } from 'theme-ui'
import { Select } from './'
import { candidateColors } from '../components/constants'

const Options = ({ selectedCandidate, setSelectedCandidate }) => {
  const allCandidates = Object.keys(candidateColors)

  return (
    <Box sx={{ px: [4], py: [4] }}>
      <Box sx={{ mb: [4] }}>
        <Box
          as='label'
          htmlFor='candidate-select'
          sx={{
            fontSize: [3, 3, 3, 3],
            fontFamily: 'heading',
            letterSpacing: 'heading',
            textTransform: 'uppercase',
          }}
        >
          Filter by Candidate
        </Box>
        <Select
          id='candidate-select'
          value={selectedCandidate}
          onChange={(e) => setSelectedCandidate(e.target.value)}
        >
          <option value='All Candidates'>All Candidates</option>
          {allCandidates.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
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
          value={'Election district'}
        >
          <option value='Election district'>Election district</option>
          <option value='Assembly district'>Assembly district</option>
        </Select>
      </Box>
    </Box>
  )
}

export default Options
