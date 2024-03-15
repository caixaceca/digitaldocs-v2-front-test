import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect } from 'react';
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
import ProcessoExternoForm from './ProcessoExternoForm';

// ----------------------------------------------------------------------

ProcessoExterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoExterno({ isEdit, selectedProcesso, fluxo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { meuAmbiente, origens } = useSelector((state) => state.parametrizacao);
  const perfilId = cc?.perfil_id;
  const [operacao, setOperacao] = useState(selectedProcesso?.operacao || '');
  const balcaoAmbiente = uos?.find((row) => row?.id === meuAmbiente?.uo_id)?.balcao || Number(cc?.uo?.balcao);
  const origensList = useMemo(
    () => origens.map((row) => ({ id: row?.id, label: `${row?.designacao} - ${row?.seguimento}` })) || [],
    [origens]
  );
  const entidadesList = useMemo(
    () => selectedProcesso?.entidade?.split(';')?.map((row) => ({ numero: row })) || [],
    [selectedProcesso?.entidade]
  );

  const formSchema = Yup.object().shape({
    origem_id: Yup.mixed().required('Origem não pode ficar vazio'),
    referencia: Yup.string().required('Referência não pode ficar vazio'),
    canal: Yup.string().required('Canal de entrada não pode ficar vazio'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    data_entrada: Yup.date()
      .typeError('Data de entrada não pode ficar vazio')
      .required('Introduza a data de entrada do processo na agência'),
    operacao: meuAmbiente?.nome?.includes('DOP') && Yup.string().required('Operação não pode ficar vazio'),
    valor:
      operacao === 'Cativo/Penhora' &&
      Yup.number().typeError('Introduza o valor').positive('O valor não pode ser negativo'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: entidadesList,
      valor: selectedProcesso?.valor || '',
      conta: selectedProcesso?.conta || '',
      canal: selectedProcesso?.canal || null,
      docidp: selectedProcesso?.doc_idp || '',
      docids: selectedProcesso?.doc_ids || '',
      obs: selectedProcesso?.observacao || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      operacao: selectedProcesso?.operacao || null,
      referencia: selectedProcesso?.referencia || '',
      balcao: selectedProcesso?.balcao || balcaoAmbiente,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      origem_id: selectedProcesso?.origem_id
        ? origensList?.find((row) => row.id === selectedProcesso?.origem_id)
        : null,
    }),
    [selectedProcesso, fluxo?.id, origensList, entidadesList, balcaoAmbiente]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedProcesso) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedProcesso]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      // required
      formData.append('agendado', false);
      formData.append('is_interno ', false);
      formData.append('canal', values.canal);
      formData.append('balcao', values.balcao);
      formData.append('fluxo_id', values.fluxo_id);
      formData.append('referencia', values.referencia);
      formData.append('origem_id', values?.origem_id?.id);
      formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
      // optional
      if (values.obs) {
        formData.append('obs', values.obs);
      }
      if (values.conta) {
        formData.append('conta', values.conta);
      }
      if (values.valor) {
        formData.append('valor', values.valor);
      }
      if (values.docidp) {
        formData.append('docidp', values.docidp);
      }
      if (values.docids) {
        formData.append('docids', values.docids);
      }
      if (values.cliente) {
        formData.append('cliente', values.cliente);
      }
      if (values.titular) {
        formData.append('titular', values.titular);
      }
      if (values.operacao) {
        formData.append('operacao', values.operacao);
      }
      if (values?.entidades?.length !== 0) {
        formData.append(
          'entidades',
          values.entidades.map((row) => row?.numero)
        );
      }
      if (values?.anexos?.length > 0) {
        for (let i = 0; i < values.anexos.length; i += 1) {
          formData.append('anexos', values.anexos[i]);
        }
      }

      if (selectedProcesso) {
        dispatch(
          updateItem('processo', formData, { mail, perfilId, id: selectedProcesso?.id, msg: 'Processo atualizado' })
        );
      } else {
        formData.append('uo_origem_id', meuAmbiente?.uo_id);
        formData.append('estado_atual_id', meuAmbiente?.id);
        dispatch(createItem('processo externo', formData, { mail, perfilId, msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoExternoForm
            operacao={operacao}
            setOperacao={setOperacao}
            origensList={origensList}
            selectedProcesso={selectedProcesso}
          />
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
