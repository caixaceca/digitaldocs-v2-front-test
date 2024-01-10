import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createItem, updateItem, closeModal } from '../../../redux/slices/cc';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFAutocompleteObject,
  RHFAutocompleteSimple,
} from '../../../components/hook-form';

// --------------------------------------------------------------------------------------------------------------------------------------------

EncaminharForm.propTypes = { onCancel: PropTypes.func, open: PropTypes.bool, destinos: PropTypes.array };

export function EncaminharForm({ open, destinos, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { pedidoCC, isSaving } = useSelector((state) => state.cc);

  const destinosList = useMemo(
    () =>
      destinos?.map((row) => ({
        modo: row.modo,
        id: row.transicao_id,
        estado_final_id: row.estado_id,
        label: `${row?.modo} para ${row?.nome}`,
      })) || [],
    [destinos]
  );

  const formSchema = Yup.object().shape({ acao: Yup.mixed().required('Introduza o destino') });
  const defaultValues = useMemo(
    () => ({ observacao: '', acao: destinosList?.length === 1 ? destinosList?.[0] : null }),
    [destinosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      const formData = [
        {
          perfilID: cc?.perfil_id,
          modo: values?.acao?.modo,
          observacao: values.observacao,
          transicao_id: values?.acao?.id,
          estado_id: values?.acao?.estado_final_id,
        },
      ];

      dispatch(
        createItem('encaminhar', JSON.stringify(formData), {
          mail,
          id: pedidoCC.id,
          perfilId: cc?.perfil_id,
          msg: 'Processo encaminhado',
          fluxoId: pedidoCC?.fluxo_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Encaminhar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="acao" label="Ação" options={destinosList} />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important' }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function ParecerForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { selectedItem, isOpenModal, isSaving } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({
    parecer: Yup.mixed().required('Escolhe o parecer'),
    descritivo: Yup.string().required('Descreve o parecer'),
  });
  const defaultValues = useMemo(
    () => ({
      id: selectedItem?.id,
      validado: selectedItem?.validado,
      descritivo: selectedItem?.descritivo,
      parecer:
        (selectedItem?.descritivo && selectedItem?.parecer_favoravel && 'Favorável') ||
        (selectedItem?.descritivo && !selectedItem?.parecer_favoravel && 'Não favorável') ||
        null,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'parecer',
          JSON.stringify({
            id: selectedItem?.id,
            validado: values?.validado,
            descritivo: values?.descritivo,
            perfil_id: selectedItem?.perfil_id,
            parecerfavoravel: values?.parecer === 'Favorável',
          }),
          { mail, values, msg: 'Parecer enviado' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const onCancel = () => {
    dispatch(closeModal());
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Parecer</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple name="parecer" label="Parecer" options={['Favorável', 'Não favorável']} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch name="validado" label="Parecer final" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="descritivo" multiline minRows={10} maxRows={15} label="Descritivo" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important' }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ArquivarForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function ArquivarForm({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { pedidoCC, isSaving } = useSelector((state) => state.cc);

  const defaultValues = useMemo(
    () => ({
      observacao: '',
      perfilID: cc?.perfil?.id,
      fluxoID: pedidoCC?.fluxo_id,
      estadoID: pedidoCC?.ultimo_estado_id,
    }),
    [cc?.perfil?.id, pedidoCC?.fluxo_id, pedidoCC?.ultimo_estado_id]
  );

  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      dispatch(createItem('arquivar', JSON.stringify(values), { mail, id: pedidoCC.id, msg: 'Processo arquivado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" color="error" loading={isSaving}>
              Arquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
