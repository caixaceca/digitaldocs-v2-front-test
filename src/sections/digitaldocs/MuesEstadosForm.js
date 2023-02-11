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
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// hooks
import useToggle from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import { FormProvider } from '../../components/hook-form';
import DialogConfirmar from '../../components/DialogConfirmar';

// ----------------------------------------------------------------------

MuesEstadosForm.propTypes = {
  onCancel: PropTypes.func,
  perfilId: PropTypes.number,
  isOpenModal: PropTypes.bool,
};

export default function MuesEstadosForm({ isOpenModal, perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { estados, done, error, isSaving, selectedMeuEstado } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedMeuEstado;

  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));
  const estado = estadosList.find((row) => row.id === selectedMeuEstado?.estado_id) || null;

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

  const EstadoSchema = Yup.object().shape({
    estado_id: Yup.mixed()
      .nullable('Estado orgânica não pode ficar vazio')
      .required('Estado orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      estado_id: estado,
      perfil_id: Number(perfilId),
      perfil_id_cc: currentColaborador?.perfil?.id,
      data_limite: selectedMeuEstado?.data_limite ? new Date(selectedMeuEstado?.data_limite) : null,
      data_inicial: selectedMeuEstado?.data_inicial ? new Date(selectedMeuEstado?.data_inicial) : null,
    }),
    [selectedMeuEstado, currentColaborador?.perfil?.id, estado, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(EstadoSchema), defaultValues });

  const { reset, watch, control, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && selectedMeuEstado) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedMeuEstado, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        values.estado_id = values?.estado_id?.id;
        dispatch(
          updateItem('meuEstado', JSON.stringify(values), {
            mail,
            id: selectedMeuEstado.id,
            mensagem: 'Estado atualizado',
          })
        );
      } else {
        values.estado_id = values?.estado_id?.id;
        dispatch(createItem('meuEstado', JSON.stringify(values), { mail, mensagem: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('meuEstado', {
          mail,
          id: selectedMeuEstado.id,
          mensagem: 'Estado eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedMeuEstado ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="estado_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="data_inicial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    disablePast
                    label="Data de início"
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
            <Grid item xs={12}>
              <Controller
                name="data_limite"
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
