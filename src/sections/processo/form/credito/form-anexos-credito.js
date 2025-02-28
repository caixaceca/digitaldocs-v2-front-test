import * as Yup from 'yup';
import { useMemo } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
import { createProcesso, updateItem } from '../../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../../components/hook-form';
import { ButtonsStepper } from '../../../../components/Actions';
// sections
import Anexos from '../anexos';

// ----------------------------------------------------------------------

FormAnexosCredito.propTypes = { dados: PropTypes.object };

export default function FormAnexosCredito({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { cc } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { checklist } = useSelector((state) => state.parametrizacao);
  const { isEdit, fluxo, estado, processo } = dados;
  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const checkList = useMemo(() => checklist?.filter(({ designacao }) => designacao !== 'OUTROS'), [checklist]);

  const formSchema = Yup.object().shape({
    anexos: !isEdit && checkList?.length === 0 && Yup.array().min(1, 'Introduza pelo menos um anexo').label(''),
  });

  const defaultValues = useMemo(() => ({ anexos: dadosStepper?.anexos || [] }), [dadosStepper]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const { situacao_final_mes: situacao } = dadosStepper;
      const contratado = situacao === 'Contratado';
      const desistido = situacao === 'Desistido' && !!dadosStepper.data_desistido;
      const indeferido = situacao === 'Indeferido' && !!dadosStepper.data_indeferido;

      const formData = new FormData();
      formData.append('fluxo_id', fluxo?.id);
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('titular', dadosStepper.titular);
      formData.append('linha_id', dadosStepper?.linha?.id);
      formData.append('taxa_juro', dadosStepper.taxa_juro);
      formData.append('finalidade', dadosStepper.finalidade);
      formData.append('componente_id', dadosStepper?.componente?.id);
      formData.append('setor_atividade', dadosStepper.setor_atividade);
      formData.append('tipo_titular_id', dadosStepper?.tipo_titular?.id);
      formData.append('prazo_amortizacao', dadosStepper.prazo_amortizacao);
      formData.append('balcao', processo?.balcao || Number(cc?.uo?.balcao));
      formData.append('montante_solicitado', dadosStepper.montante_solicitado);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper?.numero_proposta) formData.append('numero_proposta', dadosStepper.numero_proposta);

      dadosStepper?.garantias?.forEach((row, index) => {
        formData.append(`garantias[${index}].fiador`, row?.fiador);
        formData.append(`garantias[${index}].pessoal`, row?.pessoal);
        formData.append(`garantias[${index}].avalista`, row?.avalista);
        formData.append(`garantias[${index}].moeda`, row?.moeda || null);
        formData.append(`garantias[${index}].conta_dp`, row?.conta_dp || null);
        formData.append(`garantias[${index}].valor_garantia`, row?.valor_garantia || null);
        formData.append(`garantias[${index}].numero_entidade`, row?.numero_entidade || null);
        formData.append(`garantias[${index}].tipo_garantia_id`, row?.tipo_garantia_id?.id || null);
        formData.append(`garantias[${index}].codigo_hipoteca_camara`, row?.codigo_hipoteca_camara || null);
        formData.append(`garantias[${index}].codigo_hipoteca_cartorio`, row?.codigo_hipoteca_cartorio || null);
      });

      values?.anexos?.forEach((row, index) => {
        formData.append(`anexos[${index}].anexo`, row);
        // formData.append(`anexos[${index}].data_emissao`, null);
        // formData.append(`anexos[${index}].data_validade`, null);
        // formData.append(`anexos[${index}].numero_entidade`, null);
        formData.append(`anexos[${index}].tipo_documento_id`, outros?.id);
      });

      if (isEdit) {
        formData.append('diadomes', '');
        formData.append('agendado', false);
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
        formData.append('uo_perfil_id', cc?.uo?.id);
        formData.append('situacao_final_mes', situacao);
        if (
          situacao === 'Aprovado' ||
          situacao === 'Contratado' ||
          (situacao === 'Desistido' && dadosStepper.montante_aprovado && dadosStepper.data_aprovacao)
        ) {
          formData.append('montante_aprovado', dadosStepper.montante_aprovado);
          formData.append('data_aprovacao', format(dadosStepper.data_aprovacao, 'yyyy-MM-dd'));
        } else {
          formData.append('data_aprovacao', null);
          formData.append('montante_aprovado', null);
        }

        formData.append('garantia', contratado ? dadosStepper.garantia : null);
        formData.append('escalao_decisao', contratado ? dadosStepper.escalao_decisao : null);
        formData.append('montante_contratado', contratado ? dadosStepper.montante_contratado : null);
        formData.append('data_desistido', desistido ? format(dadosStepper.data_desistido, 'yyyy-MM-dd') : null);
        formData.append('data_indeferido', indeferido ? format(dadosStepper.data_indeferido, 'yyyy-MM-dd') : null);
        formData.append('data_contratacao', contratado ? format(dadosStepper.data_contratacao, 'yyyy-MM-dd') : null);

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
        <Anexos anexos={[]} outros={!!outros} checklist={checkList} />
        <ButtonsStepper
          isSaving={isSaving}
          label={isEdit ? 'Guardar' : 'Adicionar'}
          onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </Stack>
    </FormProvider>
  );
}
