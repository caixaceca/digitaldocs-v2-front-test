import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
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
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoExternoForm from './ProcessoExternoForm';

// ----------------------------------------------------------------------

ProcessoExterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoExterno({ isEdit, selectedProcesso, fluxo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meuAmbiente, processoId, origens, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const perfilId = cc?.perfil_id;
  const [operacao, setOperacao] = useState(selectedProcesso?.operacao || '');
  const origensList = origens.map((row) => ({ id: row?.id, label: `${row?.designacao} - ${row?.seguimento}` }));

  useEffect(() => {
    if (done === 'processo adicionado') {
      enqueueSnackbar('Processo adicionado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
    } else if (done === 'processo atualizado') {
      enqueueSnackbar('Processo atualizado com sucesso', { variant: 'success' });
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processoId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

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

  const _entidades = useMemo(
    () => selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row })) || [],
    [selectedProcesso?.entidades]
  );

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: _entidades,
      obs: selectedProcesso?.obs || '',
      mobs: selectedProcesso?.mobs || '',
      valor: selectedProcesso?.valor || '',
      conta: selectedProcesso?.conta || '',
      canal: selectedProcesso?.canal || null,
      docidp: selectedProcesso?.docidp || '',
      docids: selectedProcesso?.docids || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      operacao: selectedProcesso?.operacao || null,
      referencia: selectedProcesso?.referencia || '',
      perfil_id: selectedProcesso?.perfil_id || cc?.perfil_id,
      balcao: selectedProcesso?.balcao || Number(cc?.uo?.balcao),
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      origem_id: selectedProcesso?.origem_id
        ? origensList?.find((row) => row.id === selectedProcesso?.origem_id)
        : null,
    }),
    [selectedProcesso, fluxo?.id, meuAmbiente, origensList, _entidades, cc]
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
      formData.append('modelo', fluxo?.modelo);
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
        formData.append('uo_perfil_id ', cc?.uo?.id);
        dispatch(
          updateItem('processo', formData, { mail, perfilId, id: selectedProcesso?.id, msg: 'processo atualizado' })
        );
      } else {
        formData.append('perfil_id', values.perfil_id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        dispatch(createItem('processo externo', formData, { mail, perfilId, msg: 'processo adicionado' }));
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
