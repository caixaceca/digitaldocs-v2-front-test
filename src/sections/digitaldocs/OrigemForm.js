import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Fab, Grid, Dialog, Tooltip, MenuItem, DialogTitle, DialogActions, DialogContent } from '@mui/material';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFSelect } from '../../components/hook-form';
// _mock_
import { _concelhos } from '../../_mock';

// ----------------------------------------------------------------------

const tipos = ['Fiscal', 'Judicial'];

// ----------------------------------------------------------------------

OrigemForm.propTypes = {
  isOpenModal: PropTypes.bool,
  onCancel: PropTypes.func,
};

export default function OrigemForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [findConcelhos, setFindConcelhos] = useState([]);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { selectedOrigem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedOrigem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`Origem ${done} com sucesso`, { variant: 'success' });
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
    tipo: Yup.string().required('Tipo não pode ficar vazio'),
    ilha: Yup.string().required('Ilha não pode ficar vazio'),
    cidade: Yup.string().required('Concelho não pode ficar vazio'),
    designacao: Yup.string().required('Designação não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      tipo: selectedOrigem?.tipo || '',
      ilha: selectedOrigem?.ilha || '',
      email: selectedOrigem?.email || '',
      cidade: selectedOrigem?.cidade || '',
      codigo: selectedOrigem?.codigo || '',
      perfilID: currentColaborador?.perfil_id,
      telefone: selectedOrigem?.telefone || '',
      seguimento: selectedOrigem?.seguimento || '',
      observacao: selectedOrigem?.observacao || '',
      designacao: selectedOrigem?.designacao || '',
    }),
    [selectedOrigem, currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedOrigem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedOrigem, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('origem', JSON.stringify(values), { mail, id: selectedOrigem.id, mensagem: 'Origem atualizada' })
        );
      } else {
        dispatch(createItem('origem', JSON.stringify(values), { mail, mensagem: 'Origem adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('origem', {
          mail,
          id: selectedOrigem.id,
          mensagem: 'Origem eliminada',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  useEffect(() => {
    setFindConcelhos(_concelhos.filter((_concelho) => _concelho?.ilha === values?.ilha));
  }, [values?.ilha]);

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedOrigem ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="designacao" label="Designação" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="seguimento" label="Segmento" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="codigo" label="Código" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect
                name="tipo"
                label="Tipo"
                SelectProps={{ native: false, MenuProps: { sx: { '& .MuiPaper-root': { maxHeight: 260 } } } }}
              >
                {tipos.map((option) => (
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
              <RHFSelect
                name="ilha"
                label="Ilha"
                SelectProps={{ native: false, MenuProps: { sx: { '& .MuiPaper-root': { maxHeight: 260 } } } }}
              >
                {[...new Set(_concelhos.map((obj) => obj.ilha))].map((option) => (
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
              <RHFSelect
                name="cidade"
                label="Concelho"
                SelectProps={{ native: false, MenuProps: { sx: { '& .MuiPaper-root': { maxHeight: 260 } } } }}
              >
                {[...new Set(findConcelhos.map((obj) => obj.concelho))].map((option) => (
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
              <RHFTextField name="email" label="Email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="telefone" label="Telefone" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={2} maxRows={4} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar origem" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar origem"
                  desc="eliminar esta origem"
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
