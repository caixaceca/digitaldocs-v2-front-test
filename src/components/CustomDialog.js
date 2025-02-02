import PropTypes from 'prop-types';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
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

DialogTitleAlt.propTypes = {
  sx: PropTypes.object,
  action: PropTypes.node,
  title: PropTypes.string,
  onClose: PropTypes.func,
  subtitle: PropTypes.node,
};

export function DialogTitleAlt({ title, onClose = null, sx = null, action, subtitle = null }) {
  return (
    <DialogTitle sx={{ ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        {title}
        {onClose && <Fechar handleClick={onClose} />}
        {action}
      </Stack>
      {subtitle}
    </DialogTitle>
  );
}

// ----------------------------------------------------------------------

DialogPreviewDoc.propTypes = { titulo: PropTypes.string, url: PropTypes.string, onClose: PropTypes.func };

export default function DialogPreviewDoc({ titulo, url, onClose }) {
  const theme = useTheme();
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });

  return (
    <Dialog fullScreen open>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <DialogTitleAlt title={titulo} sx={{ pb: 2 }} />
          <DialogActions sx={{ zIndex: 9, padding: '10px !important' }}>
            <Fechar large handleClick={() => onClose()} />
          </DialogActions>
        </Stack>
        <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
          <Viewer
            fileUrl={url}
            localization={pt}
            theme={{ theme: theme.palette.mode }}
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={SpecialZoomLevel.ActualSize}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
