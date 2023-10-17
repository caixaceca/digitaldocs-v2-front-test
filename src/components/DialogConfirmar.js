import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

// ----------------------------------------------------------------------

DialogConfirmar.propTypes = {
  open: PropTypes.bool,
  desc: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  onClose: PropTypes.func,
  handleOk: PropTypes.func,
  descSec: PropTypes.string,
  isSaving: PropTypes.bool,
};

export default function DialogConfirmar({ isSaving, open, title = '', desc, descSec, color, onClose, handleOk }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title || 'Eliminar'}</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        {descSec && <DialogContentText sx={{ mb: 3 }}>{descSec}</DialogContentText>}
        <DialogContentText>Tens a certeza de que pretendes {desc}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton color={color || 'error'} variant="soft" onClick={handleOk} autoFocus loading={isSaving}>
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
