// @mui
import { alpha } from '@mui/material/styles';
import { Dialog, Tooltip } from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';
import { DenunciaForm } from '../../sections/home/DenunciaForm';

// ----------------------------------------------------------------------

export default function Denuncia() {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <Tooltip arrow title="Denúncia">
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
            src="/assets/icons/header/flag.svg"
            sx={{ width: { xs: 25, sm: 32 }, height: { xs: 25, sm: 32 } }}
          />
        </IconButtonAnimate>
      </Tooltip>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DenunciaForm open={open} onCancel={onClose} />
      </Dialog>
    </>
  );
}
