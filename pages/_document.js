import Document, { Html, Main, Head, NextScript } from 'next/document'
import { InitializeColorMode } from 'theme-ui'

const title = 'Live election tracker | NYC DSA'
const description =
  'Tracking live election data for races with DSA-endorsed candidates'
const url = 'https://results.socialists.nyc/'
const card = '/public/'

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <title>{title}</title>
          <meta name='description' content={description} />
          <link
            rel='alternate icon'
            type='image/png'
            href='/favicon/nycdsa-red-circle.png'
          />
          <link
            rel='icon'
            type='image/svg+xml'
            href='/favicon/nycdsa-red-circle.svg'
          />
          <meta property='og:title' content={title} />
          <meta property='og:description' content={description} />
          {/*<meta property='og:image' content={card} />*/}
          <meta property='og:url' content={url} />
          <meta name='twitter:title' content={title} />
          <meta name='twitter:description' content={description} />
          {/*<meta name='twitter:image' content={card} />*/}
          <meta name='twitter:card' content='summary_large_image' />
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
