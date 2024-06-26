import AttachmentIcon from '@mui/icons-material/Attachment'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import Button from '@mui/material/Button'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Card({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dntKitCardStyles = {
    // touchAction: 'none', // dành cho sensor default dạng PointerSensor
    // https://github.com/clauderic/dnd-kit/issues/117
    // Sử dụng Translate thay vì transform để kích thước column không bị thay đổi
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #BABCA7' : undefined
  }
  const shouldShowCardAction = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }
  return (
    <MuiCard
      ref={setNodeRef}
      style={dntKitCardStyles}
      {...attributes}
      {...listeners}

      sx={{
        bgcolor: (theme) => (theme.palette.card),
        color: (theme) => (theme.palette.text.card),
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        // overflow: card?.FE_PlaceholderCard ? 'hidden' : 'unset',
        // height: card?.FE_PlaceholderCard ? 0 : 'auto',
        border: '1px solid #E0E0E0',
        '&:hover': { borderColor: (theme) => (theme.palette.card.hover) }
      }}>
      {card?.cover &&
      <CardMedia
        sx={{ height: 140, borderRadius: '4px 4px 0 0' }}
        image={card?.cover}
        title="This is title"
      />
      }
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography>
          {card?.title}
        </Typography>
      </CardContent>
      {shouldShowCardAction() &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length && 
            <Button sx={{ color: (theme) => theme.palette.button.primary }} size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          }
          {!!card?.comments?.length && 
            <Button sx={{ color: (theme) => theme.palette.button.primary }} size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>
          }
          {!!card?.attachments?.length && 
            <Button sx={{ color: (theme) => theme.palette.button.primary }} size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card