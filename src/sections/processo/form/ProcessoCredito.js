import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Grid } from '@mui/material';
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
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { meuAmbiente, processoId, motivosPendencias, linhas, isSaving, done, error } = useSelector(
    (state) => state.digitaldocs
  );
  const perfilId = currentColaborador?.perfil_id;
  const [pendente, setPendente] = useState(selectedProcesso?.ispendente || false);
  const [aprovado, setAprovado] = useState(!!selectedProcesso?.credito?.montante_aprovado);
  const [contratado, setContratado] = useState(!!selectedProcesso?.credito?.montante_contratado);

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
    titular: Yup.string().required('Proponente não pode ficar vazio'),
    finalidade: Yup.string().required('Finalidade não pode ficar vazio'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    setor_atividade: Yup.string().required('Setor de atividade não pode ficar vazio'),
    numero_proposta: contratado && Yup.string().required('Nº de proposta não pode ficar vazio'),
    linha_id: Yup.mixed().nullable('Linha não pode ficar vazio').required('Linha não pode ficar vazio'),
    segmento: Yup.string().nullable('Segmento  não pode ficar vazio').required('Segmento  não pode ficar vazio'),
    cliente: contratado && Yup.number().typeError('Introduza o nº de cliente').required('Introduza o nº de cliente'),
    situacao_final_mes: Yup.string()
      .nullable('Situação final do mês não pode ficar vazio')
      .required('Situação final do mês não pode ficar vazio'),
    data_entrada: Yup.date()
      .typeError('Data de entrada não pode ficar vazio')
      .required('Data de entrada não pode ficar vazio'),
    data_aprovacao:
      aprovado &&
      Yup.date().typeError('Data de aprovação não pode ficar vazio').required('Data de aprovação não pode ficar vazio'),
    data_contratacao:
      contratado &&
      Yup.date()
        .typeError('Data de contratação não pode ficar vazio')
        .required('Data de contratação não pode ficar vazio'),
    montante_solicitado: Yup.number()
      .typeError('Introduza o montante solicitado')
      .required('Introduza o montante solicitado'),
    montante_aprovado:
      aprovado && Yup.number().typeError('Introduza o montante solicitado').required('Introduza o montante solicitado'),
    montante_contratado:
      contratado &&
      Yup.number().typeError('Introduza o montante solicitado').required('Introduza o montante solicitado'),
    mpendencia:
      pendente &&
      Yup.mixed()
        .nullable('Motivo de pendência não pode ficar vazio')
        .required('Motivo de pendência não pode ficar vazio'),
    escalao_decisao:
      contratado &&
      Yup.string()
        .nullable('Escalão de decisão não pode ficar vazio')
        .required('Escalão de decisão não pode ficar vazio'),
    garantia: contratado && Yup.string().required('Garantia não pode ficar vazio'),
    prazo_amortizacao: contratado && Yup.string().required('Prazo de amortização não pode ficar vazio'),
    taxa_juro: contratado && Yup.number().typeError('Introduza a taxa de juro').required('Introduza a taxa de juro'),
  });
  const _entidades = useMemo(
    () => selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row })) || [],
    [selectedProcesso?.entidades]
  );

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: _entidades,
      obs: selectedProcesso?.obs || '',
      mobs: selectedProcesso?.mobs || '',
      conta: selectedProcesso?.conta || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      agendado: selectedProcesso?.agendado || false,
      ispendente: selectedProcesso?.ispendente || false,
      aprovado: !!selectedProcesso?.credito?.montante_aprovado,
      contratado: !!selectedProcesso?.credito?.montante_contratado,
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      perfil_id: selectedProcesso?.perfil_id || currentColaborador?.perfil_id,
      balcao: selectedProcesso?.balcao || Number(currentColaborador?.uo?.balcao),
      mpendencia: selectedProcesso?.mpendencia
        ? motivosPendencias?.find((row) => row?.id?.toString() === selectedProcesso?.mpendencia?.toString())
        : null,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      // info credito
      segmento: selectedProcesso?.credito?.segmento || null,
      garantia: selectedProcesso?.credito?.garantia || null,
      taxa_juro: selectedProcesso?.credito?.taxa_juro || '',
      finalidade: selectedProcesso?.credito?.finalidade || '',
      numero_proposta: selectedProcesso?.credito?.nproposta || '',
      montante_solicitado: selectedProcesso?.credito?.montantes || '',
      setor_atividade: selectedProcesso?.credito?.setor_atividade || '',
      escalao_decisao: selectedProcesso?.credito?.escalao_decisao || null,
      montante_aprovado: selectedProcesso?.credito?.montante_aprovado || '',
      prazo_amortizacao: selectedProcesso?.credito?.prazo_amortizacao || '',
      situacao_final_mes: selectedProcesso?.credito?.situacao_final_mes || null,
      montante_contratado: selectedProcesso?.credito?.montante_contratado || '',
      linha_id: selectedProcesso?.credito?.linha_id
        ? linhas?.find((row) => row?.id === selectedProcesso?.credito?.linha_id)
        : null,
      data_aprovacao: selectedProcesso?.credito?.data_aprovacao
        ? add(new Date(selectedProcesso?.credito?.data_aprovacao), { hours: 2 })
        : null,
      data_contratacao: selectedProcesso?.credito?.data_contratacao
        ? add(new Date(selectedProcesso?.credito?.data_contratacao), { hours: 2 })
        : null,
    }),
    [selectedProcesso, fluxo?.id, motivosPendencias, _entidades, linhas, meuAmbiente, currentColaborador]
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
      if (selectedProcesso) {
        const formData = new FormData();
        // required
        formData.append('agendado', false);
        formData.append('balcao', values.balcao);
        formData.append('modelo', fluxo?.modelo);
        formData.append('titular', values.titular);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('segmento', values.segmento);
        formData.append('finalidade', values.finalidade);
        formData.append('linha_id', values?.linha_id?.id);
        formData.append('setor_atividade', values.setor_atividade);
        formData.append('is_interno ', selectedProcesso?.is_interno);
        formData.append('uo_perfil_id ', currentColaborador?.uo?.id);
        formData.append('situacao_final_mes', values.situacao_final_mes);
        formData.append('montante_solicitado', values.montante_solicitado);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.aprovado) {
          formData.append('montante_aprovado', values.montante_aprovado);
          formData.append('data_aprovacao', format(values.data_aprovacao, 'yyyy-MM-dd'));
        } else {
          formData.append('data_aprovacao', null);
          formData.append('montante_aprovado', '');
        }
        if (values.contratado) {
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
          formData.append('data_contratacao', null);
          formData.append('montante_contratado', '');
        }
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
        formData.append('ispendente', values.ispendente);
        if (values.ispendente) {
          formData.append('ispendente', true);
          if (values.mpendencia) {
            formData.append('mpendencia', values.mpendencia.id);
          }
          if (values.mobs) {
            formData.append('mobs', values.mobs);
          }
        } else {
          formData.append('ispendente', false);
          if (selectedProcesso.mpendencia) {
            formData.append('mpendencia', selectedProcesso.mpendencia);
          }
          if (selectedProcesso.mobs) {
            formData.append('mobs', selectedProcesso.mobs);
          }
        }
        if (values?.entidades?.length !== 0) {
          formData.append(
            'entidades',
            values.entidades.map((row) => row?.numero)
          );
        }
        formData.append('diadomes', '');
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
        if (values?.anexos?.length > 0) {
          for (let i = 0; i < values.anexos.length; i += 1) {
            formData.append('anexos', values.anexos[i]);
          }
        }
        dispatch(
          updateItem('processo', formData, {
            mail,
            perfilId,
            id: selectedProcesso?.id,
            ispendente: values.ispendente,
            mensagem: 'processo atualizado',
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
          })
        );
      } else {
        const formData = new FormData();
        // required
        formData.append('modelo', fluxo?.modelo);
        formData.append('balcao', values.balcao);
        formData.append('titular', values.titular);
        formData.append('segmento', values.segmento);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('perfil_id', values.perfil_id);
        formData.append('finalidade', values.finalidade);
        formData.append('linha_id', values?.linha_id?.id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('setor_atividade', values.setor_atividade);
        formData.append('estado_atual_id', values.estado_atual_id);
        formData.append('situacao_final_mes', values.situacao_final_mes);
        formData.append('montante_solicitado', values.montante_solicitado);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values?.numero_proposta) {
          formData.append('numero_proposta', values.numero_proposta);
        }
        if (values.ispendente) {
          formData.append('ispendente', true);
          if (values.mpendencia) {
            formData.append('mpendencia', values.mpendencia.id);
          }
          if (values.mobs) {
            formData.append('mobs', values.mobs);
          }
        }
        if (values.anexos) {
          const listaanexo = values.anexos;
          for (let i = 0; i < listaanexo.length; i += 1) {
            formData.append('anexos', listaanexo[i]);
          }
        }
        dispatch(
          createItem('processo interno', formData, {
            mail,
            perfilId,
            fluxoId: fluxo?.id,
            estadoId: meuAmbiente?.id,
            ispendente: values.ispendente,
            mensagem: 'processo adicionado',
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoCreditoForm
            isEdit={isEdit}
            setPendente={setPendente}
            setAprovado={setAprovado}
            setContratado={setContratado}
            selectedProcesso={selectedProcesso}
          />
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
