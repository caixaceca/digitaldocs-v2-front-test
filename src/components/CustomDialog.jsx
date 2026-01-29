// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
//
import { Fechar } from './Actions';
import { SearchNotFound } from './table';
import { Loading } from './LoadingScreen';

// ---------------------------------------------------------------------------------------------------------------------

export function DialogConfirmar({ isSaving, title = 'Eliminar', desc = '', color, onClose, handleOk, content = null }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <DialogContentText>
          {content}
          {desc && <>Tens a certeza de que pretendes {desc}?</>}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="soft" onClick={handleOk} loading={isSaving} color={color || 'error'}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DialogTitleAlt({ title, onClose = null, sx = null, action, subtitle = null, content = null }) {
  return (
    <DialogTitle sx={{ ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Box>
          {title}
          {subtitle}
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {action}
          {onClose && <Fechar onClick={onClose} />}
        </Stack>
      </Stack>
      {content}
    </DialogTitle>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export default function DialogPreviewDoc({ params, onClose }) {
  const theme = useTheme();
  const { isLoading = false, titulo, url } = params;

  return (
    <Dialog fullScreen open sx={{ m: { xs: 1, md: 3 }, '& .MuiDialog-paper': { margin: 0 } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 0.5, pl: 1.5 }}>
          <Typography variant="subtitle1">{titulo}</Typography>
          <Fechar large onClick={() => onClose()} />
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
                  <iframe
                    src={url}
                    width="100%"
                    height="100%"
                    title={titulo}
                    key="iframe-preview"
                    style={{ border: 'none', colorScheme: theme.palette.mode }}
                  >
                    <p>
                      Seu navegador não suporta a visualização de PDFs.
                      <a href={url}>Clique aqui para baixar o arquivo.</a>
                    </p>
                  </iframe>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
