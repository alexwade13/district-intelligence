import {
  createShapeMouseMoveHandler,
  createShapeMouseMoveOffHandler,
  createShapeClickHandler,
  createShapeClickOffHandler,
  updateShapeVisibility,
} from '../components/utils'
import shapes from '../data'

export const setupMapEventHandlers = (map, layers, scale, setSelected, viewMode, setSelectedTract) => {
  if (!map) return () => {}

  const handlers = {}

  if (viewMode === 'tract') {
    handlers['census-tract'] = {}
    handlers['census-tract'].move = createShapeMouseMoveHandler(map, 'census-tract')
    handlers['census-tract'].moveOff = createShapeMouseMoveOffHandler(map)
    handlers['census-tract'].click = (e) => {
      if (e.features && e.features.length > 0) {
        const tractId = e.features[0].properties.GEOID
        setSelectedTract(tractId)
      }
    }
    handlers['census-tract'].clickOff = (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['census-tracts-fill']
      })
      if (features.length === 0) {
        setSelectedTract(null)
      }
    }

    const addHandlers = () => {
      map.on('mousemove', 'census-tracts-fill', handlers['census-tract'].move)
      map.on('click', 'census-tracts-fill', handlers['census-tract'].click)
      map.on('mousemove', handlers['census-tract'].moveOff)
      map.on('click', handlers['census-tract'].clickOff)
    }

    if (!map.isStyleLoaded()) {
      map.once('idle', () => {
        addHandlers()
      })
    } else {
      addHandlers()
    }

    return () => {
      map.off('mousemove', 'census-tracts-fill', handlers['census-tract'].move)
      map.off('click', 'census-tracts-fill', handlers['census-tract'].click)
      map.off('mousemove', handlers['census-tract'].moveOff)
      map.off('click', handlers['census-tract'].clickOff)
    }
  } else {
    layers.forEach((layer) => {
      handlers[layer] = {}
      handlers[layer].move = createShapeMouseMoveHandler(map, layer)
      handlers[layer].moveOff = createShapeMouseMoveOffHandler(map)
      
      if (layer === 'assembly-district') {
        handlers[layer].click = (e) => {
          const clickedAD = String(e.features[0].properties['assembly-district'])
          if (Object.keys(shapes['assembly-districts']).includes(clickedAD)) {
            setSelected((prev) => {
              if (prev['assembly-district'] === clickedAD) {
                return {}
              }
              return { 'assembly-district': clickedAD }
            })
          }
        }
        handlers[layer].clickOff = (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['assembly-districts-fill'],
          })
          if (features.length === 0) {
            setSelected({})
          }
        }
      } else {
        handlers[layer].click = createShapeClickHandler(map, layer, setSelected)
        handlers[layer].clickOff = createShapeClickOffHandler(map, layer, setSelected)
      }

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
}

export const updateLayerVisibility = (map, scale, scaleLookup, viewMode) => {
  if (!map) return

  const update = () => {
    if (viewMode === 'tract') {
      updateShapeVisibility(map, 'census-tracts', 'visible')
      if (map.getLayer('assembly-districts-fill')) {
        map.setLayoutProperty('assembly-districts-fill', 'visibility', 'none')
      }
      if (map.getLayer('assembly-districts-line')) {
        map.setLayoutProperty('assembly-districts-line', 'visibility', 'visible')
      }
      updateShapeVisibility(map, 'election-districts', 'none')
    } else {
      const layers = ['election-district', 'assembly-district']

      updateShapeVisibility(map, `${scaleLookup[scale]}s`, 'visible')
      updateShapeVisibility(map, 'census-tracts', 'none')

      layers.forEach((l) => {
        if (l !== scaleLookup[scale]) {
          updateShapeVisibility(map, `${l}s`, 'none')
        }
      })
    }
  }

  if (!map.isStyleLoaded()) {
    map.once('idle', () => {
      update()
    })
  } else {
    update()
  }
}

