// @mui
import { alpha } from '@mui/material/styles';
import { Box, Dialog, Tooltip, IconButton, DialogTitle, DialogContent } from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import Ajuda from '../../sections/home/Ajuda';
import SvgIconStyle from '../../components/SvgIconStyle';
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
            ...(open && {
              bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity),
            }),
          }}
        >
          <SvgIconStyle
            src="/assets/icons/header/help.svg"
            sx={{ width: { xs: 25, sm: 32 }, height: { xs: 25, sm: 32 } }}
          />
        </IconButtonAnimate>
      </Tooltip>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}>Ajuda</Box>
            <Box>
              <IconButton onClick={onClose}>
                <SvgIconStyle src="/assets/icons/close.svg" sx={{ width: 20 }} />
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
