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
import { shapeAnexos, defaultAnexos, garantiasAssociadas, appendAnexos, filterCheckList } from '../anexos/utils-anexos';

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
  const checkList = filterCheckList(checklist, isEdit);
  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);

  const formSchema = shapeAnexos(isEdit, outros, checkList);
  const defaultValues = useMemo(
    () => defaultAnexos(dadosStepper, checkList, processo?.anexos || []),
    [dadosStepper, checkList, processo?.anexos]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const balcao = processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo?.balcao;

      const formData = new FormData();
      formData.append('balcao', balcao);
      formData.append('agendado', false);
      formData.append('fluxo_id', fluxo?.id);
      formData.append('linha_id', dadosStepper?.linha?.id);
      formData.append('taxa_juro', dadosStepper.taxa_juro);
      formData.append('finalidade', dadosStepper.finalidade);
      formData.append('componente_id', dadosStepper?.componente?.id);
      formData.append('setor_atividade', dadosStepper.setor_atividade);
      formData.append('tipo_titular_id', dadosStepper?.tipo_titular?.id);
      formData.append('prazo_amortizacao', dadosStepper.prazo_amortizacao);
      formData.append('montante_solicitado', dadosStepper.montante_solicitado);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));
      formData.append('situacao_final_mes', processo?.credito?.situacao_final_mes || 'Em análise');

      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper?.numero_proposta) formData.append('numero_proposta', dadosStepper.numero_proposta);

      if (isEdit) {
        if (processo?.diadomes) formData.append('diadomes', null);
        if (processo?.data_inicio) formData.append('data_inicio', null);
        if (processo?.periodicidade) formData.append('periodicidade', '');
        if (processo?.data_arquivamento) formData.append('data_arquivamento', null);
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
        <Anexos anexos={processo?.anexos || []} outros={!!outros} checklist={checkList} isEdit={isEdit} />
        <ButtonsStepper
          isSaving={isSaving}
          label={isEdit ? 'Guardar' : 'Adicionar'}
          onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </Stack>
    </FormProvider>
  );
}
