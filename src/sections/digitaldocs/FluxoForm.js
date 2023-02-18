import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
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
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFSelect, RHFSwitch } from '../../components/hook-form';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

const modelos = ['Série', 'Paralelo'];

// ----------------------------------------------------------------------

FluxoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export default function FluxoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isSaving, selectedFluxo } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedFluxo;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
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
    modelo: Yup.string().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      modelo: selectedFluxo?.modelo || '',
      assunto: selectedFluxo?.assunto || '',
      observacao: selectedFluxo?.observacao || '',
      is_interno: selectedFluxo?.is_interno || false,
      perfilID: currentColaborador?.perfil_id,
    }),
    [selectedFluxo, currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedFluxo) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedFluxo]);

  const onSubmit = async () => {
    try {
      if (selectedFluxo) {
        dispatch(
          updateItem('fluxo', JSON.stringify(values), { mail, id: selectedFluxo.id, mensagem: 'Fluxo atualizado' })
        );
      } else {
        dispatch(createItem('fluxo', JSON.stringify(values), { mail, mensagem: 'Fluxo atualizado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('fluxo', {
          mail,
          id: selectedFluxo.id,
          mensagem: 'Fluxo eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedFluxo ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="modelo" label="Modelos" SelectProps={{ native: false }}>
                {modelos.map((option) => (
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
              <RHFSwitch
                name="is_interno"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Processo interno
                  </Typography>
                }
                sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={3} maxRows={5} label="Observação" />
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
                  title="Eliminar fluxo"
                  desc="eliminar este fluxo"
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
