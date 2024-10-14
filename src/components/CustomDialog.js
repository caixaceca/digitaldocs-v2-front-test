import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
//
import { Fechar } from './Actions';

// ----------------------------------------------------------------------

DialogConfirmar.propTypes = {
  desc: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  onClose: PropTypes.func,
  handleOk: PropTypes.func,
  isSaving: PropTypes.bool,
  descSec: PropTypes.string,
};

export function DialogConfirmar({ isSaving, title = '', desc, descSec, color, onClose, handleOk }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title || 'Eliminar'}</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        {descSec && <DialogContentText sx={{ mb: 3 }}>{descSec}</DialogContentText>}
        <DialogContentText>Tens a certeza de que pretendes {desc}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton color={color || 'error'} variant="soft" onClick={handleOk} autoFocus loading={isSaving}>
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

DialogTitleAlt.propTypes = { title: PropTypes.string, onClose: PropTypes.func, sx: PropTypes.object };

export function DialogTitleAlt({ title, onClose = null, sx = null }) {
  return (
    <DialogTitle sx={{ ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        {title}
        {onClose && <Fechar handleClick={onClose} />}
      </Stack>
    </DialogTitle>
  );
}
