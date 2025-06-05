import { Box, IconButton } from 'theme-ui'
import { useState, useEffect } from 'react'
import { X, ChevronUp, ChevronDown, Locate } from 'lucide-react'
import { useCombobox, autocomplete } from '@szhsin/react-autocomplete'
import { Input } from './'
import shapes from '../data'

const zones = Object.keys(shapes['districts'])

const Autocomplete = ({ selected, setSelected, zoomTo }) => {
  const [value, setValue] = useState()

  const items = value
    ? zones.filter((item) => item.toLowerCase().startsWith(value.toLowerCase()))
    : zones

  const {
    getLabelProps,
    getInputProps,
    getClearProps,
    getToggleProps,
    getListProps,
    getItemProps,
    open,
    focusIndex,
    isInputEmpty,
  } = useCombobox({
    items,
    value,
    onChange: setValue,
    selected,
    onSelectChange: setSelected,
    feature: autocomplete({ select: true }),
  })

  return (
    <>
      <Box
        sx={{
          borderRadius: [0, '2px', '2px', '2px'],
          bg: 'rgb(255,255,255,0.9)',
          ml: [0, 4, 4, 4],
          mt: [0, 4, 4, 4],
          width: ['calc(100vw)', '400px', '400px', '400px'],
        }}
      >
        <Box sx={{ px: [4], py: [4] }}>
          <Box
            sx={{
              fontFamily: 'heading',
              letterSpacing: 'mono',
              fontSize: [1, 1, 1, 1],
              textTransform: 'uppercase',
            }}
          >
            Search zones
          </Box>
          <Box sx={{ position: 'relative', mt: ['13px'] }}>
            <Input placeholder='Select or type...' {...getInputProps()} />
            <Box sx={{ position: 'absolute', right: 0, top: '4px' }}>
              {selected && (
                <IconButton
                  as='button'
                  sx={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '15px',
                    bg: 'transparent',
                    '&:hover': { bg: 'rgb(210,210,210)' },
                    transition: 'background 150ms',
                    cursor: 'pointer',
                  }}
                  onClick={zoomTo}
                >
                  {<Locate size={30} />}
                </IconButton>
              )}
              {!isInputEmpty && (
                <IconButton
                  as='button'
                  sx={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '15px',
                    bg: 'transparent',
                    '&:hover': { bg: 'rgb(210,210,210)' },
                    transition: 'background 150ms',
                    cursor: 'pointer',
                  }}
                  {...getClearProps()}
                >
                  <X size={30} />
                </IconButton>
              )}
              <IconButton
                as='button'
                sx={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '15px',
                  bg: 'transparent',
                  '&:hover': { bg: 'rgb(210,210,210)' },
                  transition: 'background 150ms',
                  cursor: 'pointer',
                }}
                {...getToggleProps()}
              >
                {open ? <ChevronUp size={30} /> : <ChevronDown size={30} />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: open ? 'block' : 'none',
          borderRadius: '2px',
          bg: 'rgb(255,255,255,0.9)',
          ml: [0, 4, 4, 4],
          mt: [2],
          py: [4],
          width: ['calc(100vw)', '400px', '400px', '400px'],
        }}
      >
        <Box
          as='ul'
          {...getListProps()}
          sx={{
            borderRadius: '2px',
            display: open ? 'block' : 'none',
            listStyle: 'none',
            color: '#000',
            overflow: 'auto',
            maxHeight: 300,
            width: ['calc(100vw)', '400px', '400px', '400px'],
            left: 0,
            px: [4],
          }}
        >
          {items.length ? (
            items.map((item, index) => (
              <li
                style={{
                  background: focusIndex === index ? '#ddd' : 'none',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  paddingLeft: '5px',
                  marginLeft: '-5px',
                  transition: 'background 100ms',
                }}
                key={item}
                {...getItemProps({ item, index })}
              >
                {item}
              </li>
            ))
          ) : (
            <li>No results</li>
          )}
        </Box>
      </Box>
    </>
  )
}

export default Autocomplete
