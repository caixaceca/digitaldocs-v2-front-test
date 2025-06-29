import { useEffect } from 'react';
import { useSnackbar } from 'notistack';

// ---------------------------------------------------------------------------------------------------------------------

export function useNotificacao({ done, error, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (done && (done?.includes('Bom dia') || done?.includes('Boa tarde') || done?.includes('Boa noite')))
      enqueueSnackbar(done, { variant: 'success' });
    else if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error && typeof error === 'string') enqueueSnackbar(error, { variant: 'error' });
  }, [enqueueSnackbar, error]);
}
