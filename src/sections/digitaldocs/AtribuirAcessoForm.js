import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Box, Grid, TextField, Autocomplete, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { atribuirAcesso } from '../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../components/hook-form';

// ----------------------------------------------------------------------

AtribuirAcessoForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  processoId: PropTypes.number,
};

export default function AtribuirAcessoForm({ open, onCancel, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.colaborador);

  const colaboradoresList = colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }));

  useEffect(() => {
    if (done === 'Acesso atribuido') {
      enqueueSnackbar('Acesso ao processo atribuído com sucesso', { variant: 'success' });
      onCancel();
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
    perfilID: Yup.mixed().nullable('Colaborador não pode ficar vazio').required('Colaborador não pode ficar vazio'),
    datalimite: Yup.mixed()
      .nullable('Data de término não pode ficar vazio')
      .required('Data de término não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: null,
      datalimite: null,
      perfilIDCC: currentColaborador?.perfil_id,
    }),
    [currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(ArquivoSchema), defaultValues });

  const { reset, watch, control, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      values.perfilID = values?.perfilID?.id;
      dispatch(atribuirAcesso(JSON.stringify(values), processoId, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <DialogTitle>Atribuir acesso</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="perfilID"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(colaboradoresList, getComparator('asc', 'label'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Colaborador" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="datalimite"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    disablePast
                    label="Data de término"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Atribuir
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </>
  );
}
