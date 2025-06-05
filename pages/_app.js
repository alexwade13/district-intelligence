import Head from 'next/head'
import { ThemeUIProvider } from 'theme-ui'
import { base } from '@theme-ui/presets'
import theme from '../theme'
import '../fonts.css'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function App({ Component, pageProps }) {
  return (
    <ThemeUIProvider theme={theme}>
      <Head>
        <title>Turf zones | Zohran for NYC</title>
      </Head>
      <Component {...pageProps} />
    </ThemeUIProvider>
  )
}
