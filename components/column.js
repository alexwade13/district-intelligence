import { Box } from 'theme-ui'

const Column = ({ start, width, children, sx }) => {
  const end = start.map((d, i) => {
    if (d == 'auto') return 'auto'
    return d + width[i]
  })

  return (
    <Box sx={{ gridColumnStart: start, gridColumnEnd: end, ...sx }}>
      {children}
    </Box>
  )
}

export default Column
