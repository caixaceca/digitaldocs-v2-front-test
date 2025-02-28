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
// utils
import { fillData } from '../../../utils/formatTime';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { createProcesso, updateItem } from '../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../components/hook-form';
import { shapeText, shapeDate, shapeNumber } from '../../../components/hook-form/yup-shape';
// sections
import ProcessoCreditoForm from './form-processo-credito';
import { listaTitrulares, listaProdutos } from '../../gaji9/applySortFilter';

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
  const { linhas, tiposTitular, componentes } = useSelector((state) => state.parametrizacao);
  const credito = processo?.credito || null;
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const tiposTitularList = useMemo(() => listaTitrulares(tiposTitular), [tiposTitular]);

  useEffect(() => {
    dispatch(getFromParametrizacao('linhas'));
    dispatch(getFromParametrizacao('componentes'));
    dispatch(getFromParametrizacao('tiposTitular'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    linha_id: Yup.mixed().required().label('Linha'),
    finalidade: Yup.string().required().label('Finalidade'),
    tipo_titular: Yup.mixed().required().label('Tipo de titular'),
    componente: Yup.mixed().required().label('Produto/Componente'),
    titular: shapeText('Nome do proponente', '', false, 'cliente'),
    situacao_final_mes: isEdit && Yup.mixed().required().label('Situação'),
    garantia: shapeText('Garantia', 'Contratado', '', 'situacao_final_mes'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
    escalao_decisao: shapeText('Decisor', 'Contratado', '', 'situacao_final_mes'),
    cliente: shapeNumber('Nº de cliente', 'Contratado', '', 'situacao_final_mes'),
    prazo_amortizacao: shapeText('Prazo', 'Contratado', '', 'situacao_final_mes'),
    setor_atividade: Yup.string().required().label('Ent. patronal/Set. atividade'),
    taxa_juro: shapeNumber('Taxa de juro', 'Contratado', '', 'situacao_final_mes'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo').label(''),
    montante_solicitado: Yup.number().positive().required().label('Montante solicitado'),
    data_desistido: shapeDate('Data de desistência', 'Desistido', '', 'situacao_final_mes'),
    data_contratacao: shapeDate('Data de contratação', 'Contratado', '', 'situacao_final_mes'),
    data_indeferido: shapeDate('Data de indeferimento', 'Indeferido', '', 'situacao_final_mes'),
    data_aprovacao: shapeDate('Data de aprovação', 'Aprovado', 'Contratado', 'situacao_final_mes'),
    montante_contratado: shapeNumber('Montante contratado', 'Contratado', '', 'situacao_final_mes'),
    montante_aprovado: shapeNumber('Montante aprovado', 'Aprovado', 'Contratado', 'situacao_final_mes'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      obs: processo?.observacao || '',
      titular: processo?.titular || '',
      cliente: processo?.cliente || '',
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
      // info credito
      garantia: credito?.garantia || null,
      taxa_juro: credito?.taxa_juro || '',
      finalidade: credito?.finalidade || '',
      numero_proposta: credito?.nproposta || '',
      setor_atividade: credito?.setor_atividade || '',
      escalao_decisao: credito?.escalao_decisao || null,
      montante_aprovado: credito?.montante_aprovado || '',
      prazo_amortizacao: credito?.prazo_amortizacao || '',
      montante_solicitado: credito?.montante_solicitado || '',
      montante_contratado: credito?.montante_contratado || '',
      situacao_final_mes: credito?.situacao_final_mes || 'Em análise',
      linha_id: credito?.linha ? { id: credito?.linha_id, label: credito?.linha } : null,
      componente: componentesList?.find(({ id }) => id === credito?.componente_id) || null,
      tipo_titular: tiposTitularList?.find(({ id }) => id === credito?.tipo_titular_id) || null,
      data_desistido: fillData(credito?.data_desistido, null),
      data_aprovacao: fillData(credito?.data_aprovacao, null),
      data_indeferido: fillData(credito?.data_indeferido, null),
      data_contratacao: fillData(credito?.data_contratacao, null),
    }),
    [processo, credito, componentesList, tiposTitularList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if ((isEdit && processo) || !isEdit) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, fluxo?.id, linhas, processo]);

  const onSubmit = async () => {
    try {
      const contratado = values.situacao_final_mes === 'Contratado';
      const desistido = values.situacao_final_mes === 'Desistido' && !!values.data_desistido;
      const indeferido = values.situacao_final_mes === 'Indeferido' && !!values.data_indeferido;

      const formData = new FormData();
      // required
      formData.append('fluxo_id', fluxo?.id);
      formData.append('titular', values.titular);
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('finalidade', values.finalidade);
      formData.append('linha_id', values?.linha_id?.id);
      formData.append('componente_id', values?.componente?.id);
      formData.append('setor_atividade', values.setor_atividade);
      formData.append('tipo_titular_id', values?.tipo_titular?.id);
      formData.append('montante_solicitado', values.montante_solicitado);
      formData.append('balcao', processo?.balcao || Number(cc?.uo?.balcao));
      formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
      // optional
      if (values.obs) formData.append('obs', values.obs);
      if (values.cliente) formData.append('cliente', values.cliente);
      if (values?.numero_proposta) formData.append('numero_proposta', values.numero_proposta);

      await values?.anexos?.forEach((row) => {
        formData.append('anexos', row);
      });

      if (isEdit) {
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

        formData.append('data_desistido', desistido ? format(values.data_desistido, 'yyyy-MM-dd') : '');
        formData.append('data_indeferido', indeferido ? format(values.data_indeferido, 'yyyy-MM-dd') : '');

        formData.append('garantia', contratado ? values.garantia : '');
        formData.append('taxa_juro', contratado ? values.taxa_juro : '');
        formData.append('escalao_decisao', contratado ? values.escalao_decisao : '');
        formData.append('prazo_amortizacao', contratado ? values.prazo_amortizacao : '');
        formData.append('montante_contratado', contratado ? values.montante_contratado : '');
        formData.append('data_contratacao', contratado ? format(values.data_contratacao, 'yyyy-MM-dd') : null);

        dispatch(updateItem('processo', formData, { mfd: true, id: processo?.id, msg: 'Processo atualizado' }));
      } else {
        dispatch(createProcesso('interno', formData, { msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center">
        <ProcessoCreditoForm
          isEdit={isEdit}
          componentes={componentesList}
          tiposTitular={tiposTitularList}
          anexos={processo?.anexos?.filter((row) => row?.ativo) || []}
        />
        <LoadingButton type="submit" variant="contained" loading={isSaving}>
          {!isEdit ? 'Adicionar' : 'Guardar'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
