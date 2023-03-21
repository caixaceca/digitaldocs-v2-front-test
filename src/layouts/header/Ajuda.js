// @mui
import { alpha } from '@mui/material/styles';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Box, Dialog, Tooltip, IconButton, DialogTitle, DialogContent } from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import Ajuda from '../../sections/home/Ajuda';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

export default function AjudaPopover() {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <Tooltip arrow title="Ajuda">
        <IconButtonAnimate
          color={open ? 'primary' : 'default'}
          onClick={onOpen}
          sx={{
            padding: 0,
            width: { xs: 30, sm: 40 },
            height: { xs: 30, sm: 40 },
            color: '#fff',
            ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
          }}
        >
          <HelpOutlineOutlinedIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />
        </IconButtonAnimate>
      </Tooltip>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}>Ajuda</Box>
            <Box>
              <IconButton onClick={onClose}>
                <CloseOutlinedIcon sx={{ width: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Ajuda />
        </DialogContent>
      </Dialog>
    </>
  );
}
