import { Input as ThemeInput } from 'theme-ui'
import { Box } from 'theme-ui'

const Input = ({ sx, ...props }) => {
  return (
    <ThemeInput
      sx={{
        border: 'none',
        borderBottom: '1px solid',
        borderRadius: 0,
        borderColor: 'text',
        fontFamily: 'body',
        paddingLeft: 0,
        marginTop: '-4px',
        paddingBottom: '4px',
        '&:focus': {
          outline: 'none',
          borderColor: 'text',
        },
        ...sx,
      }}
      {...props}
    />
  )
}

export default Input
