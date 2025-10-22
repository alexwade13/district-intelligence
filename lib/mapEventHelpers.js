import {
  createShapeMouseMoveHandler,
  createShapeMouseMoveOffHandler,
  createShapeClickHandler,
  createShapeClickOffHandler,
  updateShapeVisibility,
} from '../components/utils'

export const setupMapEventHandlers = (map, layers, scale, setSelected) => {
  if (!map) return () => {}

  const handlers = {}

  layers.forEach((layer) => {
    handlers[layer] = {}
    handlers[layer].move = createShapeMouseMoveHandler(map, layer)
    handlers[layer].moveOff = createShapeMouseMoveOffHandler(map)
    handlers[layer].click = createShapeClickHandler(map, layer, setSelected)
    handlers[layer].clickOff = createShapeClickOffHandler(map, layer, setSelected)

    const addHandlers = () => {
      map.on('mousemove', `${layer}s-fill`, handlers[layer].move)
      map.on('click', `${layer}s-fill`, handlers[layer].click)
      map.on('mousemove', handlers[layer].moveOff)
      map.on('click', handlers[layer].clickOff)
    }

    if (!map.isStyleLoaded()) {
      map.once('idle', () => {
        addHandlers()
      })
    } else {
      addHandlers()
    }
  })

  return () => {
    layers.forEach((layer) => {
      map.off('mousemove', `${layer}s-fill`, handlers[layer].move)
      map.off('click', `${layer}s-fill`, handlers[layer].click)
      map.off('mousemove', handlers[layer].moveOff)
      map.off('click', handlers[layer].clickOff)
    })
  }
}

export const updateLayerVisibility = (map, scale, scaleLookup) => {
  if (!map) return

  const update = () => {
    const layers = ['election-district', 'assembly-district']

    updateShapeVisibility(map, `${scaleLookup[scale]}s`, 'visible')

    layers.forEach((l) => {
      if (l !== scaleLookup[scale]) {
        updateShapeVisibility(map, `${l}s`, 'none')
      }
    })
  }

  if (!map.isStyleLoaded()) {
    map.once('idle', () => {
      update()
    })
  } else {
    update()
  }
}

