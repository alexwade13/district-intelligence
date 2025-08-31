# District Intelligence

This is a package for scraping data from the NYC Board of Elections and rendering it in a live map of election results. It was originally built to show first round results for the 2025 NYC Democratic Mayoral Primary and District 38 City Council races, both of which featured DSA-endorsed candidates. It may be expanded in the future.

The project consists of scraping tools written in Python and a web app written in Javascript. The web app is built with React, Next.js, maplibre, and D3. The code is organized as follows:

Web app
- `pages`
- `components`
- `data`
- `public`

Scraping
- `scraping`
- `validity`
- `csv-data`

Additionally the `geometry` folder contains code for preprocessing shape files of election districts.

## install and run

To install run the web app locally, first install node (we recommend [nvm](https://github.com/nvm-sh/nvm)), then run

```
npm i
npm run dev
```