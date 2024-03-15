import { useSnackbar } from 'notistack';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
// utils
import {
  temAcesso,
  temNomeacao,
  podeDarParecer,
  isResponsavelUo,
  findColaboradores,
  processoMePertence,
} from '../utils/validarAcesso';
import { fYear } from '../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { parecerEstadoSuccess } from '../redux/slices/cc';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
import { getAll, getItem, closeModal, selectItem, updateItem } from '../redux/slices/digitaldocs';
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
  Versoes,
  Libertar,
  Pareceres,
  Intervencao,
  DadosGerais,
  HistoricoPrisoes,
  HistoricoTransicao,
} from '../sections/processo';
// sections
import AtribuirAcessoForm from '../sections/arquivo/AtribuirAcessoForm';
import { Views, PareceresEstado } from '../sections/credito-colaborador/Detalhes';
import { DesarquivarForm, ParecerForm, Resgatar, Cancelar, AtribuirForm } from '../sections/processo/IntervencaoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

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
  const { processo, destinos, done, error, isOpenModal, isLoading, isOpenModalDesariquivar } = useSelector(
    (state) => state.digitaldocs
  );
  const { meusacessos, meusAmbientes, iAmInGrpGerente, isAdmin, colaboradoresEstado } = useSelector(
    (state) => state.parametrizacao
  );
  const perfilId = cc?.perfil_id;
  const fluxoId = processo?.fluxo_id;
  const perfilP = processo?.perfil_id;
  const estado = processo?.estado_atual;
  const estadoId = processo?.estado_atual_id;
  const fromEntradas = params?.get?.('from') === 'entradas';
  const fromPorConcluir = params?.get?.('from') === 'porconcluir';
  const fromTrabalhados = params?.get?.('from') === 'trabalhados';
  const uo = uos?.find((row) => row?.id === processo?.uoIdEstadoAtual);
  const estadoAtual = meusAmbientes?.find((row) => row?.id === estadoId);
  const isResponsavel = temNomeacao(cc) || isResponsavelUo(uo, mail) || iAmInGrpGerente;
  const inGerencia = estado?.includes('Gerência') || estado?.includes('Caixa Principal');

  const linkNavigate =
    (params?.get?.('from') === 'Arquivos' && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
    (params?.get?.('from') === 'Pesquisa' && `${PATH_DIGITALDOCS.processos.procurar}`) ||
    ((fromTrabalhados || fromPorConcluir || fromEntradas) && `${PATH_DIGITALDOCS.controle.lista}`) ||
    `${PATH_DIGITALDOCS.processos.lista}`;

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
      ...(processo && processo?.pareceres_estado?.length > 0
        ? [
            {
              value: 'Pareceres',
              component: <Pareceres id={id} assunto={processo?.titular} pareceres={processo?.pareceres_estado} />,
            },
          ]
        : []),
      ...(processo && processo?.htransicoes?.length > 0
        ? [{ value: 'Transições', component: <HistoricoTransicao historico={processo?.htransicoes} /> }]
        : []),
      ...(processo && processo?.hprisoes?.length > 0
        ? [{ value: 'Retenções', component: <HistoricoPrisoes historico={processo?.hprisoes} /> }]
        : []),
      ...(processo && isAdmin ? [{ value: 'Versões', component: <Versoes id={id} /> }] : []),
      ...(processo && isAdmin ? [{ value: 'Visualizações', component: <Views id={id} isLoading={isLoading} /> }] : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const idEstado = (item) => {
    if (item === 'devdop') {
      return destinos?.find((row) => row?.modo === 'Seguimento' && !row?.nome?.includes('Atendimento'));
    }
    if (item === 'gerencia') {
      return destinos?.find((row) => row?.nome?.includes('Atendimento'));
    }
    if (item === 'diario') {
      return destinos?.find((row) => row?.nome === 'Conferência de Diário');
    }
    return null;
  };

  const handlePrevNext = (next) => {
    if (mail && perfilId && id && estadoId) {
      dispatch(getItem('prevnext', { mail, next, perfilId, estadoId, processoId: id, estado }));
    } else {
      navigate(linkNavigate);
    }
  };

  useEffect(() => {
    if (done === 'aceitado') {
      enqueueSnackbar('Processo aceitado com sucesso', { variant: 'success' });
    } else if (done === 'arquivado') {
      enqueueSnackbar('Processo arquivado com sucesso', { variant: 'success' });
      handlePrevNext(true);
    } else if (done === 'devolvida' || done === 'encaminhada') {
      enqueueSnackbar(`Processo ${done} com sucesso`, { variant: 'success' });
      handlePrevNext(true);
    } else if (done === 'Processo adicionado a listagem de pendentes') {
      enqueueSnackbar('Processo adicionado a listagem de pendentes', { variant: 'success' });
      handlePrevNext(true);
    } else if (done === 'Parecer enviado') {
      enqueueSnackbar('Parecer enviado com sucesso', { variant: 'success' });
      dispatch(parecerEstadoSuccess());
      handlePrevNext(true);
    } else if (done === 'finalizado') {
      enqueueSnackbar('Processo finalizado com sucesso', { variant: 'success' });
      handlePrevNext(true);
    } else if (done === 'desarquivado') {
      enqueueSnackbar('Processo desarquivado com sucesso', { variant: 'success' });
      handleClose();
      navigate(linkNavigate);
    } else if (
      done === 'Pedido enviado' ||
      done === 'Envio cancelado' ||
      done === 'Pareceres fechado' ||
      done === 'Processo aceitado' ||
      done === 'Processo libertado' ||
      done === 'Processo resgatado'
    ) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
    } else if (done === 'Processo abandonado' || done === 'Atribuição eliminada' || done === 'Processo atribuído') {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      navigate(linkNavigate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    const noMoreProcess = error?.includes('Sem mais processos disponíveis no estado');
    if (error) {
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
    if (mail && id && processo?.preso && processo?.perfil_id === perfilId) {
      dispatch(getAll('destinos', { id, mail, perfilId, estadoId }));
    }
  }, [dispatch, perfilId, estadoId, mail, id, processo?.preso, processo?.perfil_id]);

  useEffect(() => {
    if (mail && perfilId && estado) {
      if (estadoId && !processo?.preso && perfilP && inGerencia) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: estadoId }));
      } else if (inGerencia && idEstado('gerencia')?.id) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('gerencia')?.id }));
      } else if (estado === 'Devolução AN' && idEstado('devdop')?.id) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('devdop')?.id }));
      } else if (estado === 'Diário' && idEstado('diario')?.id) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('diario')?.id }));
      } else if (estadoId) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, id: estadoId, perfilId }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, perfilId, estado, estadoId]);

  const handleAceitar = () => {
    dispatch(updateItem('aceitar', null, { mail, fluxoId, perfilId, estadoId, id, msg: 'Processo aceitado' }));
  };

  const handlePedirAcesso = () => {
    dispatch(updateItem('pedir acesso', '', { perfilId, id, mail, msg: 'Pedido enviado' }));
  };

  const handleDesarquivar = () => {
    dispatch(getAll('destinosDesarquivamento', { mail, processoId: id }));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleParecer = () => {
    dispatch(selectItem(podeDarParecer(meusAmbientes, processo?.pareceres_estado)));
  };

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={
            processo
              ? `${processo?.numero_entrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
                  processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                }`
              : 'Detalhes do processo'
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            {
              name:
                (fromEntradas && 'Entradas') ||
                (fromTrabalhados && 'Trabalhados') ||
                (fromPorConcluir && 'Por concluir') ||
                (params?.get?.('from') &&
                  params?.get?.('from')?.charAt(0)?.toUpperCase() + params?.get?.('from')?.slice(1)) ||
                'Processos',
              href: linkNavigate,
            },
            {
              name: processo
                ? `${processo?.numero_entrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
                    processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                  }`
                : 'Detalhes do processo',
            },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={0.5} direction={{ xs: 'row' }}>
                  {estadoAtual && (
                    <>
                      <DefaultAction
                        icon="back"
                        color="inherit"
                        label={`ANTERIOR (${estadoAtual?.nome})`}
                        handleClick={() => handlePrevNext(false)}
                      />
                      <DefaultAction
                        icon="forward"
                        color="inherit"
                        label={`PRÓXIMO (${estadoAtual?.nome})`}
                        handleClick={() => handlePrevNext(true)}
                      />
                    </>
                  )}
                  {processo?.situacao === 'A' ? (
                    <>
                      <RoleBasedGuard roles={['arquivo-110', 'arquivo-111']}>
                        <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={onOpen} />
                        <DefaultAction color="error" label="DESARQUIVAR" handleClick={handleDesarquivar} />
                        <Dialog open={isOpenModalDesariquivar} onClose={handleClose} fullWidth maxWidth="sm">
                          <DesarquivarForm
                            processoID={id}
                            fluxoID={fluxoId}
                            onCancel={handleClose}
                            open={isOpenModalDesariquivar}
                          />
                        </Dialog>
                        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
                          <AtribuirAcessoForm open={open} onCancel={onClose} processoId={id} />
                        </Dialog>
                      </RoleBasedGuard>
                      {!temAcesso(['arquivo-110', 'arquivo-111'], meusacessos) && (
                        <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={handlePedirAcesso} />
                      )}
                    </>
                  ) : (
                    <>
                      {processo?.em_paralelo && processoMePertence(meusAmbientes, estadoId) && (
                        <>
                          <Cancelar fluxoId={fluxoId} processoId={id} estadoId={estadoId} />
                          <Cancelar cancelar fluxoId={fluxoId} processoId={id} estadoId={estadoId} />
                        </>
                      )}
                      {!processo?.preso && !processo?.em_paralelo && (
                        <>
                          {processo?.pareceres_estado?.length === 0 ? (
                            <>
                              {((processoMePertence(meusAmbientes, estadoId) &&
                                isResponsavel &&
                                ((!processo?.preso && perfilP && inGerencia) ||
                                  (estado !== 'Diário' && estado !== 'Devolução AN' && !inGerencia))) ||
                                isAdmin) && (
                                <AtribuirForm
                                  processoID={id}
                                  fluxoId={fluxoId}
                                  perfilId={perfilP}
                                  colaboradoresList={colaboradoresList}
                                />
                              )}
                              {processoMePertence(meusAmbientes, estadoId) && (!perfilP || perfilP === perfilId) && (
                                <DefaultAction label="ACEITAR" handleClick={handleAceitar} />
                              )}
                            </>
                          ) : (
                            <PareceresEstado
                              normal
                              pareceres={processo?.pareceres_estado}
                              estado={estado?.replace(' - P/S/P', '')}
                            />
                          )}
                          {!processo.pendente &&
                            estadoId !== processo?.htransicoes?.[0]?.estado_inicial_id &&
                            perfilId === processo?.htransicoes?.[0]?.perfil_id &&
                            processoMePertence(meusAmbientes, processo?.htransicoes?.[0]?.estado_inicial_id) && (
                              <Resgatar
                                processoId={id}
                                fluxoId={fluxoId}
                                estadoId={processo?.htransicoes?.[0]?.estado_inicial_id}
                              />
                            )}
                        </>
                      )}
                      {podeDarParecer(meusAmbientes, processo?.pareceres_estado) && (
                        <>
                          <DefaultAction label="PARECER" handleClick={() => handleParecer()} />
                          <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={id} />
                        </>
                      )}
                      {processo?.preso && perfilP === perfilId && <Intervencao colaboradoresList={colaboradoresList} />}
                      {isResponsavel &&
                        processo?.preso &&
                        perfilP !== perfilId &&
                        processoMePertence(meusAmbientes, estadoId) && <Libertar processoID={id} perfilID={perfilId} />}
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          }
        />
        <>
          <Card sx={{ height: 1 }}>
            <TabCard tabs={tabsList} tipo={currentTab} setTipo={setCurrentTab} />
            {tabsList.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}
          </Card>
        </>
      </Container>
    </Page>
  );
}
