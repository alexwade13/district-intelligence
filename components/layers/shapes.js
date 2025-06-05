const addShapes = (map, key, width) => {
  if (!map.getSource(key)) {
    map.addSource(key, {
      type: 'geojson',
      data: `/shapes/${key}.json`,
    })
  }

  map.addLayer({
    id: `${key}-fill`,
    type: 'fill',
    source: key,
    paint: {
      'fill-color': ['coalesce', ['feature-state', 'color'], '#cccccc'],
      'fill-opacity': ['coalesce', ['feature-state', 'opacity'], 0],
    },
    layout: {
      visibility: 'visible',
    },
  })

  map.addLayer({
    id: `${key}-line`,
    type: 'line',
    source: key,
    paint: {
      'line-color': ['coalesce', ['feature-state', 'line-color'], '#000000'],
      'line-width': ['coalesce', ['feature-state', 'line-width'], width],
    },
    layout: {
      visibility: 'visible',
    },
  })
}

export default addShapes
