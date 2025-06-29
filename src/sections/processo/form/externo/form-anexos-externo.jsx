import { useMemo } from 'react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
import { createProcesso } from '../../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../../components/hook-form';
import { ButtonsStepper } from '../../../../components/Actions';
// sections
import Anexos from '../anexos';
import { shapeAnexos, defaultAnexos, appendAnexos } from '../anexos/utils-anexos';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormAnexosExterno({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { checklist } = useSelector((state) => state.parametrizacao);

  const { estado, id, onClose } = dados;
  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const checkList = useMemo(() => checklist?.filter(({ designacao }) => designacao !== 'OUTROS'), [checklist]);

  const formSchema = shapeAnexos(outros, checkList);
  const defaultValues = useMemo(() => defaultAnexos(dadosStepper, checkList, []), [dadosStepper, checkList]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      // required
      formData.append('agendado', false);
      formData.append('canal', dadosStepper.canal);
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('balcao', dadosStepper?.balcao);
      formData.append('fluxo_id', dadosStepper?.fluxo_id);
      formData.append('referencia', dadosStepper.referencia);
      formData.append('origem_id', dadosStepper?.origem_id?.id);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));
      // optional
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.conta) formData.append('conta', dadosStepper.conta);
      if (dadosStepper.valor) formData.append('valor', dadosStepper.valor);
      if (dadosStepper.docidp) formData.append('docidp', dadosStepper.docidp);
      if (dadosStepper.docids) formData.append('docids', dadosStepper.docids);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper.titular) formData.append('titular', dadosStepper.titular);
      if (dadosStepper.operacao) formData.append('operacao', dadosStepper.operacao);
      if (dadosStepper?.entidadesList) formData.append('entidades', dadosStepper?.entidadesList);

      appendAnexos(formData, values.anexos, outros, values.checklist);

      dispatch(createProcesso('processo', formData, { onClose, msg: 'Processo adicionado', id, ex: true }));
    } catch (error) {
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
