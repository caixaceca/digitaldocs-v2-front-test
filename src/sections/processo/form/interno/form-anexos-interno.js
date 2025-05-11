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
import { createProcesso } from '../../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../../components/hook-form';
import { ButtonsStepper } from '../../../../components/Actions';
// sections
import Anexos from '../anexos';
import { shapeAnexos, defaultAnexos, appendAnexos } from '../anexos/utils-anexos';

// ----------------------------------------------------------------------

FormAnexosInterno.propTypes = { dados: PropTypes.object };

export default function FormAnexosInterno({ dados }) {
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
      formData.append('uo_origem_id', estado?.uo_id);
      formData.append('estado_atual_id', estado?.id);
      formData.append('balcao', dadosStepper?.balcao);
      formData.append('fluxo_id', dadosStepper?.fluxo_id);
      formData.append('agendado', !!dadosStepper.agendado);
      formData.append('data_entrada', format(dadosStepper?.data_entrada || new Date(), 'yyyy-MM-dd'));
      // optional
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.email) formData.append('email', dadosStepper.email);
      if (dadosStepper.conta) formData.append('conta', dadosStepper.conta);
      if (dadosStepper.titular) formData.append('obs', dadosStepper.titular);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper.noperacao) formData.append('noperacao', dadosStepper.noperacao);
      if (dadosStepper?.entidadesList) formData.append('entidades', dadosStepper?.entidadesList);
      if (dadosStepper.agendado) {
        formData.append('diadomes', dadosStepper.diadomes);
        formData.append('periodicidade', dadosStepper.periodicidade);
        formData.append('data_inicio', format(dadosStepper.data_inicio, 'yyyy-MM-dd'));
        formData.append('data_arquivamento', format(dadosStepper.data_arquivamento, 'yyyy-MM-dd'));
      }

      appendAnexos(formData, values.anexos, outros, values.checklist);
      dispatch(createProcesso('processo', formData, { id, msg: 'Processo adicionado', onClose }));
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
          onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </Stack>
    </FormProvider>
  );
}
