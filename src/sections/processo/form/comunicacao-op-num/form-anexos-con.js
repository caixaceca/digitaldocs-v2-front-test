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

FormAnexosCON.propTypes = { dados: PropTypes.object };

export default function FormAnexosCON({ dados }) {
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
  const defaultValues = useMemo(() => defaultAnexos(dadosStepper, checkList), [dadosStepper, checkList]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      const balcao = processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo?.balcao;
      // required
      formData.append('balcao', balcao);
      formData.append('fluxo_id', fluxo?.id);
      formData.append('conta', dadosStepper.conta);
      formData.append('valor', dadosStepper.valor);
      formData.append('noperacao', dadosStepper.noperacao);
      formData.append('residente', dadosStepper.residente);
      formData.append('origem_fundo', dadosStepper.origem_fundo);
      formData.append('finalidade_fundo', dadosStepper.finalidade_fundo);
      formData.append('titular_ordenador', dadosStepper.titular_ordenador);
      formData.append('data_entrada', format(dadosStepper.data_entrada, 'yyyy-MM-dd'));
      // depositante
      if (dadosStepper.nif) formData.append('nif', dadosStepper.nif);
      if (dadosStepper.pai) formData.append('pai', dadosStepper.pai);
      if (dadosStepper.mae) formData.append('mae', dadosStepper.mae);
      if (dadosStepper.docid) formData.append('docid', dadosStepper.docid);
      if (dadosStepper.morada) formData.append('morada', dadosStepper.morada);
      if (dadosStepper.emails) formData.append('emails', dadosStepper.emails);
      if (dadosStepper.telefone) formData.append('telefone', dadosStepper.telefone);
      if (dadosStepper.telemovel) formData.append('telemovel', dadosStepper.telemovel);
      if (dadosStepper.ordenador) formData.append('ordenador', dadosStepper.ordenador);
      if (dadosStepper.profissao) formData.append('profissao', dadosStepper.profissao);
      if (dadosStepper.entidade_con) formData.append('entidade_con', dadosStepper.entidade_con);
      if (dadosStepper.tipo_docid?.id) formData.append('tipo_docid', dadosStepper.tipo_docid?.id);
      if (dadosStepper.nacionalidade) formData.append('nacionalidade', dadosStepper.nacionalidade);
      if (dadosStepper.local_trabalho) formData.append('local_trabalho', dadosStepper.local_trabalho);
      if (dadosStepper.estado_civil?.id) formData.append('estado_civil', dadosStepper.estado_civil?.id);
      if (dadosStepper.local_pais_nascimento)
        formData.append('local_pais_nascimento', dadosStepper.local_pais_nascimento);
      if (dadosStepper.data_nascimento)
        formData.append('data_nascimento', format(dadosStepper.data_nascimento, 'yyyy-MM-dd'));
      // OUTROS
      formData.append('titular', '');
      formData.append('cliente', '');
      formData.append('diadomes', '');
      formData.append('entidades', []);
      formData.append('agendado', false);
      formData.append('periodicidade', '');
      formData.append('data_inicio', null);
      formData.append('data_arquivamento', null);
      if (dadosStepper.obs) formData.append('obs', dadosStepper.obs);

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
