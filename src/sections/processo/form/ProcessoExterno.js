import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
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
import { createProcesso, updateItem } from '../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoExternoForm from './ProcessoExternoForm';

// ----------------------------------------------------------------------

ProcessoExterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, processo: PropTypes.object };

export default function ProcessoExterno({ isEdit, processo, fluxo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId, cc, uos } = useSelector((state) => state.intranet);
  const { meuAmbiente, origens } = useSelector((state) => state.parametrizacao);
  const balcaoAmbiente = uos?.find((row) => row?.id === meuAmbiente?.uo_id)?.balcao || Number(cc?.uo?.balcao);
  const origensList = useMemo(
    () => origens.map((row) => ({ id: row?.id, label: `${row?.designacao} - ${row?.seguimento}` })) || [],
    [origens]
  );
  const entidadesList = useMemo(
    () => processo?.entidade?.split(';')?.map((row) => ({ numero: row })) || [],
    [processo?.entidade]
  );

  const formSchema = Yup.object().shape({
    origem_id: Yup.mixed().required().label('Origem'),
    referencia: Yup.string().required().label('Referência'),
    canal: Yup.string().required().label('Canal de entrada'),
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
    operacao: meuAmbiente?.nome?.includes('DOP') && Yup.string().required().label('Operação'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().label('Nº de entidade') })),
    valor: Yup.string().when('operacao', { is: 'Cativo/Penhora', then: (schema) => schema.required().label('Valor') }),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: entidadesList,
      conta: processo?.conta || '',
      valor: processo?.valor || '',
      canal: processo?.canal || null,
      docidp: processo?.doc_idp || '',
      docids: processo?.doc_ids || '',
      obs: processo?.observacao || '',
      titular: processo?.titular || '',
      cliente: processo?.cliente || '',
      operacao: processo?.operacao || null,
      referencia: processo?.referencia || '',
      balcao: processo?.balcao || balcaoAmbiente,
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
      origem_id: processo?.origem_id ? origensList?.find((row) => row.id === processo?.origem_id) : null,
    }),
    [processo, fluxo?.id, origensList, entidadesList, balcaoAmbiente]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && processo) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, processo]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      // required
      formData.append('agendado', false);
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
      await values?.anexos?.forEach((row) => {
        formData.append('anexos', row);
      });

      if (processo) {
        dispatch(updateItem('processo', formData, { mail, perfilId, id: processo?.id, msg: 'Processo atualizado' }));
      } else {
        formData.append('uo_origem_id', meuAmbiente?.uo_id);
        formData.append('estado_atual_id', meuAmbiente?.id);
        dispatch(createProcesso('externo', formData, { mail, perfilId, msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoExternoForm processo={processo} origensList={origensList} />
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
