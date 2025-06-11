import shapes from '../data'

export const handleShapeClick = (map, id, key, setSelected) => {
  map.on('click', `${id}-fill`, (e) => {
    const selected = String(e.features[0].properties[key])
    setSelected(selected)
  })
}

export const handleShapeClickOff = (map, id, key, setSelected) => {
  map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [`${id}-fill`],
    })

    if (features.length === 0) {
      setSelected()
    }
  })
}

export const handleShapeMouseMove = (map, id, key) => {
  map.on('mousemove', `${id}-fill`, (e) => {
    if (Object.keys(shapes[id]).includes(e.features[0].properties[key])) {
      map.getCanvas().style.cursor = 'pointer'
    } else {
      map.getCanvas().style.cursor = ''
    }
  })
}

export const handleShapeMouseMoveoff = (map) => {
  map.on('mousemove', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['election-districts-fill'],
    })
    if (features.length === 0) {
      map.getCanvas().style.cursor = ''
    }
  })
}

export const createGoogleStyle = (id, mapType, key, mapId) => {
  const style = {
    version: 8,
    sources: {},
    layers: [
      {
        id: id,
        type: 'raster',
        source: id,
      },
    ],
  }
  style.sources[id] = {
    type: 'raster',
    tiles: [`google://${mapType}/{z}/{x}/{y}?key=${key}`],
    tileSize: 256,
    attribution: '&copy; Google Maps',
    maxzoom: 19,
  }
  return style
}

export const getMaxValue = (obj) => {
  return getMax(obj).value
}

export const getMaxKey = (obj) => {
  return getMax(obj).key
}

export const getMax = (obj) => {
  const max = Object.entries(obj).reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: null, value: -Infinity },
  )

  return max
}

export const formatPercent = (v) => {
  return String(Math.round(v * 100)).padStart(2, '0') + '%'
}

export const formatDate = (date) => {
  date = new Date(date)
  return date.toLocaleTimeString()
}
