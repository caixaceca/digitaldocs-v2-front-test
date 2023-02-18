import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Fab,
  Grid,
  Dialog,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFSwitch, RHFSelect } from '../../components/hook-form';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

const modos = ['Seguimento', 'Devolução'];

// ----------------------------------------------------------------------

TransicaoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func, fluxoId: PropTypes.number };

export default function TransicaoForm({ isOpenModal, onCancel, fluxoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { selectedTransicao, estados, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedTransicao;

  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));
  const estadoInicial = estadosList?.find((row) => row.id === selectedTransicao?.estado_inicial_id) || null;
  const estadoFinal = estadosList?.find((row) => row.id === selectedTransicao?.estado_final_id) || null;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`Transição ${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    modo: Yup.string().required('Modo não pode ficar vazio'),
    prazoemdias: Yup.string().required('Prazo não pode ficar vazio'),
    estado_inicial_id: Yup.mixed()
      .nullable('Estado inicial não pode ficar vazio')
      .required('Estado inicial não pode ficar vazio'),
    estado_final_id: Yup.mixed()
      .nullable('Estado dinal não pode ficar vazio')
      .required('Estado dinal não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      estado_final_id: estadoFinal,
      estado_inicial_id: estadoInicial,
      modo: selectedTransicao?.modo || '',
      perfilIDCC: currentColaborador?.perfil_id,
      to_alert: selectedTransicao?.to_alert || false,
      fluxo_id: selectedTransicao?.fluxo_id || fluxoId,
      prazoemdias: selectedTransicao?.prazoemdias || '',
      hasopnumero: selectedTransicao?.hasopnumero || false,
      arqhasopnumero: selectedTransicao?.arqhasopnumero || false,
      is_after_devolucao: selectedTransicao?.is_after_devolucao || false,
    }),
    [fluxoId, selectedTransicao, currentColaborador?.perfil_id, estadoInicial, estadoFinal]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedTransicao) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedTransicao, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (selectedTransicao) {
        values.estado_final_id = values?.estado_final_id?.id;
        values.estado_inicial_id = values?.estado_inicial_id?.id;
        dispatch(
          updateItem('transicao', JSON.stringify(values), {
            mail,
            id: selectedTransicao.id,
            mensagem: 'Transição atualizada',
          })
        );
      } else {
        values.estado_final_id = values?.estado_final_id?.id;
        values.estado_inicial_id = values?.estado_inicial_id?.id;
        dispatch(createItem('transicao', JSON.stringify(values), { mail, mensagem: 'Transição adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('transicao', {
          mail,
          id: selectedTransicao.id,
          mensagem: 'Transição eliminada',
          perfilId: currentColaborador?.perfil_id,
        })
      );
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedTransicao ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="estado_inicial_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado de origem" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="estado_final_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado de destino" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="modo" label="Modo" SelectProps={{ native: false }}>
                {modos.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField
                name="prazoemdias"
                label="Prazo"
                InputProps={{ endAdornment: <InputAdornment position="end">dias</InputAdornment>, type: 'number' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="is_after_devolucao"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Depois de devolução
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="to_alert"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Notificar
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="hasopnumero"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Indicar nº de operação
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="arqhasopnumero"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Nº de operação no arquivo
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar fluxo" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar transição"
                  desc="eliminar esta transição"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
