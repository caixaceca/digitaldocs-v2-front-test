import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';

// ----------------------------------------------------------------------

DialogConfirmar.propTypes = {
  open: PropTypes.bool,
  desc: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  onClose: PropTypes.func,
  handleOk: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default function DialogConfirmar({ isLoading, open, title, desc, color = 'error', onClose, handleOk }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <DialogContentText>Tens a certeza de que pretendes {desc}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton color={color} variant="soft" onClick={handleOk} autoFocus loading={isLoading}>
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
