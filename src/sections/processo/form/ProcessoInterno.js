import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
// utils
import { fluxosGmkt, bancaDigital } from '../../../utils/validarAcesso';
import { validacao, shapeText, shapeDate, shapeNumber, shapeMixed } from '../../../components/hook-form/yup-shape';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { createProcesso, updateItem } from '../../../redux/slices/digitaldocs';
// components
import { FormProvider } from '../../../components/hook-form';
// sections
import ProcessoInternoForm from './ProcessoInternoForm';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInterno.propTypes = { isEdit: PropTypes.bool, fluxo: PropTypes.object, processo: PropTypes.object };

export default function ProcessoInterno({ isEdit, processo, fluxo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { cc, uos } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { meuAmbiente } = useSelector((state) => state.parametrizacao);
  const balcaoAmbiente = useMemo(
    () => uos?.find((row) => row?.id === meuAmbiente?.uo_id)?.balcao || Number(cc?.uo?.balcao),
    [cc?.uo?.balcao, meuAmbiente?.uo_id, uos]
  );
  const entidades = useMemo(
    () =>
      (processo?.entidade && processo?.entidade?.split(';')?.map((row) => ({ numero: row }))) ||
      (!processo && fluxo?.assunto === 'Abertura de conta' && [{ numero: '' }]) ||
      [],
    [fluxo?.assunto, processo]
  );

  const formSchema = Yup.object().shape({
    anexos: !isEdit && Yup.array().min(1, 'Introduza pelo menos um anexo'),
    titular: fluxosGmkt(fluxo?.assunto) && Yup.string().required().label('Descriçãao'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().label('Nº de entidade') })),
    data_entrada: fluxo?.modelo !== 'Paralelo' && Yup.date().typeError().required().label('Data de entrada'),
    noperacao: (processo?.numero_operacao || fluxo?.iscon) && Yup.number().positive().label('Nº de operação'),
    email:
      (fluxo?.assunto === 'Formulário' && Yup.string().required().label('Codificação/Nome')) ||
      (bancaDigital(fluxo?.assunto) && Yup.string().email().required().label('Email')),
    conta:
      !fluxo?.limpo && fluxo?.assunto !== 'Abertura de conta' && Yup.number().positive().integer().label('Nº de conta'),
    // agendamento
    diadomes: shapeNumber('Dia do mês', true, '', 'agendado'),
    data_inicio: shapeDate('Data de início', true, '', 'agendado'),
    periodicidade: shapeMixed('Periodicidade', true, '', 'agendado'),
    data_arquivamento: shapeDate('Data de término', true, '', 'agendado'),
    // CON
    nif: validacao(fluxo?.iscon, shapeNumber('NIF', false, '', 'is_cliente')),
    mae: validacao(fluxo?.iscon, shapeText('Nome da Mãe', false, '', 'is_cliente')),
    pai: validacao(fluxo?.iscon, shapeText('Nome do Pai', false, '', 'is_cliente')),
    valor: validacao(fluxo?.iscon, Yup.number().positive().required().label('Valor')),
    profissao: validacao(fluxo?.iscon, shapeText('Profissão', false, '', 'is_cliente')),
    origem_fundo: validacao(fluxo?.iscon, Yup.string().required().label('Origem do fundo')),
    telefone: validacao(fluxo?.iscon, shapeText('Nº de telefone', false, '', 'is_cliente')),
    estado_civil: validacao(fluxo?.iscon, shapeMixed('Estado civil', false, '', 'is_cliente')),
    docid: validacao(fluxo?.iscon, shapeText('Doc. de identificação', false, '', 'is_cliente')),
    nacionalidade: validacao(fluxo?.iscon, shapeText('Nacionalidade', false, '', 'is_cliente')),
    ordenador: validacao(fluxo?.iscon, shapeText('Nome do ordenador', false, '', 'is_cliente')),
    entidade_con: validacao(fluxo?.iscon, shapeNumber('Nº da entidade', true, '', 'is_cliente')),
    finalidade_fundo: validacao(fluxo?.iscon, Yup.string().required().label('Finalidade do fundo')),
    data_nascimento: validacao(fluxo?.iscon, shapeDate('Data de nascimento', false, '', 'is_cliente')),
    tipo_docid: validacao(fluxo?.iscon, shapeMixed('Tipo doc. identificação', false, '', 'is_cliente')),
    local_pais_nascimento: validacao(fluxo?.iscon, shapeText('Local/País de nascimento', false, '', 'is_cliente')),
  });

  const defaultValues = useMemo(
    () => ({
      entidades,
      anexos: [],
      fluxo_id: fluxo?.id,
      valor: processo?.valor || '',
      conta: processo?.conta || '',
      email: processo?.email || '',
      obs: processo?.observacao || '',
      titular: processo?.titular || '',
      cliente: processo?.cliente || '',
      diadomes: processo?.dia_mes || '',
      agendado: processo?.agendado || false,
      noperacao: processo?.numero_operacao || '',
      balcao: processo?.balcao || balcaoAmbiente,
      periodicidade: processo?.periodicidade || null,
      data_inicio: processo?.data_inicio ? new Date(processo?.data_inicio) : null,
      data_arquivamento: processo?.data_arquivamento ? new Date(processo?.data_arquivamento) : null,
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
      // CON
      entidade_con: '',
      is_cliente: true,
      nif: processo?.con?.nif || '',
      pai: processo?.con?.pai || '',
      mae: processo?.con?.mae || '',
      docid: processo?.con?.docid || '',
      morada: processo?.con?.morada || '',
      emails: processo?.con?.emails || '',
      telefone: processo?.con?.telefone || '',
      ordenador: processo?.con?.ordenador || '',
      telemovel: processo?.con?.telemovel || '',
      profissao: processo?.con?.profissao || '',
      origem_fundo: processo?.con?.origem_fundo || '',
      nacionalidade: processo?.con?.nacionalidade || '',
      finalidade_fundo: processo?.con?.finalidade || '',
      local_trabalho: processo?.con?.local_trabalho || '',
      local_pais_nascimento: processo?.con?.local_pais_nascimento || '',
      residente: processo?.con ? processo?.con?.residente : true,
      tipo_docid: dis?.find((row) => row?.id === processo?.con?.tipo_docid) || null,
      titular_ordenador: processo ? processo?.con?.titular_ordenador : true,
      estado_civil: estadosCivis?.find((row) => row?.id === processo?.con?.estado_civil) || null,
      data_nascimento: processo?.con?.data_nascimento
        ? add(new Date(processo?.con?.data_nascimento), { hours: 2 })
        : null,
    }),
    [entidades, fluxo?.id, processo, balcaoAmbiente]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && processo) reset(defaultValues);
    if (!isEdit) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, fluxo?.id, processo]);

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
      if (values.obs) formData.append('obs', values.obs);
      if (fluxo?.assunto === 'Diário') {
        formData.append(
          'titular',
          `${fluxo?.assunto} (${format(values.data_entrada ? values.data_entrada : new Date(), 'dd/MM/yyyy')})`
        );
      } else if (values.titular) formData.append('titular', values.titular);
      if (fluxo?.assunto === 'Abertura de conta') {
        formData.append('conta', '');
        formData.append('cliente', '');
      } else {
        if (values.conta) formData.append('conta', values.conta);
        if (values.cliente) formData.append('cliente', values.cliente);
      }
      if (values.email) formData.append('email', values.email);
      if (values.noperacao) formData.append('noperacao', values.noperacao);

      if (values?.entidades?.length !== 0)
        formData.append(
          'entidades',
          values.entidades.map((row) => row?.numero)
        );

      // CON
      if (fluxo?.iscon) {
        formData.append('valor', values.valor);
        formData.append('residente', values.residente);
        formData.append('origem_fundo', values.origem_fundo);
        formData.append('finalidade_fundo', values.finalidade_fundo);
        formData.append('titular_ordenador', values.titular_ordenador);
        if (values.nif) formData.append('nif', values.nif);
        if (values.pai) formData.append('pai', values.pai);
        if (values.mae) formData.append('mae', values.mae);
        if (values.docid) formData.append('docid', values.docid);
        if (values.morada) formData.append('morada', values.morada);
        if (values.emails) formData.append('emails', values.emails);
        if (values.telefone) formData.append('telefone', values.telefone);
        if (values.telemovel) formData.append('telemovel', values.telemovel);
        if (values.ordenador) formData.append('ordenador', values.ordenador);
        if (values.profissao) formData.append('profissao', values.profissao);
        if (values.entidade_con) formData.append('entidade_con', values.entidade_con);
        if (values.tipo_docid?.id) formData.append('tipo_docid', values.tipo_docid?.id);
        if (values.nacionalidade) formData.append('nacionalidade', values.nacionalidade);
        if (values.local_trabalho) formData.append('local_trabalho', values.local_trabalho);
        if (values.estado_civil?.id) formData.append('estado_civil', values.estado_civil?.id);
        if (values.local_pais_nascimento) formData.append('local_pais_nascimento', values.local_pais_nascimento);
        if (values.data_nascimento) formData.append('data_nascimento', format(values.data_nascimento, 'yyyy-MM-dd'));
      }
      await values?.anexos?.forEach((row) => {
        formData.append('anexos', row);
      });

      if (processo) {
        dispatch(updateItem('processo', formData, { mfd: true, id: processo?.id, msg: 'Processo atualizado' }));
      } else {
        formData.append('uo_origem_id', meuAmbiente?.uo_id);
        formData.append('estado_atual_id', meuAmbiente?.id);
        dispatch(createProcesso('interno', formData, { msg: 'Processo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProcessoInternoForm fluxo={fluxo} processo={processo} />
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
