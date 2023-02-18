import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Fab,
  Grid,
  Dialog,
  Tooltip,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFSwitch } from '../../components/hook-form';
// hooks
import useToggle from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

EstadoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export default function EstadoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { uos } = useSelector((state) => state.uo);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isSaving, selectedEstado } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedEstado;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
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

  const uosList = uos.map((row) => ({ id: row?.id, label: row?.label }));
  const uoSelect = uosList?.find((row) => row.id === selectedEstado?.uo_id) || null;

  const formSchema = Yup.object().shape({
    nome: Yup.string().required('Nome não pode ficar vazio'),
    uo_id: Yup.mixed()
      .nullable('Unidade orgânica não pode ficar vazio')
      .required('Unidade orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      uo_id: uoSelect,
      nome: selectedEstado?.nome || '',
      email: selectedEstado?.email || '',
      perfilID: currentColaborador?.perfil_id,
      is_final: selectedEstado?.is_final || false,
      observacao: selectedEstado?.observacao || '',
      is_decisao: selectedEstado?.is_decisao || false,
      is_inicial: selectedEstado?.is_inicial || false,
    }),
    [selectedEstado, currentColaborador, uoSelect]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedEstado) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedEstado, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (selectedEstado) {
        values.uo_id = values?.uo_id?.id;
        dispatch(
          updateItem('estado', JSON.stringify(values), { mail, id: selectedEstado.id, mensagem: 'Estado atualizado' })
        );
      } else {
        values.uo_id = values?.uo_id?.id;
        dispatch(createItem('estado', JSON.stringify(values), { mail, mensagem: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('estado', {
          mail,
          id: selectedEstado.id,
          mensagem: 'Estado eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedEstado ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="nome" label="Nome" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="email" label="Email" />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="uo_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(uosList, getComparator('asc', 'label'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Unidade orgânica" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_inicial"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Inicial
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_final"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Final
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_decisao"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Decisão
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={2} maxRows={4} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar estado" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar estado"
                  desc="eliminar este estado"
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
