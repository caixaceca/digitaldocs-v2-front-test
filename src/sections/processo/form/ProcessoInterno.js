import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect, useState } from 'react';
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
import ProcessoInternoForm from './ProcessoInternoForm';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, selectedProcesso: PropTypes.object };

export default function ProcessoInterno({ isEdit, selectedProcesso, fluxo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { meuAmbiente } = useSelector((state) => state.parametrizacao);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const isPSC = fluxo?.assunto === 'Diário' || fluxo?.assunto === 'Receção de Cartões - DOP';
  const perfilId = cc?.perfil_id;
  const [agendado, setAgendado] = useState(selectedProcesso?.agendado);
  const [cliente, setCliente] = useState(true);
  const infoConReq = (fluxo?.is_con && !cliente && !isEdit) || (fluxo?.is_con && isEdit && !cliente);
  const balcaoAmbiente = uos?.find((row) => row?.id === meuAmbiente?.uo_id)?.balcao || Number(cc?.uo?.balcao);

  const formSchema = Yup.object().shape({
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    periodicidade: agendado && Yup.mixed().required('Seleciona a periodicidade'),
    data_arquivamento: agendado && Yup.date().typeError('Introduza a data final').required('Introduza a data final'),
    data_inicio: agendado && Yup.date().typeError('Introduza a data de início').required('Introduza a data de início'),
    data_entrada:
      fluxo?.modelo !== 'Paralelo' &&
      Yup.date()
        .typeError('Introduza a data de entrada do processo')
        .required('Introduza a data de entrada do processo'),
    noperacao:
      (selectedProcesso?.numero_operacao || fluxo?.is_con) &&
      Yup.string().required('Nº de operação não pode ficar vazio'),
    titular:
      (fluxo?.assunto === 'Produtos e Serviços' || fluxo?.assunto === 'Preçário') &&
      Yup.string().required('Descriçãao não pode ficar vazio'),
    email:
      (fluxo?.assunto === 'Banca Virtual - Adesão' || fluxo?.assunto === 'Banca Virtual - Novos Códigos') &&
      Yup.string().email('Introduza um email válido').required('Introduza o email'),
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
    // CON
    nif: infoConReq && Yup.string().required('NIF não pode ficar vazio'),
    mae: infoConReq && Yup.string().required('Nome da Mãe não pode ficar vazio'),
    pai: infoConReq && Yup.string().required('Nome do Pai não pode ficar vazio'),
    estado_civil: infoConReq && Yup.mixed().required('Seleciona o estado civil'),
    profissao: infoConReq && Yup.string().required('Profissão não pode ficar vazio'),
    telefone: infoConReq && Yup.string().required('Nº do telefone não pode ficar vazio'),
    ordenador: infoConReq && Yup.string().required('Nome do ordenador não pode ficar vazio'),
    nacionalidade: infoConReq && Yup.string().required('Nacionalidade não pode ficar vazio'),
    docid: infoConReq && Yup.string().required('Nº doc. identificaação não pode ficar vazio'),
    origem_fundo: fluxo?.is_con && Yup.string().required('Origem do fundo não pode ficar vazio'),
    tipo_docid: infoConReq && Yup.mixed().required('Tipo doc. identificação não pode ficar vazio'),
    finalidade_fundo: fluxo?.is_con && Yup.string().required('Finalidade do fundo não pode ficar vazio'),
    entidade_con: fluxo?.is_con && cliente && Yup.string().required('Nº da entidade não pode ficar vazio'),
    entidades: Yup.array(Yup.object({ numero: Yup.number('hhhh').typeError('Introduza um nº de entidade') })),
    local_pais_nascimento: infoConReq && Yup.string().required('Local/País de nascimento não pode ficar vazio'),
    valor:
      fluxo?.is_con &&
      Yup.number()
        .min(999999, 'O valor deve ser igual ou superior a um milhão de escudos')
        .required('Introduza o valor da operção'),
    data_nascimento:
      infoConReq && Yup.date().typeError('Introduza a data de nascimento').required('Introduza a data de nascimento'),
  });

  const entidades = useMemo(
    () =>
      (selectedProcesso?.entidade && selectedProcesso?.entidade?.split(';')?.map((row) => ({ numero: row }))) ||
      (!selectedProcesso && fluxo?.assunto === 'Abertura de conta' && [{ numero: '' }]) ||
      [],
    [fluxo?.assunto, selectedProcesso]
  );

  const defaultValues = useMemo(
    () => ({
      entidades,
      anexos: [],
      fluxo_id: fluxo?.id,
      valor: selectedProcesso?.valor || 0,
      conta: selectedProcesso?.conta || '',
      email: selectedProcesso?.email || '',
      obs: selectedProcesso?.observacao || '',
      titular: selectedProcesso?.titular || '',
      cliente: selectedProcesso?.cliente || '',
      diadomes: selectedProcesso?.diadomes || '',
      agendado: selectedProcesso?.agendado || false,
      noperacao: selectedProcesso?.numero_operacao || '',
      balcao: selectedProcesso?.balcao || balcaoAmbiente,
      periodicidade: selectedProcesso?.periodicidade || null,
      data_inicio: selectedProcesso?.data_inicio ? new Date(selectedProcesso?.data_inicio) : null,
      data_arquivamento: selectedProcesso?.data_arquivamento ? new Date(selectedProcesso?.data_arquivamento) : null,
      data_entrada: selectedProcesso?.data_entrada ? add(new Date(selectedProcesso?.data_entrada), { hours: 2 }) : null,
      // CON
      entidade_con: '',
      is_cliente: true,
      nif: selectedProcesso?.con?.nif || '',
      pai: selectedProcesso?.con?.pai || '',
      mae: selectedProcesso?.con?.mae || '',
      docid: selectedProcesso?.con?.docid || '',
      morada: selectedProcesso?.con?.morada || '',
      emails: selectedProcesso?.con?.emails || '',
      telefone: selectedProcesso?.con?.telefone || '',
      ordenador: selectedProcesso?.con?.ordenador || '',
      telemovel: selectedProcesso?.con?.telemovel || '',
      profissao: selectedProcesso?.con?.profissao || '',
      origem_fundo: selectedProcesso?.con?.origem_fundo || '',
      nacionalidade: selectedProcesso?.con?.nacionalidade || '',
      finalidade_fundo: selectedProcesso?.con?.finalidade || '',
      local_trabalho: selectedProcesso?.con?.local_trabalho || '',
      local_pais_nascimento: selectedProcesso?.con?.local_pais_nascimento || '',
      residente: selectedProcesso?.con ? selectedProcesso?.con?.residente : true,
      tipo_docid: dis?.find((row) => row?.id === selectedProcesso?.con?.tipo_docid) || null,
      titular_ordenador: selectedProcesso ? selectedProcesso?.con?.titular_ordenador : true,
      estado_civil: estadosCivis?.find((row) => row?.id === selectedProcesso?.con?.estado_civil) || null,
      data_nascimento: selectedProcesso?.con?.data_nascimento
        ? add(new Date(selectedProcesso?.con?.data_nascimento), { hours: 2 })
        : null,
    }),
    [entidades, fluxo?.id, selectedProcesso, balcaoAmbiente]
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
        formData.append('valor', values.valor);
        formData.append('residente', values.residente);
        formData.append('origem_fundo', values.origem_fundo);
        formData.append('finalidade_fundo', values.finalidade_fundo);
        formData.append('titular_ordenador', values.titular_ordenador);
        if (values.nif) {
          formData.append('nif', values.nif);
        }
        if (values.pai) {
          formData.append('pai', values.pai);
        }
        if (values.mae) {
          formData.append('mae', values.mae);
        }
        if (values.docid) {
          formData.append('docid', values.docid);
        }
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
        if (values.ordenador) {
          formData.append('ordenador', values.ordenador);
        }
        if (values.profissao) {
          formData.append('profissao', values.profissao);
        }
        if (values.tipo_docid?.id) {
          formData.append('tipo_docid', values.tipo_docid?.id);
        }
        if (values.entidade_con) {
          formData.append('entidade_con', values.entidade_con);
        }
        if (values.nacionalidade) {
          formData.append('nacionalidade', values.nacionalidade);
        }
        if (values.local_trabalho) {
          formData.append('local_trabalho', values.local_trabalho);
        }
        if (values.estado_civil?.id) {
          formData.append('estado_civil', values.estado_civil?.id);
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

      if (selectedProcesso) {
        formData.append('is_interno ', selectedProcesso?.is_interno);
        dispatch(
          updateItem('processo', formData, { mail, perfilId, id: selectedProcesso?.id, msg: 'Processo atualizado' })
        );
      } else {
        formData.append('uo_origem_id', meuAmbiente?.uo_id);
        formData.append('estado_atual_id', meuAmbiente?.id);
        dispatch(createItem('processo interno', formData, { mail, perfilId, msg: 'Processo adicionado' }));
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
            setCliente={setCliente}
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
