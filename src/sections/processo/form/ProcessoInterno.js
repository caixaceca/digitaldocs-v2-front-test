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
  const { meuAmbiente, processoId, isSaving, done, error } = useSelector((state) => state.digitaldocs);
  const perfilId = cc?.perfil_id;
  const [agendado, setAgendado] = useState(selectedProcesso?.agendado);
  const [titular, setTitular] = useState(selectedProcesso?.con?.titular_ordenador);

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
    periodicidade: agendado && Yup.mixed().required('Seleciona a periodicidade'),
    anexos: fluxo?.is_con && !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    morada: fluxo?.is_con && !titular && Yup.string().required('Morada não pode ficar vazio'),
    // telefone: fluxo?.is_con && !titular && Yup.string().required('Telefone não pode ficar vazio'),
    profissao: fluxo?.is_con && !titular && Yup.string().required('Profissão não pode ficar vazio'),
    local_trabalho: fluxo?.is_con && !titular && Yup.string().required('Local de trabalho não pode ficar vazio'),
    noperacao:
      (selectedProcesso?.noperacao || fluxo?.is_con) && Yup.string().required('Nº de operação não pode ficar vazio'),
    titular:
      (fluxo?.assunto === 'Produtos e Serviços' || fluxo?.assunto === 'Preçário') &&
      Yup.string().required('Descriçãao não pode ficar vazio'),
    email:
      fluxo?.assunto === 'Banca Virtual - Adesão' &&
      Yup.string().email('Introduza um email válido').required('Introduza o email'),
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
        .typeError('Introduza o dia da execução')
        .min(1, 'Dia do mês não pode ser menor que 1')
        .max(31, 'Dia do mês não pode ser maior que 31'),
    conta:
      !fluxo?.limpo &&
      fluxo?.assunto !== 'Abertura de conta' &&
      Yup.number().typeError('Introduza um nº de conta válido'),
  });

  const entidades = useMemo(
    () =>
      (selectedProcesso?.entidades && selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row }))) ||
      (!selectedProcesso && fluxo?.assunto === 'Abertura de conta' && [{ numero: '' }]) ||
      [],
    [fluxo?.assunto, selectedProcesso]
  );

  const defaultValues = useMemo(
    () => ({
      entidades,
      anexos: [],
      fluxo_id: fluxo?.id,
      obs: selectedProcesso?.obs || '',
      mobs: selectedProcesso?.mobs || '',
      conta: selectedProcesso?.conta || '',
      email: selectedProcesso?.email || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      diadomes: selectedProcesso?.diadomes || '',
      noperacao: selectedProcesso?.noperacao || '',
      agendado: selectedProcesso?.agendado || false,
      periodicidade: selectedProcesso?.periodicidade || null,
      perfil_id: selectedProcesso?.perfil_id || cc?.perfil_id,
      balcao: selectedProcesso?.balcao || Number(cc?.uo?.balcao),
      uo_origem_id: selectedProcesso?.uo_origem_id || meuAmbiente?.uo_id,
      estado_atual_id: selectedProcesso?.estado_atual_id || meuAmbiente?.id,
      data_inicio: selectedProcesso?.data_inicio ? new Date(selectedProcesso?.data_inicio) : null,
      data_arquivamento: selectedProcesso?.data_arquivamento ? new Date(selectedProcesso?.data_arquivamento) : null,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      // CON
      morada: selectedProcesso?.con?.morada || '',
      emails: selectedProcesso?.con?.emails || '',
      telefone: selectedProcesso?.con?.telefone || '',
      telemovel: selectedProcesso?.con?.telemovel || '',
      profissao: selectedProcesso?.con?.profissao || '',
      local_trabalho: selectedProcesso?.con?.local_trabalho || '',
      residente: selectedProcesso?.con ? selectedProcesso?.con?.residente : true,
      titular_ordenador: selectedProcesso ? selectedProcesso?.con?.titular_ordenador : true,
    }),
    [selectedProcesso, fluxo?.id, meuAmbiente, cc, entidades]
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
      const formData = new FormData();
      // required
      formData.append('modelo', fluxo?.modelo);
      formData.append('balcao', values.balcao);
      formData.append('fluxo_id', values.fluxo_id);
      formData.append('agendado', values.agendado);
      formData.append('data_entrada', format(values.data_entrada ? values.data_entrada : new Date(), 'yyyy-MM-dd'));
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
      // optional
      if (values.obs) {
        formData.append('obs', values.obs);
      }
      if (isPSC) {
        formData.append(
          'titular',
          `${fluxo?.assunto} (${format(values.data_entrada ? values.data_entrada : new Date(), 'dd/MM/yyyy')})`
        );
      } else if (values.titular) {
        formData.append('titular', values.titular);
      }
      if (fluxo?.assunto === 'Abertura de conta') {
        formData.append('conta', '');
        formData.append('cliente', '');
      } else {
        if (values.conta) {
          formData.append('conta', values.conta);
        }
        if (values.cliente) {
          formData.append('cliente', values.cliente);
        }
      }
      if (values.email) {
        formData.append('email', values.email);
      }
      if (values.noperacao) {
        formData.append('noperacao', values.noperacao);
      }
      if (values?.entidades?.length !== 0) {
        formData.append(
          'entidades',
          values.entidades.map((row) => row?.numero)
        );
      }
      // CON
      if (fluxo?.is_con) {
        formData.append('titular_ordenador', values.titular_ordenador);
        if (!values.titular_ordenador) {
          formData.append('residente', values.residente);
          if (values.morada) {
            formData.append('morada', values.morada);
          }
          if (values.emails) {
            formData.append('emails', values.emails);
          }
          if (values.telefone) {
            formData.append('telefone', values.telefone);
          }
          if (values.telemovel) {
            formData.append('telemovel', values.telemovel);
          }
          if (values.profissao) {
            formData.append('profissao', values.profissao);
          }
          if (values.local_trabalho) {
            formData.append('local_trabalho', values.local_trabalho);
          }
        }
      }
      if (values?.anexos?.length > 0) {
        for (let i = 0; i < values.anexos.length; i += 1) {
          formData.append('anexos', values.anexos[i]);
        }
      }

      if (selectedProcesso) {
        formData.append('uo_perfil_id ', cc?.uo?.id);
        formData.append('is_interno ', selectedProcesso?.is_interno);
        dispatch(
          updateItem('processo', formData, {
            mail,
            perfilId,
            id: selectedProcesso?.id,
            msg: 'processo atualizado',
          })
        );
      } else {
        formData.append('perfil_id', values.perfil_id);
        formData.append('uo_origem_id', values.uo_origem_id);
        formData.append('estado_atual_id', values.estado_atual_id);
        dispatch(createItem('processo interno', formData, { mail, perfilId, msg: 'processo adicionado' }));
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
            fluxo={fluxo}
            setTitular={setTitular}
            setAgendado={setAgendado}
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
