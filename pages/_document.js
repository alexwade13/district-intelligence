import Document, { Html, Main, Head, NextScript } from 'next/document'
import { InitializeColorMode } from 'theme-ui'

const title = 'District Intelligence | NYC DSA'
const description =
  'Electoral performance analysis for NYC Assembly districts'
const url = 'https://results.socialists.nyc/'
const card = '/public/'

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta name='description' content={description} />
          <link
            rel='icon'
            type='image/png'
            href='/favicon/nycdsa-red-circle.png'
          />
          <link
            rel='icon'
            type='image/ske vg+xml'
            href='/favicon/nycdsa-red-circle.svg'
          />
          <link rel='mask-icon' href='/favicon/nycdsa-red-circle.svg' />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/favicon/nycdsa-red-circle-180x180.png'
          />
          <meta property='og:title' content={title} />
          <meta property='og:description' content={description} />
          {/*<meta property='og:image' content={card} />*/}
          <meta property='og:url' content={url} />
          <meta name='twitter:title' content={title} />
          <meta name='twitter:description' content={description} />
          {/*<meta name='twitter:image' content={card} />*/}
          <meta name='twitter:card' content='summary_large_image' />
          <style>{`
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          `}</style>
        </Head>
        <body>
          <InitializeColorMode />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
