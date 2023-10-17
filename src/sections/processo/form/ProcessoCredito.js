import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
// utils
import { format, add } from 'date-fns';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createItem, updateItem } from '../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoCreditoForm from './ProcessoCreditoForm';

// ----------------------------------------------------------------------

ProcessoCredito.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoCredito({ isEdit, selectedProcesso, fluxo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meuAmbiente, processoId, linhas, isSaving, done, error } = useSelector((state) => state.digitaldocs);
  const perfilId = cc?.perfil_id;
  const credito = selectedProcesso?.credito || null;
  const [estado, setEstado] = useState(credito?.situacao_final_mes);

  useEffect(() => {
    if (done === 'processo adicionado') {
      enqueueSnackbar('Processo adicionado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
    } else if (done === 'processo atualizado') {
      enqueueSnackbar('Processo atualizado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
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
    linha_id: Yup.mixed().required('Linha não pode ficar vazio'),
    titular: Yup.string().required('Proponente não pode ficar vazio'),
    segmento: Yup.string().required('Segmento  não pode ficar vazio'),
    finalidade: Yup.string().required('Finalidade não pode ficar vazio'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    setor_atividade: Yup.string().required('Setor de atividade não pode ficar vazio'),
    situacao_final_mes: isEdit && Yup.mixed().required('Situação não pode ficar vazio'),
    cliente: estado === 'Contratado' && Yup.number().typeError('Introduza o nº de cliente'),
    taxa_juro: estado === 'Contratado' && Yup.number().typeError('Introduza a taxa de juro'),
    garantia: estado === 'Contratado' && Yup.string().required('Garantia não pode ficar vazio'),
    montante_contratado: estado === 'Contratado' && Yup.number().typeError('Introduza o montante contratado'),
    data_entrada: Yup.date()
      .typeError('Introduza a data de entrada do processo na agência')
      .required('Introduza a data de entrada do processo na agência'),
    data_desistido:
      estado === 'Desistido' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de desistência não pode ficar vazio'),
    escalao_decisao: estado === 'Contratado' && Yup.string().required('Escalão de decisão não pode ficar vazio'),
    data_contratacao:
      estado === 'Contratado' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de contratação não pode ficar vazio'),
    data_indeferido:
      estado === 'Indeferido' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de indeferimento não pode ficar vazio'),
    prazo_amortizacao: estado === 'Contratado' && Yup.string().required('Prazo de amortização não pode ficar vazio'),
    data_aprovacao:
      (estado === 'Aprovado' || estado === 'Contratado') &&
      Yup.date().typeError('Introduza uma data válida').required('Data de aprovação não pode ficar vazio'),
    montante_solicitado: Yup.number()
      .typeError('Introduza o montante solicitado')
      .required('Introduza o montante solicitado'),
    montante_aprovado:
      (estado === 'Aprovado' || estado === 'Contratado') && Yup.number().typeError('Introduza o montante aprovado'),
  });

  const defaultValues = useMemo(
    () => ({
      conta: '',
      anexos: [],
      entidades: [],
      fluxo_id: fluxo?.id,
      obs: selectedProcesso?.obs || '',
      mobs: selectedProcesso?.mobs || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      agendado: selectedProcesso?.agendado || false,
      perfil_id: selectedProcesso?.perfil_id || cc?.perfil_id,
      balcao: selectedProcesso?.balcao || Number(cc?.uo?.balcao),
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      // info credito
      segmento: credito?.segmento || null,
      garantia: credito?.garantia || null,
      taxa_juro: credito?.taxa_juro || '',
      finalidade: credito?.finalidade || '',
      numero_proposta: credito?.nproposta || '',
      montante_solicitado: credito?.montantes || '',
      setor_atividade: credito?.setor_atividade || '',
      escalao_decisao: credito?.escalao_decisao || null,
      montante_aprovado: credito?.montante_aprovado || '',
      prazo_amortizacao: credito?.prazo_amortizacao || '',
      situacao_final_mes: credito?.situacao_final_mes || null,
      montante_contratado: credito?.montante_contratado || '',
      linha_id: credito?.linha ? { id: credito?.linha?.id, label: credito?.linha?.linha } : null,
      data_desistido: credito?.data_desistido ? add(new Date(credito?.data_desistido), { hours: 2 }) : null,
      data_aprovacao: credito?.data_aprovacao ? add(new Date(credito?.data_aprovacao), { hours: 2 }) : null,
      data_indeferido: credito?.data_indeferido ? add(new Date(credito?.data_indeferido), { hours: 2 }) : null,
      data_contratacao: credito?.data_contratacao ? add(new Date(credito?.data_contratacao), { hours: 2 }) : null,
    }),
    [selectedProcesso, fluxo?.id, credito, meuAmbiente, cc]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedProcesso) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, fluxo?.id, linhas, selectedProcesso]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      // required
      formData.append('modelo', fluxo?.modelo);
      formData.append('balcao', values.balcao);
      formData.append('titular', values.titular);
      formData.append('fluxo_id', values.fluxo_id);
      formData.append('segmento', values.segmento);
      formData.append('finalidade', values.finalidade);
      formData.append('linha_id', values?.linha_id?.id);
      formData.append('setor_atividade', values.setor_atividade);
      formData.append('montante_solicitado', values.montante_solicitado);
      formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
      // optional
      if (values.obs) {
        formData.append('obs', values.obs);
      }
      if (values.conta) {
        formData.append('conta', values.conta);
      }
      if (values.cliente) {
        formData.append('cliente', values.cliente);
      }
      if (values?.numero_proposta) {
        formData.append('numero_proposta', values.numero_proposta);
      }
      if (values?.entidades?.length > 0) {
        formData.append(
          'entidades',
          values.entidades.map((row) => row?.numero)
        );
      }
      if (values?.anexos?.length > 0) {
        for (let i = 0; i < values.anexos.length; i += 1) {
          formData.append('anexos', values.anexos[i]);
        }
      }

      if (selectedProcesso) {
        formData.append('diadomes', '');
        formData.append('agendado', false);
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
        formData.append('uo_perfil_id ', cc?.uo?.id);
        formData.append('is_interno ', selectedProcesso?.is_interno);
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
        if (values.situacao_final_mes === 'Indeferido' && values.data_indeferido) {
          formData.append('data_indeferido', format(values.data_indeferido, 'yyyy-MM-dd'));
        } else {
          formData.append('data_indeferido', '');
        }
        if (values.situacao_final_mes === 'Desistido' && values.data_desistido) {
          formData.append('data_desistido', format(values.data_desistido, 'yyyy-MM-dd'));
        } else {
          formData.append('data_desistido', '');
        }
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
        dispatch(
          updateItem('processo', formData, { mail, perfilId, id: selectedProcesso?.id, msg: 'processo atualizado' })
        );
      } else {
        formData.append('perfil_id', values.perfil_id);
        formData.append('situacao_final_mes', 'Em análise');
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        dispatch(createItem('processo interno', formData, { mail, perfilId, msg: 'processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoCreditoForm isEdit={isEdit} setEstado={setEstado} selectedProcesso={selectedProcesso} />
        </Grid>

        <Grid item xs={12} textAlign="center">
          <LoadingButton size="large" type="submit" variant="contained" loading={isSaving}>
            {!isEdit ? 'Adicionar' : 'Guardar'}
          </LoadingButton>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
