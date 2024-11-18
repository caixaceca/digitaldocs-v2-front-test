import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { updateItem, selectAnexo, closeModal } from '../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../hooks/useAnexos';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFUploadMultiFile,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
import { DialogButons } from '../../../components/Actions';

// --- ARQUIVAR PROCESSO -----------------------------------------------------------------------------------------------

ArquivarForm.propTypes = { naoFinal: PropTypes.array, onClose: PropTypes.func };

export function ArquivarForm({ naoFinal, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const informarConta = useMemo(
    () =>
      !processo?.limpo &&
      !processo?.origem_id &&
      processo?.assunto !== 'Encerramento de conta' &&
      meusAmbientes?.find((row) => row?.id === processo?.estado_atual_id)?.isfinal,
    [meusAmbientes, processo]
  );

  const formSchema = Yup.object().shape({
    entidades: informarConta && Yup.string().required('Nº de entidade(s) não pode ficar vazio'),
    conta:
      informarConta &&
      Yup.number().typeError('Introduza o nº de conta do titular').positive('Introduza um nº de conta válido'),
    data_entrada: Yup.date()
      .required('Data de entrada não pode ficar vazio')
      .typeError('Data de entrada não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      observacao: '',
      conta: processo?.conta || '',
      entidades: processo?.entidade || '',
      noperacao: processo?.numero_operacao || '',
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
    }),
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        conta: values?.conta,
        entidades: values?.entidade,
        fluxo_id: processo?.fluxo_id,
        observacao: values?.observacao,
        noperacao: values?.numero_operacao,
        data_entrada: format(values.data_entrada, 'yyyy-MM-dd'),
      };
      const anexos = new FormData();
      await values?.anexos?.forEach((row) => {
        anexos.append('anexos', row);
      });

      dispatch(
        updateItem('arquivar', JSON.stringify(formData), {
          mail,
          anexos,
          perfilId,
          id: processo?.id,
          msg: 'Processo arquivado',
          estadoId: processo?.estado_atual_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {naoFinal?.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2">
                    Geralmente, este processo é encaminhado para outro estado fora da sua Unidade Orgânica.
                    Certifique-se de que pretende realmente arquivá-lo em vez de o encaminhar.
                  </Typography>
                  <Typography sx={{ typography: 'caption', fontWeight: 700, mt: 1 }}>Posssíveis destinos:</Typography>
                  {naoFinal?.map((row) => (
                    <Stack key={row} direction="row" spacing={0.5} alignItems="center">
                      <CircleIcon sx={{ width: 8, height: 8, ml: 1 }} />
                      <Typography variant="caption">{row}</Typography>
                    </Stack>
                  ))}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={processo?.assunto !== 'Encerramento de conta' ? 6 : 12}>
              <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFNumberField name="noperacao" label="Nº de operação" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="entidades" label="Nº entidade(s)" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFNumberField name="conta" label="Nº de conta" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
            </Grid>
          </Grid>
          <DialogButons color="error" label="Arquivar" isSaving={isSaving} onCancel={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- DESARQUIVAR PROCESSO --------------------------------------------------------------------------------------------

DesarquivarForm.propTypes = { id: PropTypes.number, colaboradoresList: PropTypes.array };

export function DesarquivarForm({ id, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    perfil: Yup.mixed().required('Colaborador não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ estado: null, perfil: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (values?.estado?.id) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { id: values?.estado?.id }));
    }
  }, [dispatch, setValue, values?.estado?.id]);

  const onSubmit = async () => {
    try {
      const dados = {
        fluxo_id: processo?.fluxo_id,
        perfil_id: values?.perfil?.id,
        estado_id: values?.estado?.id,
        observacao: values?.observacao,
      };
      dispatch(updateItem('desarquivar', JSON.stringify(dados), { id, msg: 'Processo desarquivado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} fullWidth maxWidth="sm">
      <DialogTitle>Desarquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject
                name="estado"
                label="Estado"
                options={(processo?.destinosDesarquivamento || [])?.map((row) => ({ id: row?.id, label: row?.nome }))}
              />
            </Grid>
            {values?.estado?.id && (
              <Grid item xs={12}>
                <RHFAutocompleteObject name="perfil" label="Colaborador" options={colaboradoresList} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
          </Grid>
          <DialogButons color="error" label="Desarquivar" isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- RESTAURAR PROCESSO DO HISTÓRICO ---------------------------------------------------------------------------------

RestaurarForm.propTypes = { id: PropTypes.number };

export function RestaurarForm({ id }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(() => ({ estado: null, perfil: null, observacao: '' }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('restaurar', JSON.stringify({ observacao: values?.observacao }), {
          id,
          mail,
          perfilId,
          msg: 'Processo restaurado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(selectAnexo(null))} fullWidth maxWidth="sm">
      <DialogTitle>Restaurar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 3 }}>
            <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            <DialogButons
              color="error"
              label="Restaurar"
              isSaving={isSaving}
              onCancel={() => dispatch(selectAnexo(null))}
            />
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
