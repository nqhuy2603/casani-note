import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

function ListColumns() {
  return ( <Box sx={{
    bgcolor: 'inherit',
    width: '100%',
    height: '100%',
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    '&::-webkit-scrollbar-track': { m: 2 }
  }}>
    {/* Box 1 */}
    <Column />
    <Column />

    {/* Box Add new Column */}
    <Box sx={{
      minWidth: '200px',
      maxWidth: '200px',
      mx: 2,
      borderRadius: '6px',
      height: 'fit-content',
      bgcolor: (theme) => (theme.palette.bgColumn.transparent)
    }}
    >
      <Button startIcon={<PlaylistAddIcon />}
        sx={{
          color: (theme) => (theme.palette.mode === 'light' ? '#315E8B' : '#A5917B'),
          bgcolor: (theme) => (theme.palette.button.background),
          width: '100%',
          justifyContent: 'flex-start',
          pl: 2.5,
          py: 1
        }}
      >
        Add new column</Button>
    </Box>
  </Box>

  )
}

export default ListColumns