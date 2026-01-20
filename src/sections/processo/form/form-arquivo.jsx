import * as Yup from 'yup';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
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
import { getInfoProcesso, updateItem, setModal } from '../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../hooks/useAnexos';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDataEntrada,
  RHFNumberField,
  RHFUploadMultiFile,
  RHFAutocompleteObj,
} from '../../../components/hook-form';
import GridItem from '../../../components/GridItem';
import { DialogButons } from '../../../components/Actions';

// --- ARQUIVAR PROCESSO -----------------------------------------------------------------------------------------------

export function ArquivarForm({ naoFinal, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, checklist } = useSelector((state) => state.parametrizacao);
  const cheklistOutros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);

  useEffect(() => {
    dispatch(getFromParametrizacao('checklist', { fluxoId: processo?.fluxo_id, reset: { val: [] } }));
  }, [dispatch, processo?.fluxo_id]);

  const informarConta = useMemo(
    () =>
      !processo?.limpo &&
      !processo?.origem_id &&
      processo?.fluxo !== 'Encerramento de conta' &&
      meusAmbientes?.find(({ id }) => id === processo?.estado?.estado_id)?.isfinal,
    [meusAmbientes, processo]
  );

  const formSchema = Yup.object().shape({
    entidades: informarConta && Yup.string().required().label('Nº de entidade(s)'),
    conta: informarConta && Yup.number().positive().required().label('Nº de conta'),
    data_entrada: Yup.date().typeError('Introduza uma data válida').required().label('Data de entrada'),
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
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    try {
      const formData = {
        conta: values?.conta,
        entidades: values?.entidade,
        fluxo_id: processo?.fluxo_id,
        noperacao: values?.noperacao,
        observacao: values?.observacao,
        data_entrada: format(values.data_entrada, 'yyyy-MM-dd'),
      };

      const anexos = new FormData();
      values?.anexos?.forEach((row, index) => {
        anexos.append(`anexos[${index}].tipo_documento_id`, cheklistOutros?.tipo_id);
        anexos.append(`anexos[${index}].anexo`, row);
      });

      const params = { id: processo?.id, msg: 'Processo arquivado', anexos: values?.anexos?.length ? anexos : null };
      dispatch(updateItem('arquivar', JSON.stringify(formData), { estadoId: processo?.estado?.estado_id, ...params }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            {naoFinal?.length > 0 && (
              <GridItem>
                <Alert severity="error">
                  <Typography variant="caption">
                    Geralmente, este processo é encaminhado para outro estado fora da sua Unidade Orgânica.
                    Certifique-se de que pretende realmente arquivá-lo em vez de o encaminhar.
                  </Typography>
                  <Typography sx={{ typography: 'caption', fontWeight: 700, mt: 0.5 }}>Posssíveis destinos:</Typography>
                  {naoFinal?.map((row) => (
                    <Stack key={row} direction="row" spacing={0.5} alignItems="center">
                      <CircleIcon sx={{ width: 6, height: 6, ml: 1 }} />
                      <Typography variant="caption">{row}</Typography>
                    </Stack>
                  ))}
                </Alert>
              </GridItem>
            )}
            <GridItem sm={6} children={<RHFDataEntrada name="data_entrada" label="Data de entrada" disableFuture />} />
            <GridItem sm={6} children={<RHFNumberField noFormat name="noperacao" label="Nº de operação" />} />
            <GridItem sm={6} children={<RHFTextField name="entidades" label="Nº entidade(s)" />} />
            {processo?.fluxo !== 'Encerramento de conta' && (
              <GridItem sm={6} children={<RHFNumberField noFormat name="conta" label="Nº de conta" />} />
            )}
            <GridItem children={<RHFTextField name="observacao" multiline rows={4} label="Observação" />} />
            {!!cheklistOutros && (
              <GridItem xs={12}>
                <RHFUploadMultiFile small name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              </GridItem>
            )}
          </Grid>
          <DialogButons color="error" label="Arquivar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- DESARQUIVAR PROCESSO --------------------------------------------------------------------------------------------

export function DesarquivarForm({ id, colaboradores }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    perfil: Yup.mixed().required('Colaborador não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { estado: null, perfil: null, observacao: '' },
  });
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });

  useEffect(() => {
    if (id) dispatch(getInfoProcesso('destinosDesarquivamento', { id }));
  }, [dispatch, id]);

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
      const params = { id, msg: 'Processo desarquivado', onClose: () => dispatch(setModal()) };
      dispatch(updateItem('desarquivar', JSON.stringify(dados), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(setModal())} fullWidth maxWidth="sm">
      <DialogTitle>Desarquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj
              name="estado"
              label="Estado"
              options={(processo?.destinosDesarquivamento || [])?.map(({ id, nome }) => ({ id, label: nome }))}
            />
            {values?.estado?.id && <RHFAutocompleteObj name="perfil" label="Colaborador" options={colaboradores} />}
            <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
          </Stack>
          <DialogButons color="error" label="Desarquivar" isSaving={isSaving} onClose={() => dispatch(setModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
