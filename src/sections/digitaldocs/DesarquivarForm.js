import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, TextField, Autocomplete, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { desarquivarProcesso } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
// components
import { FormProvider, RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

DesarquivarForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  fluxoID: PropTypes.object,
  processoID: PropTypes.object,
};

export default function DesarquivarForm({ open, onCancel, processoID, fluxoID }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isSaving, destinosDesarquivamento } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'desarquivado') {
      enqueueSnackbar('Processo desarquivado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.arquivo.root);
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
    observacao: Yup.string().required('Observação não pode ficar vazio'),
    estadoID: Yup.mixed().nullable('Estado não pode ficar vazio').required('Estado não pode ficar vazio'),
  });

  const defaultValues = useMemo(() => ({ estadoID: null, observacao: '' }), []);

  const methods = useForm({ resolver: yupResolver(ArquivoSchema), defaultValues });

  const { reset, watch, control, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      const dados = {
        fluxoID,
        perfilID: null,
        estadoID: values?.estadoID?.id,
        observacao: values?.observacao,
        perfilIDCC: currentColaborador?.perfil_id,
      };
      dispatch(desarquivarProcesso(JSON.stringify(dados), processoID, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <DialogTitle>Desarquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="estadoID"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(destinosDesarquivamento, getComparator('asc', 'nome'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.nome}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label="Estado" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="outlined" color="error" loading={isSaving}>
              Desarquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </>
  );
}
