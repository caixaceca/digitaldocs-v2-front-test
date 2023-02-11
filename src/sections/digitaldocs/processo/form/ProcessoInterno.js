import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { format } from 'date-fns';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
import { createItem, updateItem } from '../../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../../routes/paths';
// components
import { FormProvider } from '../../../../components/hook-form';
// sections
import ProcessoInternoForm from './ProcessoInternoForm';

// ----------------------------------------------------------------------

ProcessoInterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoInterno({ isEdit, selectedProcesso, fluxo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { meuAmbiente, processoId, isSaving, done, error } = useSelector((state) => state.digitaldocs);
  const [agendado, setAgendado] = useState(selectedProcesso?.agendado || false);

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
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    diadomes:
      agendado &&
      Yup.number()
        .min(1, 'Dia do mês não pode ser menor que 1')
        .max(31, 'Dia do mês não pode ser maior que 31')
        .typeError('Introduza um número')
        .required('Valor não pode ficar vazio'),
    periodicidade: agendado && Yup.string().required('Periodicidade não pode ficar vazio'),
    data_entrada: Yup.date().typeError('Data de entrada não pode ficar vazio').required('Data não pode ficar vazio'),
    data_inicio:
      agendado &&
      Yup.date().typeError('Data de início não pode ficar vazio').required('Data de início não pode ficar vazio'),
    data_arquivamento:
      agendado &&
      Yup.date().typeError('Data de término não pode ficar vazio').required('Data de término não pode ficar vazio'),
    conta:
      fluxo?.assunto !== 'Abertura de conta' &&
      fluxo?.assunto !== 'OPE DARH' &&
      Yup.number().typeError('Introduza um nº de conta válido').required('Valor não pode ficar vazio'),
  });

  const _entidades = useMemo(
    () =>
      (selectedProcesso?.entidades && selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row }))) ||
      ((fluxo?.assunto === 'Abertura de conta' || fluxo?.assunto === 'OPE DARH') && [{ numero: '' }]) ||
      [],
    [selectedProcesso?.entidades, fluxo?.assunto]
  );

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      fluxo_id: fluxo?.id,
      entidades: _entidades,
      obs: selectedProcesso?.obs || '',
      conta: selectedProcesso?.conta || '',
      cliente: selectedProcesso?.cliente || '',
      diadomes: selectedProcesso?.diadomes || '',
      agendado: selectedProcesso?.agendado || false,
      periodicidade: selectedProcesso?.periodicidade || '',
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      perfil_id: selectedProcesso?.perfil_id || currentColaborador?.perfil?.id,
      balcao: selectedProcesso?.balcao || Number(currentColaborador?.uo?.balcao),
      data_inicio: selectedProcesso?.data_inicio ? new Date(selectedProcesso?.data_inicio) : null,
      data_entrada: selectedProcesso?.data_entrada ? new Date(selectedProcesso?.data_entrada) : null,
      data_arquivamento: selectedProcesso?.data_arquivamento ? new Date(selectedProcesso?.data_arquivamento) : null,
    }),
    [selectedProcesso, fluxo?.id, meuAmbiente, currentColaborador, _entidades]
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
  }, [isEdit, fluxo?.id, selectedProcesso]);

  const onSubmit = async () => {
    try {
      if (selectedProcesso) {
        const formData = new FormData();
        // required
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('agendado', values.agendado);
        formData.append('is_interno ', selectedProcesso?.is_interno);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values?.entidades?.length !== 0) {
          formData.append(
            'entidades',
            values.entidades.map((row) => row?.numero)
          );
        }
        if (values.agendado) {
          formData.append('diadomes', values.diadomes);
          formData.append('periodicidade', values.periodicidade);
          formData.append('data_inicio', format(values.data_inicio, 'yyyy-MM-dd'));
          formData.append('data_arquivamento', format(values.data_arquivamento, 'yyyy-MM-dd'));
        }
        if (values?.anexos?.length > 0) {
          for (let i = 0; i < values.anexos.length; i += 1) {
            formData.append('anexos', values.anexos[i]);
          }
        }
        dispatch(
          updateItem('processo', formData, {
            mail,
            id: selectedProcesso?.id,
            perfilId: currentColaborador?.perfil_id,
            mensagem: 'processo atualizado',
          })
        );
      } else {
        const formData = new FormData();
        // required
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('perfil_id', values.perfil_id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        formData.append('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values.agendado) {
          formData.append('agendado', values.agendado);
          formData.append('diadomes', values.diadomes);
          formData.append('periodicidade', values.periodicidade);
          formData.append('data_inicio', format(values.data_inicio, 'yyyy-MM-dd'));
          formData.append('data_arquivamento', format(values.data_arquivamento, 'yyyy-MM-dd'));
        }
        if (values?.entidades?.length !== 0) {
          formData.append(
            'entidades',
            values.entidades.map((row) => row?.numero)
          );
        }
        if (values.anexos) {
          const listaanexo = values.anexos;
          for (let i = 0; i < listaanexo.length; i += 1) {
            formData.append('anexos', listaanexo[i]);
          }
        }
        dispatch(
          createItem('processo interno', formData, {
            mail,
            fluxoId: fluxo?.id,
            estadoId: meuAmbiente?.id,
            perfilId: currentColaborador?.perfil_id,
            mensagem: 'processo adicionado',
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoInternoForm selectedProcesso={selectedProcesso} setAgendado={setAgendado} assunto={fluxo?.assunto} />
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
