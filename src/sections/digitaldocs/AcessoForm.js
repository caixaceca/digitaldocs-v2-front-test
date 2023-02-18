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
import {
  Box,
  Fab,
  Grid,
  Dialog,
  Tooltip,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFSelect } from '../../components/hook-form';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
// _mock
import { codacessos, objetos } from '../../_mock';

// ----------------------------------------------------------------------

AcessoForm.propTypes = { onCancel: PropTypes.func, perfilId: PropTypes.number, isOpenModal: PropTypes.bool };

export default function AcessoForm({ isOpenModal, perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isSaving, selectedAcesso } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedAcesso;

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

  const formSchema = Yup.object().shape({
    objeto: Yup.string().required('Objeto não pode ficar vazio'),
    acesso: Yup.string().required('Acesso não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: Number(perfilId),
      objeto: selectedAcesso?.objeto || '',
      acesso: selectedAcesso?.acesso || '',
      datalimite: selectedAcesso?.datalimite || null,
      perfilIDCC: currentColaborador?.perfil?.id,
    }),
    [selectedAcesso, currentColaborador?.perfil?.id, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedAcesso) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedAcesso, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('acesso', JSON.stringify(values), { mail, id: selectedAcesso.id, mensagem: 'Acesso atualizado' })
        );
      } else {
        dispatch(createItem('acesso', JSON.stringify(values), { mail, mensagem: 'Acesso atribuido' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('acesso', {
          mail,
          id: selectedAcesso.id,
          mensagem: 'Acesso eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedAcesso ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFSelect
                name="objeto"
                label="Objeto"
                SelectProps={{ native: false, MenuProps: { sx: { '& .MuiPaper-root': { maxHeight: 260 } } } }}
              >
                {objetos.map((option) => (
                  <MenuItem
                    key={option.label}
                    value={option.id}
                    sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12}>
              <RHFSelect
                name="acesso"
                label="Acesso"
                SelectProps={{ native: false, MenuProps: { sx: { '& .MuiPaper-root': { maxHeight: 260 } } } }}
              >
                {codacessos.map((option) => (
                  <MenuItem
                    key={option.label}
                    value={option.id}
                    sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="datalimite"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    label="Data"
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
                <Tooltip title="Eliminar acesso" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar acesso"
                  desc="eliminar este acesso"
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
