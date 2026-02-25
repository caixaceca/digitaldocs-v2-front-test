import * as Yup from 'yup';
import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate } from '@/utils/formatTime';
import { updateItem } from '@/redux/slices/digitaldocs';
import { useSelector, useDispatch } from '@/redux/store';
// components
import { DialogConfirmar } from '@/components/CustomDialog';
import { DefaultAction, DialogButons } from '@/components/Actions';
import { shapeMixed, shapeNumber, shapeText } from '@/components/hook-form/yup-shape';
import { FormProvider, RHFTextField, RHFDataEntrada, RHFNumberField, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function FormSituacao({ dados, onClose, setOpen }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { isSaving } = useSelector((state) => state.digitaldocs);
  const situacao = useMemo(() => (dados?.situacao_final_mes || 'em análise').toLowerCase(), [dados]);
  const situacoes =
    (situacao === 'aprovado' && ['Contratado', 'Desistido']) ||
    (situacao === 'em análise' && ['Aprovado', 'Indeferido', 'Desistido']) ||
    [];

  const formSchema = Yup.object().shape({
    situacao: Yup.mixed().required().label('Situação'),
    garantia: shapeText('Garantias', 'Aprovado', '', 'situacao'),
    data_referencia: Yup.date().typeError().required().label('Data'),
    escalao_decisao: shapeMixed('Decisor', 'Aprovado', '', 'situacao'),
    taxa_juro: shapeNumber('Taxa de juros', 'Aprovado', '', 'situacao'),
    prazo_amortizacao: shapeNumber('Prazo', 'Aprovado', '', 'situacao'),
    montante: shapeNumber('Montante', 'Aprovado', 'Contratado', 'situacao'),
  });

  const defaultValues = useMemo(
    () => ({
      situacao: null,
      data_referencia: null,
      escalao_decisao: null,
      garantia: dados?.garantia,
      taxa_juro: dados?.taxa_juro,
      prazo_amortizacao: dados?.prazo_amortizacao,
      montante:
        (situacao === 'em análise' && dados?.montante_solicitado) ||
        (situacao === 'aprovado' && dados?.montante_aprovado) ||
        '',
    }),
    [dados, situacao]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    try {
      const formData = {
        garantia: values?.garantia ?? '',
        montante: values?.montante ?? '',
        taxa_juro: values?.taxa_juro ?? '',
        aprovar: values.situacao === 'Aprovado',
        desistir: values.situacao === 'Desistido',
        contratar: values.situacao === 'Contratado',
        indeferir: values.situacao === 'Indeferido',
        escalao_decisao: values?.escalao_decisao ?? null,
        prazo_amortizacao: values?.prazo_amortizacao ?? '',
        data_referencia: formatDate(values?.data_referencia, 'yyyy-MM-dd'),
      };
      const params = { id: dados?.processoId, creditoId: dados?.id, msg: 'Situação atualizada' };
      dispatch(updateItem('situacaoCredito', JSON.stringify(formData), { ...params, onClose, fillCredito: true }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Situação do pedido de crédito</DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ py: 3 }}>
          <Typography variant="body2">Situação atual:</Typography>
          <Chip sx={{ typography: 'overline' }} label={situacao} />
          {situacao !== 'em análise' && (
            <DefaultAction small icon="Remover" label="ELIMINAR" onClick={() => setOpen('eliminar')} />
          )}
        </Stack>
        {situacoes?.length > 0 && (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <RHFAutocompleteSmp name="situacao" label="Situação" options={situacoes} />
              {values?.situacao === 'Aprovado' && (
                <>
                  <RHFAutocompleteSmp
                    label="Decisor"
                    name="escalao_decisao"
                    options={['Comité Base', 'Comité Diretor', 'Comité Superior']}
                  />
                  <Stack direction="row" spacing={3}>
                    <RHFDataEntrada name="data_referencia" label="Data" disableFuture />
                    <RHFNumberField name="montante" label="Montante" tipo="CVE" />
                  </Stack>
                  <Stack direction="row" spacing={3}>
                    <RHFNumberField name="taxa_juro" label="Taxa de juros" tipo="%" />
                    <RHFNumberField name="prazo_amortizacao" label="Prazo" tipo="meses" />
                  </Stack>
                  <RHFTextField name="garantia" label="Garantia" />
                </>
              )}
              {values?.situacao === 'Contratado' && (
                <Stack direction="row" spacing={3}>
                  <RHFDataEntrada name="data_referencia" label="Data" disableFuture />
                  <RHFNumberField name="montante" label="Montante" tipo="CVE" />
                </Stack>
              )}
              {(values?.situacao === 'Desistido' || values?.situacao === 'Indeferido') && (
                <RHFDataEntrada name="data_referencia" label="Data" disableFuture />
              )}
            </Stack>
            <DialogButons isSaving={isSaving} onClose={onClose} label="Guardar" />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const SITUACAO_MAP = {
  aprovado: { label: 'aprovação', key: 'aprovar' },
  desistido: { label: 'desistência', key: 'desistir' },
  contratado: { label: 'contratação', key: 'contratar' },
  indeferido: { label: 'indeferimento', key: 'indeferir' },
};

export function EliminarDadosSituacao({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const config = useMemo(() => {
    const status = (dados?.situacao_final_mes || '').toLowerCase();
    return SITUACAO_MAP[status] || { label: '', key: null };
  }, [dados?.situacao_final_mes]);

  const handleConfirm = () => {
    const payload = { montante: null, data_referencia: null, escalao_decisao: null, [config.key]: true };
    const params = { id: dados?.processoId, creditoId: dados?.id, msg: 'Situação eliminada', fillCredito: true };
    dispatch(updateItem('situacaoCredito', JSON.stringify(payload), { ...params, onClose }));
  };

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      handleOk={handleConfirm}
      content={
        <>
          Tens a certeza de que pretendes eliminar os <b>dados de {config.label}</b> deste processo?
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormNivelDecisao({ id, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    nivel: Yup.mixed().required().label('Escalão'),
    motivo: Yup.string().required().label('Motivo'),
  });

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues: { nivel: null, motivo: null } });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const formData = { nivel: values?.nivel?.id, motivo: values?.motivo };
      const params = { id, fillCredito: true, put: true, msg: 'Escalão de decisão atualizada' };
      dispatch(updateItem('escalaoDecisao', JSON.stringify(formData), { ...params, onClose }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Escalão de decisão final</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteSmp
              name="nivel"
              label="Escalão"
              options={[
                { id: 1, label: 'Comité Base' },
                { id: 2, label: 'Comité Diretor' },
                { id: 3, label: 'Comité Superior' },
              ]}
            />
            <RHFTextField name="motivo" label="Motivo" multiline rows={3} />
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} label="Guardar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
