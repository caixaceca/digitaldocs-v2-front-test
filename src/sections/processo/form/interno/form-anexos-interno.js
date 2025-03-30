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
import { shapeAnexos, defaultAnexos, appendAnexos, filterCheckList } from '../anexos/utils-anexos';

// ----------------------------------------------------------------------

FormAnexosInterno.propTypes = { dados: PropTypes.object };

export default function FormAnexosInterno({ dados }) {
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
      const formData = new FormData();
      const balcao = processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo?.balcao;
      const entidades = dadosStepper?.entidades?.length > 0 ? dadosStepper?.entidades?.map((row) => row?.numero) : null;
      // required
      formData.append('balcao', balcao);
      formData.append('fluxo_id', fluxo?.id);
      formData.append('agendado', dadosStepper.agendado);
      formData.append('data_entrada', format(values?.data_entrada || new Date(), 'yyyy-MM-dd'));
      if (dadosStepper.agendado) {
        formData.append('diadomes', dadosStepper.diadomes);
        formData.append('periodicidade', dadosStepper.periodicidade);
        formData.append('data_inicio', format(dadosStepper.data_inicio, 'yyyy-MM-dd'));
        formData.append('data_arquivamento', format(dadosStepper.data_arquivamento, 'yyyy-MM-dd'));
      } else {
        formData.append('diadomes', '');
        formData.append('periodicidade', '');
        formData.append('data_inicio', null);
        formData.append('data_arquivamento', null);
      }
      // optional
      if (entidades) formData.append('entidades', entidades);
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.email) formData.append('email', dadosStepper.email);
      if (dadosStepper.noperacao) formData.append('noperacao', dadosStepper.noperacao);
      if (fluxo?.assunto === 'Diário') {
        formData.append(
          'titular',
          `${fluxo?.assunto} (${format(dadosStepper.data_entrada ? dadosStepper.data_entrada : new Date(), 'dd/MM/yyyy')})`
        );
      } else if (dadosStepper.titular) formData.append('titular', dadosStepper.titular);

      if (fluxo?.assunto === 'Abertura de Conta') {
        formData.append('conta', '');
        formData.append('cliente', '');
      } else {
        if (dadosStepper.conta) formData.append('conta', dadosStepper.conta);
        if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      }

      if (!isEdit) {
        formData.append('uo_origem_id', estado?.uo_id);
        formData.append('estado_atual_id', estado?.id);
      }

      appendAnexos(formData, values.anexos, outros, values.checklist);

      const params = { afterSuccess: () => onClose(), msg: `Processo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createProcesso)('processo', formData, { ...params, id: processo?.id }));
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
