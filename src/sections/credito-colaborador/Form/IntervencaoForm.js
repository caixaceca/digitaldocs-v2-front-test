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
import { updateItem } from '../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../redux/store';
import { createItemCC, updateItemCC, closeModal } from '../../../redux/slices/cc';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFAutocompleteObject,
  RHFAutocompleteSimple,
} from '../../../components/hook-form';

// --------------------------------------------------------------------------------------------------------------------------------------------

EncaminharForm.propTypes = {
  dev: PropTypes.bool,
  onCancel: PropTypes.func,
  destinos: PropTypes.array,
};

export function EncaminharForm({ destinos, onCancel, dev }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { pedidoCC, isSaving } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({ acao: Yup.mixed().required('Introduza o destino') });
  const defaultValues = useMemo(
    () => ({ observacao: '', acao: destinos?.length === 1 ? destinos?.[0] : null }),
    [destinos]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = [
        {
          perfilID: perfilId,
          modo: values?.acao?.modo,
          observacao: values.observacao,
          transicao_id: values?.acao?.id,
          estado_id: values?.acao?.estado_final_id,
        },
      ];

      dispatch(
        createItemCC('encaminhar', JSON.stringify(formData), {
          mail,
          perfilId,
          id: pedidoCC.id,
          msg: 'Processo encaminhado',
          fluxoId: pedidoCC?.fluxo_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{dev ? 'Devolver' : 'Encaminhar'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="acao" label="Ação" options={destinos} />
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

ParecerForm.propTypes = { normal: PropTypes.bool };

export function ParecerForm({ normal = false }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { selectedItem, isSaving } = useSelector((state) => state.cc);

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
      if (normal) {
        dispatch(
          updateItem(
            'parecer estado',
            JSON.stringify({
              id: selectedItem?.id,
              validado: values?.validado,
              descritivo: values?.descritivo,
              perfil_id: selectedItem?.perfil_id,
              favoravel: values?.parecer === 'Favorável',
            }),
            { mail, values, msg: 'Parecer enviado' }
          )
        );
      } else {
        dispatch(
          updateItemCC(
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
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const onCancel = () => {
    dispatch(closeModal());
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
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
              <RHFTextField name="descritivo" multiline minRows={8} maxRows={15} label="Descritivo" />
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

ArquivarForm.propTypes = { onCancel: PropTypes.func };

export function ArquivarForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoCC, isSaving } = useSelector((state) => state.cc);
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(
    () => ({
      observacao: '',
      perfilID: perfilId,
      fluxoID: pedidoCC?.fluxo_id,
      estadoID: pedidoCC?.ultimo_estado_id,
    }),
    [perfilId, pedidoCC?.fluxo_id, pedidoCC?.ultimo_estado_id]
  );

  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(createItemCC('arquivar', JSON.stringify(values), { mail, id: pedidoCC.id, msg: 'Processo arquivado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
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
