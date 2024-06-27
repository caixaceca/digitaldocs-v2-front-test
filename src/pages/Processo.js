import { useSnackbar } from 'notistack';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { fYear } from '../utils/formatTime';
import { temAcesso, temNomeacao, findColaboradores, pertencoEstadoId } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { parecerEstadoSuccess } from '../redux/slices/cc';
import { getAll, getItem, updateItem, closeModal } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { TabCard } from '../components/TabsWrapper';
import { DefaultAction } from '../components/Actions';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import {
  Views,
  Estados,
  Versoes,
  Pareceres,
  Transicoes,
  DadosGerais,
  TableDetalhes,
} from '../sections/processo/Detalhes';
import {
  Resgatar,
  Cancelar,
  Abandonar,
  AtribuirForm,
  DesarquivarForm,
  AtribuirAcessoForm,
} from '../sections/processo/form/IntervencaoForm';
import Intervencao from '../sections/processo/Intervencao';

// ----------------------------------------------------------------------

export default function Processo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { mail, uos, cc, colaboradores } = useSelector((state) => state.intranet);
  const { processo, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { meusacessos, meusAmbientes, isGerente, isAdmin, auditoriaProcesso, colaboradoresEstado } = useSelector(
    (state) => state.parametrizacao
  );
  const perfilId = cc?.perfil_id;
  const fluxoId = processo?.fluxo_id;
  const estadoId = processo?.estados?.length === 1 ? processo?.estados?.[0]?.estado_id : '';
  const uoOrigem = useMemo(() => uos?.find((row) => row?.id === processo?.uo_origem_id), [processo?.uo_origem_id, uos]);
  const podeVerProxAnt = useMemo(
    () =>
      processo?.estados?.length === 1 && meusAmbientes?.find((row) => row?.id === processo?.estados?.[0]?.estado_id),
    [processo?.estados, meusAmbientes]
  );
  const isResponsavel = temNomeacao(cc) || isGerente;

  const linkNavigate = useMemo(
    () =>
      (params?.get?.('from') === 'Arquivos' && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
      (params?.get?.('from') === 'Controle' && `${PATH_DIGITALDOCS.controle.lista}`) ||
      (params?.get?.('from') === 'Pesquisa' && `${PATH_DIGITALDOCS.processos.procurar}`) ||
      `${PATH_DIGITALDOCS.processos.lista}`,
    [params]
  );

  const colaboradoresList = useMemo(
    () =>
      findColaboradores(
        colaboradores,
        colaboradoresEstado?.map((row) => row?.perfil_id)
      ),
    [colaboradores, colaboradoresEstado]
  );

  const tabsList = useMemo(
    () => [
      { value: 'Dados gerais', component: <DadosGerais /> },
      ...(processo && processo?.estados?.length > 0
        ? [
            {
              value: 'Estados',
              component: <Estados id={id} assunto={processo?.titular} pareceres={processo?.estados} />,
            },
          ]
        : []),
      ...(processo && processo?.pareceres_estado?.length > 0
        ? [
            {
              value: 'Pareceres',
              component: <Pareceres id={id} assunto={processo?.titular} pareceres={processo?.pareceres_estado} />,
            },
          ]
        : []),
      ...(processo && processo?.htransicoes?.length > 0
        ? [{ value: 'Transições', component: <Transicoes transicoes={processo?.htransicoes} /> }]
        : []),
      ...(processo
        ? [
            { value: 'Retenções', component: <TableDetalhes id={processo?.id} item="hretencoes" /> },
            { value: 'Pendências', component: <TableDetalhes id={processo?.id} item="hpendencias" /> },
            { value: 'Atribuições', component: <TableDetalhes id={processo?.id} item="hatribuicoes" /> },
          ]
        : []),
      ...(processo && (isAdmin || auditoriaProcesso) ? [{ value: 'Versões', component: <Versoes id={id} /> }] : []),
      ...(processo && (isAdmin || auditoriaProcesso) ? [{ value: 'Visualizações', component: <Views id={id} /> }] : []),
    ],
    [id, isAdmin, auditoriaProcesso, processo]
  );

  const proximoAnterior = (next) => {
    if (mail && perfilId && id && estadoId) {
      dispatch(getItem('prevnext', { mail, next, perfilId, estadoId, processoId: id, estado: processo?.estado_atual }));
    } else {
      navigate(linkNavigate);
    }
  };

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
    }
    if (done === 'Parecer enviado') {
      dispatch(parecerEstadoSuccess());
    }
    if (
      done === 'Parecer enviado' ||
      done === 'Processo atribuído' ||
      done === 'Processo arquivado' ||
      done === 'Processo devolvida' ||
      done === 'Processo finalizado' ||
      done === 'Processo abandonado' ||
      done === 'Processo encaminhada' ||
      done === 'Atribuição eliminada' ||
      done === 'Processo desarquivado' ||
      done === 'Processo adicionado a listagem de pendentes'
    ) {
      proximoAnterior(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      const noMoreProcess = error?.includes('Sem mais processos disponíveis no estado');
      if (noMoreProcess && error?.includes('Atendimento')) {
        //
      } else {
        enqueueSnackbar(
          error === 'Processo não encontrado ou Não tem permissão para o vê-lo!'
            ? 'Processo não encontrado ou não tens acesso'
            : error,
          { variant: noMoreProcess ? 'info' : 'error' }
        );
      }
      if (noMoreProcess) {
        navigate(linkNavigate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getItem('processo', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (mail && processo?.id) {
      dispatch(getAll('htransicoes', { id: processo?.id, mail, perfilId }));
    }
  }, [dispatch, mail, perfilId, processo?.id]);

  useEffect(() => {
    if (mail && id && processo?.estados?.[0]?._lock && processo?.estados?.[0]?.perfil_id === perfilId) {
      dispatch(getAll('destinos', { id, mail, perfilId, estadoId: processo?.estados?.[0]?.estado_id }));
    }
  }, [dispatch, id, mail, perfilId, processo?.estados]);

  const handleAceitar = (estadoId) => {
    dispatch(updateItem('aceitar', null, { mail, fluxoId, perfilId, estadoId, id, msg: 'Processo aceitado' }));
  };

  const handlePedirAcesso = () => {
    dispatch(updateItem('pedir acesso', '', { perfilId, id, mail, msg: 'Pedido enviado' }));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  console.log(processo?.estado_envio);

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={
            processo
              ? `${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
                  processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                }`
              : 'Detalhes do processo'
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: params?.get?.('from') || 'Processos', href: linkNavigate },
            {
              name: processo
                ? `${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
                    processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                  }`
                : 'Detalhes do processo',
            },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={0.5} direction={{ xs: 'row' }}>
                  {podeVerProxAnt &&
                    ['ANTERIOR', 'PRÓXIMO']?.map((row) => (
                      <DefaultAction
                        key={row}
                        icon={row}
                        color="inherit"
                        label={`${row} (${podeVerProxAnt?.nome})`}
                        handleClick={() => proximoAnterior(false)}
                      />
                    ))}
                  {processo?.status === 'Arquivado' ? (
                    <>
                      {temAcesso(['arquivo-110', 'arquivo-111'], meusacessos) ? (
                        <>
                          <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={onOpen} />
                          <DesarquivarForm id={id} onCancel={handleClose} colaboradoresList={colaboradoresList} />
                          <AtribuirAcessoForm open={open} onCancel={onClose} processoId={id} />
                        </>
                      ) : (
                        <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={handlePedirAcesso} />
                      )}
                    </>
                  ) : (
                    <>
                      {/* Transição em série */}
                      {processo?.estados?.length === 1 && processo?.pareceres_estado?.length === 0 && (
                        <>
                          {/* Aceitar/Atribuir/Intervir */}
                          {pertencoEstadoId(meusAmbientes, processo?.estados?.[0]?.estado_id) && (
                            <>
                              {processo?.estados?.[0]?._lock && processo?.estados?.[0]?.perfil_id === perfilId ? (
                                <Intervencao colaboradoresList={colaboradoresList} />
                              ) : (
                                <>
                                  {!processo?.estados?.[0]?._lock &&
                                    (!processo?.estados?.[0]?.perfil_id ||
                                      processo?.estados?.[0]?.perfil_id === perfilId) && (
                                      <DefaultAction
                                        label="ACEITAR"
                                        handleClick={() => handleAceitar(processo?.estados?.[0]?.estado_id)}
                                      />
                                    )}
                                  {!processo?.estados?.[0]?._lock && (isResponsavel || isAdmin) && (
                                    <AtribuirForm
                                      processoID={id}
                                      fluxoId={fluxoId}
                                      colaboradoresList={colaboradoresList}
                                      perfilId={processo?.estados?.[0]?.perfil_id}
                                    />
                                  )}
                                </>
                              )}
                            </>
                          )}

                          {/* Resgatar */}
                          {!processo?.pendente &&
                            !processo?.estados?.[0]?._lock &&
                            !processo?.estados?.[0]?.perfil_id &&
                            !processo?.htransicoes?.[0]?.resgate &&
                            perfilId === processo?.htransicoes?.[0]?.perfil_id &&
                            pertencoEstadoId(meusAmbientes, processo?.htransicoes?.[0]?.estado_inicial_id) && (
                              <Resgatar
                                processoId={id}
                                fluxoId={fluxoId}
                                estadoId={processo?.htransicoes?.[0]?.estado_inicial_id}
                              />
                            )}
                        </>
                      )}

                      {/* Transição em paralelo */}
                      {processo?.estados?.length > 1 && (
                        <>
                          {pertencoEstadoId(meusAmbientes, processo?.estado_envio?.estado_id) && (
                            <>
                              {processo?.estado_envio?._lock && processo?.estado_envio?.perfil_id === perfilId && (
                                <>
                                  <Abandonar
                                    id={processo?.id}
                                    fluxoId={fluxoId}
                                    isSaving={isSaving}
                                    estadoId={processo?.estado_envio?.estado_id}
                                  />
                                  <Cancelar fluxoId={fluxoId} processoId={id} estadoId={processo?.estado_atual_id} />
                                  <Cancelar
                                    cancelar
                                    processoId={id}
                                    fluxoId={fluxoId}
                                    estadoId={processo?.estado_atual_id}
                                  />
                                </>
                              )}
                              {!processo?.estado_envio?._lock && (
                                <DefaultAction
                                  label="ACEITAR"
                                  handleClick={() => handleAceitar(processo?.estado_envio?.estado_id)}
                                />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          }
        />
        <Card sx={{ height: 1 }}>
          <TabCard tabs={tabsList} tipo={currentTab} setTipo={setCurrentTab} />
          {tabsList.map((tab) => {
            const isMatched = tab.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })}
        </Card>
      </Container>
    </Page>
  );
}
