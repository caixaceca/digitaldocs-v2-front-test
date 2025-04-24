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

FormAnexosExterno.propTypes = { dados: PropTypes.object };

export default function FormAnexosExterno({ dados }) {
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
      formData.append('agendado', false);
      formData.append('fluxo_id', fluxo?.id);
      formData.append('canal', dadosStepper.canal);
      formData.append('referencia', dadosStepper.referencia);
      formData.append('origem_id', dadosStepper?.origem_id?.id);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));

      // optional
      if (entidades) formData.append('entidades', entidades);
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);
      if (dadosStepper.conta) formData.append('conta', dadosStepper.conta);
      if (dadosStepper.valor) formData.append('valor', dadosStepper.valor);
      if (dadosStepper.docidp) formData.append('docidp', dadosStepper.docidp);
      if (dadosStepper.docids) formData.append('docids', dadosStepper.docids);
      if (dadosStepper.cliente) formData.append('cliente', dadosStepper.cliente);
      if (dadosStepper.titular) formData.append('titular', dadosStepper.titular);
      if (dadosStepper.operacao) formData.append('operacao', dadosStepper.operacao);

      if (!isEdit) {
        formData.append('uo_origem_id', estado?.uo_id);
        formData.append('estado_atual_id', estado?.id);
      }

      appendAnexos(formData, values.anexos, outros, values.checklist);

      const params = { afterSuccess: () => onClose(), msg: `Processo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createProcesso)('processo', formData, { ...params, id: processo?.id, ex: true }));
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
