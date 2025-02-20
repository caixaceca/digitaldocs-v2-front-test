import PropTypes from 'prop-types';
import { Viewer } from '@react-pdf-viewer/core';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
//
import { Fechar } from './Actions';
import { SearchNotFound } from './table';
import { Loading } from './LoadingScreen';

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {action}
          {onClose && <Fechar handleClick={onClose} />}
        </Stack>
      </Stack>
      {subtitle}
    </DialogTitle>
  );
}

// ----------------------------------------------------------------------

DialogPreviewDoc.propTypes = {
  url: PropTypes.string,
  extra: PropTypes.node,
  onClose: PropTypes.func,
  titulo: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default function DialogPreviewDoc({ isLoading = false, titulo, url, onClose, extra = null }) {
  const theme = useTheme();
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });

  return (
    <Dialog fullScreen open sx={{ '& .MuiDialog-paper': { margin: 0 } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.75 }}>
          <Typography variant="subtitle1">{titulo}</Typography>
          <Stack direction="row" alignItems="center" spacing={3}>
            {extra}
            <Fechar large handleClick={() => onClose()} />
          </Stack>
        </Stack>
        <Divider />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
            {isLoading ? (
              <>
                <Loading />
                <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
              </>
            ) : (
              <>
                {!url ? (
                  <SearchNotFound message="Documento não encontrado..." />
                ) : (
                  <Viewer
                    fileUrl={url}
                    localization={pt}
                    defaultScale={1.5}
                    theme={{ theme: theme.palette.mode }}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                )}
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
