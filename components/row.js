import { Grid } from 'theme-ui'

const Row = ({ columns = [12, 12, 12, 12], children, sx }) => {
  return (
    <Grid
      columns={columns}
      sx={{ columnGap: [1, 5, 5, 5], rowGap: [0], ...sx }}
    >
      {children}
    </Grid>
  )
}

export default Row
