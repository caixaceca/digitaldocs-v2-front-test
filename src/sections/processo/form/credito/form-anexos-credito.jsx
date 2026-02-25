import { useMemo } from 'react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
// redux
import { updateDados } from '@/redux/slices/stepper';
import { useSelector, useDispatch } from '@/redux/store';
import { createProcesso } from '@/redux/slices/digitaldocs';
// components
import { FormProvider } from '@/components/hook-form';
import { ButtonsStepper } from '@/components/Actions';
// sections
import Anexos from '../anexos';
import { shapeAnexos, defaultAnexos, appendAnexos } from '../anexos/utils-anexos';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormAnexosCredito({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { checklist } = useSelector((state) => state.parametrizacao);

  const { estado, id, onClose } = dados;
  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const checkList = useMemo(
    () => checklist?.filter(({ designacao }) => designacao !== 'OUTROS' && designacao !== 'ATA - PARECER DE CRÉDITO'),
    [checklist]
  );

  const formSchema = shapeAnexos(outros, checkList);
  const defaultValues = useMemo(() => defaultAnexos(dadosStepper, checkList, []), [dadosStepper, checkList]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('agendado', false);
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('balcao', dadosStepper?.balcao);
      formData.append('fluxo_id', dadosStepper?.fluxo_id);
      formData.append('situacao_final_mes', 'Em análise');
      formData.append('taxa_juro', dadosStepper.taxa_juro);
      formData.append('finalidade', dadosStepper.finalidade);
      formData.append('linha_id', dadosStepper?.linha_id?.id);
      formData.append('setor_atividade', dadosStepper.setor_atividade);
      formData.append('componente_id', dadosStepper?.componente_id?.id);
      formData.append('prazo_amortizacao', dadosStepper.prazo_amortizacao);
      formData.append('tipo_titular_id', dadosStepper?.tipo_titular_id?.id);
      formData.append('montante_solicitado', dadosStepper.montante_solicitado);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));

      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper?.numero_proposta) formData.append('numero_proposta', dadosStepper.numero_proposta);

      appendAnexos(formData, values.anexos, outros, values.checklist);
      dispatch(createProcesso('processo', formData, { id, msg: 'Processo adicionado', onClose }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center">
        <Anexos anexos={[]} outros={!!outros} />
        <ButtonsStepper
          label="Adicionar"
          isSaving={isSaving}
          onClose={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </Stack>
    </FormProvider>
  );
}
