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
import { format, add } from 'date-fns';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createItem, updateItem } from '../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoInternoForm from './ProcessoInternoForm';

// ----------------------------------------------------------------------

ProcessoInterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoInterno({ isEdit, selectedProcesso, fluxo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const isPSC = fluxo?.assunto === 'Diário' || fluxo?.assunto === 'Receção de Cartões - DOP';
  const { meuAmbiente, processoId, motivosPendencias, isSaving, done, error } = useSelector(
    (state) => state.digitaldocs
  );
  const perfilId = cc?.perfil_id;
  const podeAtribuir =
    !fluxo?.assunto?.includes('Cartão') &&
    !fluxo?.assunto?.includes('Extrato') &&
    !fluxo?.assunto?.includes('Declarações');
  const [agendado, setAgendado] = useState(selectedProcesso?.agendado || false);
  const [pendente, setPendente] = useState(selectedProcesso?.ispendente || false);
  const mpendencia = motivosPendencias?.find((row) => Number(row?.id) === Number(selectedProcesso?.mpendencia)) || null;

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
    periodicidade: agendado && Yup.mixed().required('Seleciona a periodicidade'),
    mpendencia: pendente && Yup.mixed().required('Motivo de pendência não pode ficar vazio'),
    noperacao: selectedProcesso?.noperacao && Yup.string().required('Nº de operação não pode ficar vazio'),
    titular: fluxo?.assunto === 'Produtos e Serviços' && Yup.string().required('Descriçãao não pode ficar vazio'),
    data_entrada:
      fluxo?.modelo !== 'Paralelo' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de entrada não pode ficar vazio'),
    data_inicio:
      agendado && Yup.date().typeError('Introduza uma data válida').required('Data de início não pode ficar vazio'),
    data_arquivamento:
      agendado && Yup.date().typeError('Introduza uma data válida').required('Data de término não pode ficar vazio'),
    diadomes:
      agendado &&
      Yup.number()
        .min(1, 'Dia do mês não pode ser menor que 1')
        .max(31, 'Dia do mês não pode ser maior que 31')
        .typeError('Introduza um número')
        .required('Valor não pode ficar vazio'),
    conta:
      !fluxo?.limpo &&
      fluxo?.assunto !== 'OPE DARH' &&
      fluxo?.assunto !== 'Abertura de conta' &&
      Yup.number().typeError('Introduza um nº de conta válido'),
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
      mobs: selectedProcesso?.mobs || '',
      conta: selectedProcesso?.conta || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      diadomes: selectedProcesso?.diadomes || '',
      noperacao: selectedProcesso?.noperacao || '',
      agendado: selectedProcesso?.agendado || false,
      ispendente: selectedProcesso?.ispendente || false,
      periodicidade: selectedProcesso?.periodicidade || null,
      perfil_id: selectedProcesso?.perfil_id || cc?.perfil_id,
      balcao: selectedProcesso?.balcao || Number(cc?.uo?.balcao),
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      mpendencia: mpendencia ? { id: mpendencia?.id, label: mpendencia?.motivo } : null,
      data_inicio: selectedProcesso?.data_inicio ? new Date(selectedProcesso?.data_inicio) : null,
      data_arquivamento: selectedProcesso?.data_arquivamento ? new Date(selectedProcesso?.data_arquivamento) : null,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
    }),
    [selectedProcesso, fluxo?.id, mpendencia, meuAmbiente, cc, _entidades]
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
        formData.append('modelo', fluxo?.modelo);
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('agendado', values.agendado);
        formData.append('uo_perfil_id ', cc?.uo?.id);
        formData.append('ispendente', values.ispendente);
        formData.append('is_interno ', selectedProcesso?.is_interno);
        formData.append('data_entrada', format(values.data_entrada ? values.data_entrada : new Date(), 'yyyy-MM-dd'));
        // optional
        if (values.obs) {
          formData.append('obs', values.obs);
        }
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (isPSC) {
          formData.append(
            'titular',
            `${fluxo?.assunto} (${format(values.data_entrada ? values.data_entrada : new Date(), 'dd/MM/yyyy')})`
          );
        } else if (values.titular) {
          formData.append('titular', values.titular);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
        if (values.noperacao) {
          formData.append('noperacao', values.noperacao);
        }
        if (values.ispendente) {
          formData.append('ispendente', true);
          if (values.mpendencia) {
            formData.append('mpendencia', values.mpendencia.id);
          }
          if (values.mobs) {
            formData.append('mobs', values.mobs);
          }
        } else {
          formData.append('ispendente', false);
          if (selectedProcesso.mpendencia) {
            formData.append('mpendencia', selectedProcesso.mpendencia);
          }
          if (selectedProcesso.mobs) {
            formData.append('mobs', selectedProcesso.mobs);
          }
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
        } else {
          formData.append('diadomes', '');
          formData.append('periodicidade', '');
          formData.append('data_inicio', null);
          formData.append('data_arquivamento', null);
        }
        if (values?.anexos?.length > 0) {
          for (let i = 0; i < values.anexos.length; i += 1) {
            formData.append('anexos', values.anexos[i]);
          }
        }
        dispatch(
          updateItem('processo', formData, {
            mail,
            perfilId,
            id: selectedProcesso?.id,
            msg: 'processo atualizado',
            isPendente: values.ispendente,
            atribuir: values.ispendente && podeAtribuir,
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
          })
        );
      } else {
        const formData = new FormData();
        // required
        formData.append('modelo', fluxo?.modelo);
        formData.append('balcao', values.balcao);
        formData.append('fluxo_id', values.fluxo_id);
        formData.append('perfil_id', values.perfil_id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        formData.append('data_entrada', format(values.data_entrada ? values.data_entrada : new Date(), 'yyyy-MM-dd'));
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
        if (isPSC) {
          formData.append(
            'titular',
            `${fluxo?.assunto} (${format(values.data_entrada ? values.data_entrada : new Date(), 'dd/MM/yyyy')})`
          );
        } else if (values.titular) {
          formData.append('titular', values.titular);
        }
        if (values.ispendente) {
          formData.append('ispendente', true);
          if (values.mpendencia) {
            formData.append('mpendencia', values.mpendencia.id);
          }
          if (values.mobs) {
            formData.append('mobs', values.mobs);
          }
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
            perfilId,
            fluxoId: fluxo?.id,
            estadoId: meuAmbiente?.id,
            msg: 'processo adicionado',
            isPendente: values.ispendente,
            atribuir: values.ispendente && podeAtribuir,
            abandonar: { perfilID: perfilId, fluxoID: values?.fluxo_id, estadoID: values?.estado_atual_id },
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
          <ProcessoInternoForm
            selectedProcesso={selectedProcesso}
            setAgendado={setAgendado}
            setPendente={setPendente}
            fluxo={fluxo}
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
