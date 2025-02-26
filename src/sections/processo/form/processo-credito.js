import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createProcesso, updateItem } from '../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../components/hook-form';
import { shapeText, shapeDate, shapeNumber } from '../../../components/hook-form/yup-shape';
// sections
import ProcessoCreditoForm from './form-processo-credito';

// ----------------------------------------------------------------------

ProcessoCredito.propTypes = {
  isEdit: PropTypes.bool,
  fluxo: PropTypes.object,
  estado: PropTypes.object,
  processo: PropTypes.object,
};

export default function ProcessoCredito({ isEdit, processo, fluxo, estado }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { linhas } = useSelector((state) => state.parametrizacao);
  const credito = processo?.credito || null;

  const formSchema = Yup.object().shape({
    linha_id: Yup.mixed().required().label('Linha'),
    segmento: Yup.string().required().label('Segmento'),
    titular: shapeText('Proponente', '', false, 'cliente'),
    finalidade: Yup.string().required().label('Finalidade'),
    setor_atividade: Yup.string().required().label('Entidade patronal'),
    situacao_final_mes: isEdit && Yup.mixed().required().label('Situação'),
    garantia: shapeText('Garantia', 'Contratado', '', 'situacao_final_mes'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
    cliente: shapeNumber('Nº de cliente', 'Contratado', '', 'situacao_final_mes'),
    taxa_juro: shapeNumber('Taxa de juro', 'Contratado', '', 'situacao_final_mes'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo').label(''),
    montante_solicitado: Yup.number().positive().required().label('Montante solicitado'),
    data_desistido: shapeDate('Data de desistência', 'Desistido', '', 'situacao_final_mes'),
    escalao_decisao: shapeText('Escalão de decisão', 'Contratado', '', 'situacao_final_mes'),
    data_contratacao: shapeDate('Data de contratação', 'Contratado', '', 'situacao_final_mes'),
    data_indeferido: shapeDate('Data de indeferimento', 'Indeferido', '', 'situacao_final_mes'),
    prazo_amortizacao: shapeText('Prazo de amortização', 'Contratado', '', 'situacao_final_mes'),
    data_aprovacao: shapeDate('Data de aprovação', 'Aprovado', 'Contratado', 'situacao_final_mes'),
    montante_contratado: shapeNumber('Montante contratado', 'Contratado', '', 'situacao_final_mes'),
    montante_aprovado: shapeNumber('Montante aprovado', 'Aprovado', 'Contratado', 'situacao_final_mes'),
  });

  const defaultValues = useMemo(
    () => ({
      conta: '',
      anexos: [],
      entidades: [],
      fluxo_id: fluxo?.id,
      obs: processo?.observacao || '',
      titular: processo?.titular || '',
      cliente: processo?.cliente || '',
      balcao: processo?.balcao || Number(cc?.uo?.balcao),
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
      // info credito
      segmento: credito?.segmento || null,
      garantia: credito?.garantia || null,
      taxa_juro: credito?.taxa_juro || '',
      finalidade: credito?.finalidade || '',
      numero_proposta: credito?.nproposta || '',
      setor_atividade: credito?.setor_atividade || '',
      escalao_decisao: credito?.escalao_decisao || null,
      montante_aprovado: credito?.montante_aprovado || '',
      prazo_amortizacao: credito?.prazo_amortizacao || '',
      montante_solicitado: credito?.montante_solicitado || '',
      situacao_final_mes: credito?.situacao_final_mes || null,
      montante_contratado: credito?.montante_contratado || '',
      linha_id: credito?.linha ? { id: credito?.linha_id, label: credito?.linha } : null,
      data_desistido: credito?.data_desistido ? add(new Date(credito?.data_desistido), { hours: 2 }) : null,
      data_aprovacao: credito?.data_aprovacao ? add(new Date(credito?.data_aprovacao), { hours: 2 }) : null,
      data_indeferido: credito?.data_indeferido ? add(new Date(credito?.data_indeferido), { hours: 2 }) : null,
      data_contratacao: credito?.data_contratacao ? add(new Date(credito?.data_contratacao), { hours: 2 }) : null,
    }),
    [processo, fluxo?.id, credito, cc]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && processo) reset(defaultValues);
    if (!isEdit) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, fluxo?.id, linhas, processo]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      // required
      formData.append('balcao', values.balcao);
      formData.append('titular', values.titular);
      formData.append('fluxo_id', values.fluxo_id);
      formData.append('segmento', values.segmento);
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('finalidade', values.finalidade);
      formData.append('linha_id', values?.linha_id?.id);
      formData.append('setor_atividade', values.setor_atividade);
      formData.append('montante_solicitado', values.montante_solicitado);
      formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
      // optional
      if (values.obs) formData.append('obs', values.obs);
      if (values.conta) formData.append('conta', values.conta);
      if (values.cliente) formData.append('cliente', values.cliente);
      if (values?.numero_proposta) formData.append('numero_proposta', values.numero_proposta);
      if (values?.entidades?.length > 0)
        formData.append(
          'entidades',
          values.entidades.map((row) => row?.numero)
        );

      await values?.anexos?.forEach((row) => {
        formData.append('anexos', row);
      });

      if (processo) {
        formData.append('diadomes', '');
        formData.append('agendado', false);
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
        formData.append('uo_perfil_id', cc?.uo?.id);
        formData.append('situacao_final_mes', values.situacao_final_mes);
        if (
          values.situacao_final_mes === 'Aprovado' ||
          values.situacao_final_mes === 'Contratado' ||
          (values.situacao_final_mes === 'Desistido' && values.montante_aprovado && values.data_aprovacao)
        ) {
          formData.append('montante_aprovado', values.montante_aprovado);
          formData.append('data_aprovacao', format(values.data_aprovacao, 'yyyy-MM-dd'));
        } else {
          formData.append('data_aprovacao', '');
          formData.append('montante_aprovado', '');
        }
        if (values.situacao_final_mes === 'Indeferido' && values.data_indeferido)
          formData.append('data_indeferido', format(values.data_indeferido, 'yyyy-MM-dd'));
        else formData.append('data_indeferido', '');

        if (values.situacao_final_mes === 'Desistido' && values.data_desistido)
          formData.append('data_desistido', format(values.data_desistido, 'yyyy-MM-dd'));
        else formData.append('data_desistido', '');

        if (values.situacao_final_mes === 'Contratado') {
          formData.append('garantia', values.garantia);
          formData.append('taxa_juro', values.taxa_juro);
          formData.append('escalao_decisao', values.escalao_decisao);
          formData.append('prazo_amortizacao', values.prazo_amortizacao);
          formData.append('montante_contratado', values.montante_contratado);
          formData.append('data_contratacao', format(values.data_contratacao, 'yyyy-MM-dd'));
        } else {
          formData.append('garantia', '');
          formData.append('taxa_juro', '');
          formData.append('escalao_decisao', '');
          formData.append('prazo_amortizacao', '');
          formData.append('data_contratacao', '');
          formData.append('montante_contratado', '');
        }
        dispatch(updateItem('processo', formData, { mfd: true, id: processo?.id, msg: 'Processo atualizado' }));
      } else {
        formData.append('situacao_final_mes', 'Em análise');
        dispatch(createProcesso('interno', formData, { msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center">
        <ProcessoCreditoForm isEdit={isEdit} processo={processo} />
        <LoadingButton type="submit" variant="contained" loading={isSaving}>
          {!isEdit ? 'Adicionar' : 'Guardar'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
