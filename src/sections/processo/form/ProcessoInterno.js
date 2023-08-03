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
import { podeSerAtribuido } from '../../../utils/validarAcesso';
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
  const [agendado, setAgendado] = useState(selectedProcesso?.agendado);
  const [pendente, setPendente] = useState(selectedProcesso?.ispendente);
  const [proprio, setProprio] = useState(!selectedProcesso?.con?.doc_id);
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
    noperacao:
      (selectedProcesso?.noperacao || fluxo?.is_con) && Yup.string().required('Nº de operação não pode ficar vazio'),
    titular:
      (fluxo?.assunto === 'Produtos e Serviços' || fluxo?.assunto === 'Preçário') &&
      Yup.string().required('Descriçãao não pode ficar vazio'),
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
        .typeError('Introduza um número')
        .min(1, 'Dia do mês não pode ser menor que 1')
        .max(31, 'Dia do mês não pode ser maior que 31')
        .required('Valor não pode ficar vazio'),
    conta:
      !fluxo?.limpo &&
      fluxo?.assunto !== 'Abertura de conta' &&
      Yup.number().typeError('Introduza um nº de conta válido'),
    tipo_docid: fluxo?.is_con && !proprio && Yup.mixed().required('Tipo de documento não pode ficar vazio'),
    doc_id: fluxo?.is_con && !proprio && Yup.string().required('Nº de doc. de indentificação não pode ficar vazio'),
    valor:
      fluxo?.is_con &&
      Yup.number()
        .typeError('Introduza o valor')
        .positive('O valor não pode ser negativo')
        .min(1000000, 'O valor deve ser superior a 1 000 000'),
  });

  const _entidades = useMemo(
    () =>
      (selectedProcesso?.entidades && selectedProcesso?.entidades?.split(';')?.map((row) => ({ numero: row }))) ||
      (fluxo?.assunto === 'Abertura de conta' && [{ numero: '' }]) ||
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
      // CON
      valor: selectedProcesso?.valor || '',
      nif: selectedProcesso?.con?.nif || '',
      doc_id: selectedProcesso?.con?.doc_id || '',
      morada: selectedProcesso?.con?.morada || '',
      emails: selectedProcesso?.con?.emails || '',
      nome_pai: selectedProcesso?.con?.nome_pai || '',
      nome_mae: selectedProcesso?.con?.nome_mae || '',
      contactos: selectedProcesso?.con?.contactos || '',
      profissao: selectedProcesso?.con?.profissao || '',
      proprio: !selectedProcesso?.con?.doc_id || false,
      residente: selectedProcesso?.con?.residente || true,
      tipo_docid: selectedProcesso?.con?.tipo_docid || null,
      estado_civil: selectedProcesso?.con?.estado_civil || '',
      nacionalidade: selectedProcesso?.con?.nacionalidade || '',
      local_trabalho: selectedProcesso?.con?.local_trabalho || '',
      local_pais_nascimento: selectedProcesso?.con?.local_pais_nascimento || '',
      data_nascimento: selectedProcesso?.con?.data_nascimento
        ? add(new Date(selectedProcesso?.con?.data_nascimento), { hours: 2 })
        : null,
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
        // CON
        if (fluxo?.is_con) {
          formData.append('valor', values.valor);
          formData.append('residente', values.residente);
          if (!values.proprio) {
            if (values.nif) {
              formData.append('nif', values.nif);
            }
            if (values.doc_id) {
              formData.append('doc_id', values.doc_id);
            }
            if (values.tipo_docid) {
              formData.append('tipo_docid', values.tipo_docid);
            }
            if (values.nacionalidade) {
              formData.append('nacionalidade', values.nacionalidade);
            }
          } else {
            formData.append('nif', '');
            formData.append('doc_id', '');
            formData.append('tipo_docid', '');
            formData.append('nacionalidade', '');
          }
          if (values.morada) {
            formData.append('morada', values.morada);
          }
          if (values.emails) {
            formData.append('emails', values.emails);
          }
          if (values.nome_pai) {
            formData.append('nome_pai', values.nome_pai);
          }
          if (values.nome_mae) {
            formData.append('nome_mae', values.nome_mae);
          }
          if (values.contactos) {
            formData.append('contactos', values.contactos);
          }
          if (values.profissao) {
            formData.append('profissao', values.profissao);
          }
          if (values.estado_civil) {
            formData.append('estado_civil', values.estado_civil);
          }
          if (values.local_trabalho) {
            formData.append('local_trabalho', values.local_trabalho);
          }
          if (values.local_pais_nascimento) {
            formData.append('local_pais_nascimento', values.local_pais_nascimento);
          }
          if (values.data_nascimento) {
            formData.append('data_nascimento', format(values.data_nascimento, 'yyyy-MM-dd'));
          }
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
            atribuir: values.ispendente && podeSerAtribuido(fluxo?.assunto),
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
        // CON
        if (fluxo?.is_con) {
          formData.append('valor', values.valor);
          formData.append('residente', values.residente);
          if (!values.proprio) {
            if (values.nif) {
              formData.append('nif', values.nif);
            }
            if (values.doc_id) {
              formData.append('doc_id', values.doc_id);
            }
            if (values.tipo_docid) {
              formData.append('tipo_docid', values.tipo_docid);
            }
            if (values.nacionalidade) {
              formData.append('nacionalidade', values.nacionalidade);
            }
          }
          if (values.morada) {
            formData.append('morada', values.morada);
          }
          if (values.emails) {
            formData.append('emails', values.emails);
          }
          if (values.nome_pai) {
            formData.append('nome_pai', values.nome_pai);
          }
          if (values.nome_mae) {
            formData.append('nome_mae', values.nome_mae);
          }
          if (values.contactos) {
            formData.append('contactos', values.contactos);
          }
          if (values.profissao) {
            formData.append('profissao', values.profissao);
          }
          if (values.estado_civil) {
            formData.append('estado_civil', values.estado_civil);
          }
          if (values.local_trabalho) {
            formData.append('local_trabalho', values.local_trabalho);
          }
          if (values.local_pais_nascimento) {
            formData.append('local_pais_nascimento', values.local_pais_nascimento);
          }
          if (values.data_nascimento) {
            formData.append('data_nascimento', format(values.data_nascimento, 'yyyy-MM-dd'));
          }
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
            atribuir: values.ispendente && podeSerAtribuido(fluxo?.assunto),
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
            fluxo={fluxo}
            setProprio={setProprio}
            setAgendado={setAgendado}
            setPendente={setPendente}
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
