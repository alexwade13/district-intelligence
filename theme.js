import { base } from '@theme-ui/presets'

const theme = {
  ...base,
  layout: {
    container: {
      px: [3, 4, 5, 6],
      maxWidth: '1920px',
    },
  },
  space: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128, 172, 256, 512],
  fontSizes: [12, 14, 16, 18, 24, 34, 48, 64, 80, 96, 128],
  fontWeights: {
    body: 400,
    heading: 400,
    bold: 800,
  },
  fonts: {
    body: "alegreya",
    heading: 'barlow',
    mono: 'roboto-mono',
  },
  letterSpacings: {
    mono: '1.54px',
    body: 'normal',
    heading: '1.2px'
  },
  colors: {
    ...base.colors,
    text: 'rgb(19, 17, 12)',
    primary: 'rgb(37, 25, 210)',
    secondary: 'rgb(255, 171, 0)',
    tertiary: 'rgb(211, 52, 31)',
    muted: 'rgb(120,118,116)',
    active: 'rgb(70, 68, 66)',
    inactive: 'rgb(150,148,146)',
    background: 'rgb(255,255,255)'
  },
  forms: {
    select: {
      cursor: 'pointer',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      p: [1],
      pl: [0],
      width: '175px',
      mt: [3],
      color: 'text',
      bg: 'background',
      border: 'none',
      borderBottomStyle: 'solid',
      borderBottomWidth: '1px',
      borderBottomColor: 'text',
      borderRadius: '0px',
      fontFamily: 'heading',
      fontSize: [1],
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      letterSpacing: 'body',
    },
    a: {
      color: 'text',
      '&:active': {
        color: 'text',
        textDecoration: 'none'
      },
      '&:hover': {
        color: 'text',
        textDecoration: 'none'
      },
      textDecoration: 'none',
      cursor: 'pointer',
    },
    hr: {
      border: 'none',
      borderStyle: 'solid',
      borderWidth: '0px',
      borderTopWidth: '1px',
      borderColor: 'text',
      opacity: 0.2
    },
    p: {
      fontSize: [1, 1, 1, 2],
      fontFamily: 'body',
      fontWeight: 'body',
      letterSpacing: 'body',
      my: [0],
    },
    h1: {
      fontSize: [5, 5, 5, 6],
      fontFamily: 'heading',
      letterSpacing: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      color: 'text',
      mt: [0],
      mb: [3, 3, 3, 4],
    },
    h2: {
      fontSize: [5, 5, 5, 6],
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: '1.15em',
      mt: [3, 3, 3, 4],
      mb: [2, 2, 2, 3]
    },
    h3: {
      fontSize: [2, 2, 2, 3],
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      letterSpacing: 'mono',
      textTransform: 'uppercase',
      mt: [4, 4, 4, 5],
      mb: [1],
    },
    h4: {
      fontSize: [0, 0, 0, 1],
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      letterSpacing: 'mono',
      textTransform: 'uppercase',
      color: 'muted',
      mt: [4, 4, 4, 4],
      mb: [1],
    },
    ul: {
      fontSize: [4, 4, 4, 5],
      fontFamily: 'body',
      fontWeight: 'body',
      letterSpacing: 'body',
      paddingInlineStart: '22px',
    },
    table: {
      textAlign: 'center',
      borderSpacing: [4],
      fontSize: [3],
      fontFamily: 'monospace',
    },
  },
  config: {
    useColorSchemeMediaQuery: false,
  },
}

export default theme
