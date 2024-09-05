import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
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
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoCreditoForm from './ProcessoCreditoForm';

// ----------------------------------------------------------------------

ProcessoCredito.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, processo: PropTypes.object };

export default function ProcessoCredito({ isEdit, processo, fluxo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId, cc } = useSelector((state) => state.intranet);
  const { meuAmbiente, linhas } = useSelector((state) => state.parametrizacao);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const credito = processo?.credito || null;

  const formSchema = Yup.object().shape({
    linha_id: Yup.mixed().required().label('Linha'),
    segmento: Yup.string().required().label('Segmento'),
    finalidade: Yup.string().required().label('Finalidade'),
    setor_atividade: Yup.string().required().label('Entidade patronal'),
    situacao_final_mes: isEdit && Yup.mixed().required().label('Situação'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo').label(''),
    montante_solicitado: Yup.number().positive().required().label('Montante solicitado'),
    titular: Yup.mixed().when('cliente', {
      is: (cliente) => !cliente,
      then: () => Yup.string().required().label('Proponente'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    data_aprovacao: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Aprovado' || sit === 'Contratado',
      then: () => Yup.date().typeError().required().label('Data de aprovação'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    montante_aprovado: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Aprovado' || sit === 'Contratado',
      then: () => Yup.number().positive().label('Montante aprovado'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    data_desistido: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Desistido',
      then: () => Yup.date().typeError().required().label('Data de desistência'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    data_indeferido: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Indeferido',
      then: () => Yup.date().typeError().required().label('Data de indeferimento'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    garantia: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.string().required().label('Garantia'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    cliente: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.number().positive().label('Nº de cliente'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    montante_contratado: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.number().positive().label('Montante contratado'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    prazo_amortizacao: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.string().required().label('Prazo de amortização'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    escalao_decisao: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.string().required('').label('Escalão de decisão'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    taxa_juro: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.number().positive().label('Taxa de juro'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    data_contratacao: Yup.mixed().when('situacao_final_mes', {
      is: (sit) => sit === 'Contratado',
      then: () => Yup.date().typeError().required().label('Data de contratação'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
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
    if (isEdit && processo) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
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
        dispatch(updateItem('processo', formData, { mail, perfilId, id: processo?.id, msg: 'Processo atualizado' }));
      } else {
        formData.append('situacao_final_mes', 'Em análise');
        formData.append('uo_origem_id', meuAmbiente?.uo_id);
        formData.append('estado_atual_id', meuAmbiente?.id);
        dispatch(createItem('processo interno', formData, { mail, perfilId, msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoCreditoForm isEdit={isEdit} processo={processo} />
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
