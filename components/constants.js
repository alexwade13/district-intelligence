export const boroughColors = {
  'The Bronx': '#ff9999',
  Queens: '#ff7777', 
  Manhattan: '#ff5555',
  'Staten Island': '#ff3333',
  Brooklyn: '#ff1111',
}

export const boroughColorsDarker = {
  'The Bronx': '#cc0000',
  Queens: '#b30000',
  Manhattan: '#990000',
  'Staten Island': '#800000',
  Brooklyn: '#660000',
}

export const progressiveColors = {
  'Progressive Growth (2021-2025)': '#00ff00',
  'Maya Wiley 2021 Baseline': '#ff6600',
  'Zohran Mamdani 2025 Current': '#cc0000',
  'Growth Percentage': '#32cd32',
  'Vote Share Change': '#00ff7f',
  'Moderate/Conservative': '#708090',
}

export const evolutionColors = {
  'Major Growth': '#006400',
  'Growth': '#32cd32',
  'Stable': '#ffd700',
  'Decline': '#ff8c00',
  'Major Decline': '#ff0000',
}

export const progressiveIndicators = {
  'Progressive Evolution': [
    'Progressive Growth (2021-2025)',
    'Maya Wiley 2021 Baseline',
    'Zohran Mamdani 2025 Current',
    'Growth Percentage',
    'Vote Share Change',
  ],
}

export const analysisLookup = {
  'Progressive Evolution': 'progressive-evolution',
}

const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY

export const mapStyles = {
  color: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
  monochrome: `https://api.maptiler.com/maps/basic-v2/style.json?key=${maptilerKey}`,
}

export const scaleLookup = {
  'Assembly district': 'assembly-district',
  'Election district': 'election-district',
}
