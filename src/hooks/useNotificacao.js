import { useEffect } from 'react';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export function useNotificacao({ done, error, afterSuccess }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      afterSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error && typeof error === 'string') enqueueSnackbar(error, { variant: 'error' });
  }, [enqueueSnackbar, error]);
}
