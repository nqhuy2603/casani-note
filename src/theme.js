import { BorderColor } from '@mui/icons-material'
import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '56px'
const BOARD_BAR_HEIGHT = '64px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '52px'
const COLUMN_FOOTER_HEIGHT = '56px'

// Create a theme instance.
const theme = extendTheme({
  casani: {
    appBarHeight: APP_BAR_HEIGHT,
    boarBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  colorSchemes: {
    light:{
      palette: {
        text: {
          primary: '#212121'
        },
        card: {
          background: 'white',
          hover: '#363857'
        },
        button: {
          primary: '#212121',
          background: '#E4E4D3'
        },
        bgColumn: {
          background: '#F1E7D8',
          transparent: '#E4E4D3'
        },
        menu: {
          background: '#F2E8DA', // Màu nền cho menu
          text: '#212121'
        },
        close: {
          warning: '#CD9586'
        },
        input: {
          color: '#111111',
          bgColor: '#F1E7D8',
          borderColor:'#111111'
        }
      }
    },
    dark: {
      palette: {
        text: {
          primary: '#F2F2F2BF',
          card: '#212121'
        },
        card: {
          background: '#F2E8DA',
          text: '#212121',
          hover: '#363857'
        },
        button: {
          primary: '#212121',
          background: '#F1E7D8'
        },
        bgColumn: {
          background: '#A5917B',
          transparent: '#E4E4D3',
          hold: '#111111'
        },
        menu: {
          primary: '#4C4A45'
        },
        close: {
          warning: '#D16B55'
        },
        input: {
          color: '#111111',
          bgColor: '#A5917B',
          borderColor:'#111111'
        }
      }
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '6px'
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#E2D7C1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#D1B496',
            borderRadius: '8px'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          '&:hover': { borderWidth: '0.5px' }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // color: theme.palette.primary.main,
          fontSize: '0.875rem',
          // '.MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.primary.light
          // },
          // '&:hover': {
          //   '.MuiOutlinedInput-notchedOutline': {
          //     borderColor: theme.palette.primary.main
          //   }
          // },
          '& fieldset': {
            borderWidth: '0.5px !important'
          },
          '&:hover fieldset': {
            borderWidth: '2px !important'
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px !important'
          }
        }
      }
    }
  }
  // ...other properties
})

export default theme
