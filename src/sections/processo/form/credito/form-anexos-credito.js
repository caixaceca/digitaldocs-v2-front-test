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
import { shapeAnexos, defaultAnexos, garantiasAssociadas, appendAnexos } from '../anexos/utils-anexos';

// ----------------------------------------------------------------------

FormAnexosCredito.propTypes = { dados: PropTypes.object };

export default function FormAnexosCredito({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, fluxo, estado, processo, onClose } = dados;
  const { cc, uos } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { checklist } = useSelector((state) => state.parametrizacao);
  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const checkList = useMemo(() => checklist?.filter(({ designacao }) => designacao !== 'OUTROS'), [checklist]);

  const formSchema = shapeAnexos(isEdit, outros, checkList);
  const defaultValues = useMemo(() => defaultAnexos(dadosStepper, checkList), [dadosStepper, checkList]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const { situacao_final_mes: situacao } = dadosStepper;
      const contratado = situacao === 'Contratado';
      const desistido = situacao === 'Desistido' && !!dadosStepper.data_desistido;
      const indeferido = situacao === 'Indeferido' && !!dadosStepper.data_indeferido;
      const balcao = processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo?.balcao;

      const formData = new FormData();
      formData.append('balcao', balcao);
      formData.append('fluxo_id', fluxo?.id);
      formData.append('situacao_final_mes', situacao);
      formData.append('titular', dadosStepper.titular);
      formData.append('linha_id', dadosStepper?.linha?.id);
      formData.append('taxa_juro', dadosStepper.taxa_juro);
      formData.append('finalidade', dadosStepper.finalidade);
      formData.append('componente_id', dadosStepper?.componente?.id);
      formData.append('setor_atividade', dadosStepper.setor_atividade);
      formData.append('tipo_titular_id', dadosStepper?.tipo_titular?.id);
      formData.append('prazo_amortizacao', dadosStepper.prazo_amortizacao);
      formData.append('montante_solicitado', dadosStepper.montante_solicitado);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));

      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper?.numero_proposta) formData.append('numero_proposta', dadosStepper.numero_proposta);

      if (isEdit) {
        formData.append('diadomes', '');
        formData.append('agendado', false);
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
        formData.append('uo_perfil_id', cc?.uo?.id);
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

        formData.append('escalao_decisao', contratado ? dadosStepper.escalao_decisao : null);
        formData.append('montante_contratado', contratado ? dadosStepper.montante_contratado : null);
        formData.append('data_desistido', desistido ? format(dadosStepper.data_desistido, 'yyyy-MM-dd') : null);
        formData.append('data_indeferido', indeferido ? format(dadosStepper.data_indeferido, 'yyyy-MM-dd') : null);
        formData.append('data_contratacao', contratado ? format(dadosStepper.data_contratacao, 'yyyy-MM-dd') : null);
      }

      if (!isEdit) {
        formData.append('uo_origem_id', estado?.uo_id);
        formData.append('estado_atual_id', estado?.id);
      }

      appendAnexos(formData, values.anexos, outros, values.checklist);

      const garantias = dadosStepper?.garantias?.length > 0 ? garantiasAssociadas(dadosStepper.garantias) : null;
      const params = { afterSuccess: () => onClose(), msg: `Processo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch(
        (isEdit ? updateItem : createProcesso)('processo', formData, { ...params, id: processo?.id, garantias })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center">
        <Anexos anexos={[]} outros={!!outros} />
        <ButtonsStepper
          isSaving={isSaving}
          label={isEdit ? 'Guardar' : 'Adicionar'}
          onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </Stack>
    </FormProvider>
  );
}
