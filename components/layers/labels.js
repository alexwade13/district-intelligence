const addLabels = (map) => {
  if (!map.getSource('openmaptiles')) {
    map.addSource('openmaptiles', {
      type: 'vector',
      url: 'https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=Hja3c1GFKU3rNXLE62TK',
    })
  }

  map.addLayer({
    id: 'road-labels',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'transportation_name',
    minzoom: 11,
    maxzoom: 22,
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': ['step', ['zoom'], 250, 20, 600, 21, 1100],
      'text-anchor': 'center',
      'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
      'text-font': ['Open Sans Regular', 'Noto Sans Regular'],
      'text-offset': [0, 0],
      'text-size': {
        base: 1,
        stops: [
          [14, 9],
          [18, 13],
        ],
      },
      visibility: 'visible',
    },
    paint: {
      'text-color': 'hsl(0, 0%, 10%)',
      'text-halo-color': 'hsla(0, 0%, 100%, 0.97)',
      'text-halo-width': 1,
    },
    filter: ['all', ['!=', 'class', 'ferry']],
  })

  map.addLayer({
    id: 'city-labels',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    minzoom: 4,
    maxzoom: 14,
    layout: {
      'symbol-sort-key': ['to-number', ['get', 'rank']],
      'text-anchor': 'bottom',
      'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
      'text-font': ['Open Sans Semibold', 'Noto Sans Regular'],
      'text-max-width': 8,
      'text-offset': [0, 0],
      'text-size': {
        base: 1.2,
        stops: [
          [4, 11],
          [15, 16],
        ],
      },
      visibility: 'visible',
    },
    paint: {
      'text-color': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        6,
        'hsl(0, 0%, 41%)',
        14,
        'hsl(0, 0%, 22%)',
      ],
      'text-halo-color': 'hsla(0, 0%, 100%, 0.8)',
      'text-halo-width': 1,
    },
    metadata: {},
    filter: ['all', ['==', 'class', 'city']],
  })

  map.addLayer({
    id: 'town-labels',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    minzoom: 6,
    layout: {
      'symbol-sort-key': ['to-number', ['get', 'rank']],
      'text-anchor': 'bottom',
      'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
      'text-font': ['Open Sans Semibold', 'Noto Sans Regular'],
      'text-max-width': 8,
      'text-offset': [0, 0],
      'text-size': {
        base: 1.2,
        stops: [
          [7, 10],
          [11, 13],
        ],
      },
      visibility: 'visible',
    },
    paint: {
      'text-color': 'hsl(0, 0%, 28%)',
      'text-halo-color': 'hsla(0, 0%, 100%, 0.8)',
      'text-halo-width': 1.2,
    },
    metadata: {},
    filter: ['all', ['==', 'class', 'town']],
  })

  map.addLayer({
    id: 'house-number-labels',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'housenumber',
    minzoom: 17,
    layout: {
      'symbol-avoid-edges': false,
      'text-allow-overlap': false,
      'text-field': '{housenumber}',
      'text-font': ['Noto Sans Regular'],
      'text-ignore-placement': false,
      'text-line-height': -0.15,
      'text-padding': 3,
      'text-size': {
        stops: [
          [17, 9],
          [22, 11],
        ],
      },
    },
    paint: {
      'text-color': 'hsl(0, 0%, 28%)',
      'text-halo-color': 'hsla(0, 0%, 100%, 0.8)',
      'text-halo-width': 1,
    },
  })

  map.addLayer({
    id: 'other-labels',
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': 'place',
    minzoom: 8,
    layout: {
      'symbol-sort-key': ['to-number', ['get', 'rank']],
      'symbol-spacing': 150,
      'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
      'text-font': ['Open Sans Semibold', 'Noto Sans Regular'],
      'text-max-width': 10,
      'text-size': {
        base: 1.2,
        stops: [
          [11, 10],
          [14, 14],
          [18, 16],
        ],
      },
      'text-transform': 'none',
      visibility: 'visible',
    },
    paint: {
      'text-color': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        12.5,
        'hsl(0, 0%, 22%)',
        12.6,
        'hsl(0, 0%, 52%)',
      ],
      'text-halo-blur': 0,
      'text-halo-color': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        11,
        'hsla(0, 0%, 100%, 0.6)',
        13,
        'hsl(0, 0%, 100%)',
      ],
      'text-halo-width': {
        stops: [
          [8, 0.8],
          [13, 1.5],
        ],
      },
    },
    metadata: {},
    filter: [
      'all',
      [
        'in',
        'class',
        'hamlet',
        'island',
        'islet',
        'neighbourhood',
        'suburb',
        'place',
      ],
    ],
  })
}

export default addLabels
