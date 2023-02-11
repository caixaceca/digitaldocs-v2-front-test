import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { arquivarProcesso } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

ArquivarForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  processo: PropTypes.object,
};

export default function ArquivarForm({ open, onCancel, processo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isLoading, meuAmbiente, meusAmbientes } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'arquivado') {
      enqueueSnackbar('Processo arquivado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.processos.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const ArquivoSchema = Yup.object().shape({
    conta:
      processo?.is_interno &&
      meuAmbiente?.is_final &&
      Yup.number()
        .typeError('Introduza o nº de conta do titular')
        .positive('O nº de conta não pode ser negativo')
        .required('Introduza o nº de conta do titular'),
  });

  const defaultValues = useMemo(
    () => ({
      observacao: '',
      estadoID: processo?.estado_atual_id,
      fluxoID: processo?.fluxo_id,
      conta: processo?.conta || '',
      entidades: processo?.entidades,
      noperacao: processo?.noperacao || '',
      perfilID: currentColaborador?.perfil?.id,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(ArquivoSchema), defaultValues });

  const { reset, watch, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, open]);

  const onSubmit = async () => {
    try {
      dispatch(arquivarProcesso(JSON.stringify(values), processo.id, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const deveInformarNConta = () => {
    if (processo?.is_interno) {
      if (meuAmbiente?.id === -1) {
        let i = 0;
        while (i < meusAmbientes?.length) {
          if (meusAmbientes[i]?.is_final) {
            return true;
          }
          i += 1;
        }
      } else if (meuAmbiente?.is_final) {
        return true;
      }
    }
    return false;
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent sx={{ minWidth: { sm: 600 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {deveInformarNConta() && (
              <Grid item xs={12}>
                <RHFTextField name="conta" label="Nº de conta" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="noperacao" label="Nº de operação" InputProps={{ type: 'number' }} />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={8} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="outlined" color="error" loading={isLoading}>
              Arquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
