import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate } from '../../../../utils/formatTime';
// redux
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDataEntrada,
  RHFNumberField,
  RHFAutocompleteSmp,
} from '../../../../components/hook-form';
import { DialogButons } from '../../../../components/Actions';
import { DialogConfirmar } from '../../../../components/CustomDialog';
import { shapeMixed, shapeNumber, shapeText } from '../../../../components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

FormSituacao.propTypes = { onClose: PropTypes.func };

export function FormSituacao({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { credito = null } = processo;
  const situacoes = (credito?.situacao_final_mes === 'Aprovado' && ['Contratado', 'Desistido']) || [
    'Aprovado',
    'Indeferido',
    'Desistido',
  ];

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
      garantia: credito?.garantia,
      taxa_juro: credito?.taxa_juro,
      prazo_amortizacao: credito?.prazo_amortizacao,
      montante:
        (credito?.situacao_final_mes === 'Em análise' && credito?.montante_solicitado) ||
        (credito?.situacao_final_mes === 'Aprovado' && credito?.montante_aprovado) ||
        '',
    }),
    [credito]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        garantia: values?.garantia ?? null,
        montante: values?.montante ?? null,
        taxa_juro: values?.taxa_juro ?? null,
        aprovar: values.situacao === 'Aprovado',
        desistir: values.situacao === 'Desistido',
        contratar: values.situacao === 'Contratado',
        indeferir: values.situacao === 'Indeferido',
        escalao_decisao: values?.escalao_decisao ?? null,
        prazo_amortizacao: values?.prazo_amortizacao ?? null,
        data_referencia: formatDate(values?.data_referencia, 'yyyy-MM-dd'),
      };
      const params = { id: processo?.id, creditoId: credito?.id, msg: 'Stiuação atualizada' };
      dispatch(updateItem('situacaoCredito', JSON.stringify(formData), { ...params, onClose, fillCredito: true }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Situação do pedido de crédito</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteSmp name="situacao" label="Situação" options={situacoes} />
            {values?.situacao === 'Aprovado' && (
              <>
                <RHFAutocompleteSmp
                  label="Decisor"
                  name="escalao_decisao"
                  options={['1º Comitê', '2º Comitê', '3º Comitê']}
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
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

EliminarDadosSituacao.propTypes = { onClose: PropTypes.func };

export function EliminarDadosSituacao({ onClose }) {
  const dispatch = useDispatch();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { credito = null } = processo;
  const situacao = credito?.situacao_final_mes;
  const params = { id: processo?.id, creditoId: credito?.id, msg: 'Stiuação eliminada' };

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      desc={`eliminar os dados ${situacao} deste processo`}
      handleOk={() =>
        dispatch(
          updateItem(
            'situacaoCredito',
            JSON.stringify({
              montante: null,
              data_referencia: null,
              escalao_decisao: null,
              aprovar: situacao === 'Aprovado',
              desistir: situacao === 'Desistido',
              contratar: situacao === 'Contratado',
              indeferir: situacao === 'Indeferido',
            }),
            { ...params, fillCredito: true, onClose }
          )
        )
      }
    />
  );
}
