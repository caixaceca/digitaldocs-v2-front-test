import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// @mui
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import { Fab, Grid, Card, Stack, Tooltip, Dialog, Container, CardContent } from '@mui/material';
// utils
import { temNomeacao, isResponsavelUo } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import {
  getAll,
  getItem,
  resetItem,
  closeModal,
  selectItem,
  aceitarProcesso,
  pedirAcessoProcesso,
} from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { SearchNotFound404 } from '../components/table';
import { SkeletonProcesso } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import {
  Views,
  Anexos,
  Versoes,
  Libertar,
  Pareceres,
  Intervencao,
  NotaProcesso,
  DetalhesProcesso,
  HistoricoPrisoes,
  HistoricoProcesso,
  HistoricoPrisoesAnt,
  HistoricoProcessoAnt,
} from '../sections/processo';
import AtribuirAcessoForm from '../sections/arquivo/AtribuirAcessoForm';
import { DesarquivarForm, ParecerForm, Resgatar, Cancelar, AtribuirForm } from '../sections/processo/IntervencaoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Processo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [from] = useSearchParams();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, uos, cc, colaboradores } = useSelector((state) => state.intranet);
  const {
    done,
    error,
    processo,
    isLoading,
    isOpenModal,
    meusacessos,
    meusAmbientes,
    iAmInGrpGerente,
    colaboradoresEstado,
    isOpenModalDesariquivar,
  } = useSelector((state) => state.digitaldocs);
  const estadoId = processo?.estado_atual_id;
  const perfilId = cc?.perfil_id;
  const fromArquivo = from?.get?.('from') === 'arquivo';
  const fromProcurar = from?.get?.('from') === 'procurar';
  const fromEntradas = from?.get?.('from') === 'entradas';
  const fromPorConcluir = from?.get?.('from') === 'porconcluir';
  const fromTrabalhados = from?.get?.('from') === 'trabalhados';
  const hasAnexos = processo?.anexos && processo?.anexos?.length > 0;
  const uo = uos?.find((row) => row?.id === processo?.uoIdEstadoAtual);
  const hasHPrisoes = processo?.hprisoes && processo?.hprisoes?.length > 0;
  const hasPareceres = processo?.pareceres && processo?.pareceres?.length > 0;
  const hasHistorico = processo?.htransicoes && processo?.htransicoes?.length > 0;
  const estadoAtual = meusAmbientes?.find((row) => row?.id === estadoId);
  const isResponsavel = temNomeacao(cc) || isResponsavelUo(uo, mail) || iAmInGrpGerente;

  const linkNavigate =
    (fromProcurar &&
      from?.get('avancada') === 'false' &&
      `${PATH_DIGITALDOCS.processos.procurar}?avancada=false&chave=${from?.get?.('chave')}`) ||
    (fromProcurar &&
      from?.get('avancada') === 'true' &&
      `${PATH_DIGITALDOCS.processos.procurar}?avancada=true&conta=${from?.get?.('conta')}&cliente=${from?.get?.(
        'cliente'
      )}&entidade=${from?.get?.('entidade')}&nentrada=${from?.get?.('nentrada')}&noperacao=${from?.get?.(
        'noperacao'
      )}&uoId=${from?.get?.('uoId')}&perfilId=${from?.get?.('perfilId')}&datai=${from?.get?.(
        'datai'
      )}&dataf=${from?.get?.('dataf')}`) ||
    (fromProcurar &&
      from?.get('avancada') === 'true' &&
      `${PATH_DIGITALDOCS.processos.procurar}?avancada=true&chave=${from?.get?.('chave')}`) ||
    (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}?tab=arquivos`) ||
    (fromTrabalhados && `${PATH_DIGITALDOCS.controle.lista}?tab=trabalhados`) ||
    (fromPorConcluir &&
      `${PATH_DIGITALDOCS.controle.lista}?tab=porconcluir&estado=${from?.get?.('estado')}&assunto=${from?.get?.(
        'assunto'
      )}&colaborador=${from?.get?.('colaborador')}&filterSearch=${from?.get?.('filterSearch')}`) ||
    (fromEntradas &&
      `${PATH_DIGITALDOCS.controle.lista}?tab=entradas&datai=${from?.get?.('datai')}&dataf=${from?.get?.(
        'dataf'
      )}&estado=${from?.get?.('estado')}&assunto=${from?.get?.('assunto')}&colaborador=${from?.get?.(
        'colaborador'
      )}&filterSearch=${from?.get?.('filterSearch')}`) ||
    `${PATH_DIGITALDOCS.processos.lista}?tab=${from?.get?.('from') || 'tarefas'}`;

  const colaboradoresList = [];
  colaboradoresEstado?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => colaborador?.perfil_id === row?.perfil_id);
    if (colaborador) {
      colaboradoresList.push({ id: colaborador?.perfil_id, label: colaborador?.perfil?.displayName });
    }
  });

  const idEstado = (item) => {
    if (item === 'devdop') {
      return processo?.destinos?.find((row) => row?.modo === 'Seguimento');
    }
    if (item === 'gerencia') {
      return processo?.destinos?.find((row) => row?.nome?.includes('Atendimento'));
    }
    if (item === 'diario') {
      return processo?.destinos?.find((row) => row?.nome === 'Conferência de Diário');
    }
    return null;
  };

  const handlePrevNext = (next) => {
    if (mail && perfilId && processo?.nentrada && estadoId) {
      dispatch(
        getItem('prevnext', { mail, perfilId, estadoId, nentrada: processo?.nentrada, next, estado: processo?.nome })
      );
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
    } else if (done === 'realizada') {
      enqueueSnackbar('Intervenção realizada com sucesso', { variant: 'success' });
      dispatch(resetItem('processo'));
      handlePrevNext(true);
    } else if (done === 'resgatado') {
      enqueueSnackbar('Processo resgatado com sucesso', { variant: 'success' });
    } else if (done === 'cancelado') {
      enqueueSnackbar('Envio cancelado com sucesso', { variant: 'success' });
    } else if (done === 'finalizado') {
      enqueueSnackbar('Processo finalizado com sucesso', { variant: 'success' });
      handlePrevNext(true);
    } else if (done === 'abandonado') {
      enqueueSnackbar('Processo abandonado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    } else if (done === 'solicitado') {
      enqueueSnackbar('Pedido enviado com sucesso', { variant: 'success' });
    } else if (done === 'desarquivado') {
      enqueueSnackbar('Processo desarquivado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    } else if (done === 'processo libertado') {
      enqueueSnackbar('Processo libertado com sucesso', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    const errorStd = error[0]?.msg || error?.error || error;
    const noMoreProcess = errorStd?.includes('Sem mais processos disponíveis no estado');
    if (errorStd) {
      if (noMoreProcess && errorStd?.includes('Atendimento')) {
        //
      } else {
        enqueueSnackbar(
          errorStd === 'Processo não encontrado ou Não tem permissão para o vê-lo!'
            ? 'Processo não encontrado ou não tens acesso'
            : errorStd,
          {
            variant: noMoreProcess ? 'info' : 'error',
          }
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
    if (mail && processo?.origem_id && perfilId) {
      dispatch(getItem('origem', { id: processo?.origem_id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, processo?.origem_id]);

  useEffect(() => {
    if (mail && perfilId) {
      if (processo?.nome?.includes('Gerência') && idEstado('gerencia')?.id) {
        dispatch(getItem('colaboradoresEstado', { mail, perfilId, id: idEstado('gerencia')?.id }));
      } else if (processo?.nome === 'Devolução AN' && idEstado('devdop')?.id) {
        dispatch(getItem('colaboradoresEstado', { mail, perfilId, id: idEstado('devdop')?.id }));
      } else if (processo?.nome === 'Diário' && idEstado('diario')?.id) {
        dispatch(getItem('colaboradoresEstado', { mail, perfilId, id: idEstado('diario')?.id }));
      } else if (estadoId) {
        dispatch(getItem('colaboradoresEstado', { mail, id: estadoId, perfilId }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, perfilId, processo?.nome, estadoId]);

  const handleAceitar = () => {
    const formData = { fluxoID: processo?.fluxo_id, perfilID: perfilId, estadoID: estadoId };
    dispatch(aceitarProcesso(JSON.stringify(formData), { processoId: processo?.id, perfilId, mail }));
  };

  const podeAceitarAtribuir = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.id === processo?.estado_atual_id) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  const podeDarParecer = () => {
    let parecer = false;
    processo?.pareceres?.forEach((element) => {
      const belongTome = meusAmbientes.some((row) => row.id === element?.estado_id);
      if (belongTome && !element?.validado) {
        parecer = element;
      }
      return parecer;
    });
    return parecer;
  };

  const podeResgatar = () => {
    let i = 0;
    if (
      !processo.ispendente &&
      processo?.estado_atual_id !== processo?.htransicoes?.[0]?.estado_inicial_id &&
      perfilId === processo?.htransicoes?.[0]?.perfil_id
    ) {
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.id === processo?.htransicoes?.[0]?.estado_inicial_id) {
          return true;
        }
        i += 1;
      }
    }
    return false;
  };

  const processoPertence = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.id === processo?.estado_atual_id) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  const handlePedirAcesso = () => {
    dispatch(pedirAcessoProcesso(perfilId, processo?.id, mail));
  };

  const handleDesarquivar = () => {
    dispatch(getAll('destinosDesarquivamento', { mail, processoId: processo?.id }));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleParecer = () => {
    dispatch(selectItem(podeDarParecer()));
  };

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={processo?.referencia || 'Detalhes do processo'}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            {
              name:
                (fromArquivo && 'Arquivos') ||
                (fromEntradas && 'Entradas') ||
                (fromTrabalhados && 'Trabalhados') ||
                (fromPorConcluir && 'Por concluir') ||
                (fromProcurar && 'Pesquisa') ||
                (from?.get?.('from') &&
                  from?.get?.('from')?.charAt(0)?.toUpperCase() + from?.get?.('from')?.slice(1)) ||
                'Processos',
              href: linkNavigate,
            },
            { name: processo?.referencia || 'Detalhes do processo' },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={1} direction={{ xs: 'row' }}>
                  {estadoAtual && (
                    <>
                      <Tooltip title={`ANTERIOR (${estadoAtual?.nome})`} arrow>
                        <Fab color="inherit" size="small" variant="soft" onClick={() => handlePrevNext(false)}>
                          <ArrowBackIcon />
                        </Fab>
                      </Tooltip>
                      <Tooltip title={`PRÓXIMO (${estadoAtual?.nome})`} arrow>
                        <Fab color="inherit" size="small" variant="soft" onClick={() => handlePrevNext(true)}>
                          <ArrowForwardIcon />
                        </Fab>
                      </Tooltip>
                    </>
                  )}
                  <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                    <Versoes processoId={processo?.id} />
                    <Views processoId={processo?.id} />
                  </RoleBasedGuard>
                  {processo?.situacao === 'A' ? (
                    <>
                      <RoleBasedGuard roles={['arquivo-110', 'arquivo-111']}>
                        <Tooltip title="ATRIBUIR ACESSO" arrow>
                          <Fab color="success" size="small" variant="soft" onClick={onOpen}>
                            <TaskAltOutlinedIcon />
                          </Fab>
                        </Tooltip>

                        <Tooltip title="DESARQUIVAR" arrow>
                          <Fab color="error" size="small" variant="soft" onClick={handleDesarquivar}>
                            <UnarchiveOutlinedIcon />
                          </Fab>
                        </Tooltip>
                        <Dialog open={isOpenModalDesariquivar} onClose={handleClose} fullWidth maxWidth="sm">
                          <DesarquivarForm
                            open={isOpenModalDesariquivar}
                            onCancel={handleClose}
                            processoID={processo?.id}
                            fluxoID={processo?.fluxo_id}
                          />
                        </Dialog>
                        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
                          <AtribuirAcessoForm open={open} onCancel={onClose} processoId={processo?.id} />
                        </Dialog>
                      </RoleBasedGuard>
                      {!fromArquivo && meusacessos.includes('arquivo-110') && meusacessos.includes('arquivo-111') && (
                        <Tooltip title="PEDIR ACESSO" arrow>
                          <Fab color="success" size="small" variant="soft" onClick={handlePedirAcesso}>
                            <TaskAltOutlinedIcon />
                          </Fab>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <>
                      {processo?.in_paralelo_mode && processoPertence() && (
                        <Cancelar
                          processoId={processo?.id}
                          fluxiId={processo?.fluxo_id}
                          estadoId={processo?.estado_atual_id}
                        />
                      )}
                      {!processo?.is_lock && !processo?.in_paralelo_mode && (
                        <>
                          {podeAceitarAtribuir() && (
                            <>
                              {isResponsavel && !processo?.nome?.includes('Gerência') && (
                                <AtribuirForm
                                  processoID={processo?.id}
                                  perfilId={processo?.perfil_id}
                                  colaboradoresList={colaboradoresList}
                                />
                              )}
                              {(processo?.perfil_id === perfilId || !processo?.perfil_id) && (
                                <Tooltip title="ACEITAR" arrow>
                                  <Fab color="success" size="small" variant="soft" onClick={handleAceitar}>
                                    <LockPersonIcon />
                                  </Fab>
                                </Tooltip>
                              )}
                            </>
                          )}
                          {podeResgatar() && (
                            <Resgatar
                              processoId={processo?.id}
                              fluxiId={processo?.fluxo_id}
                              estadoId={processo?.htransicoes?.[0]?.estado_inicial_id}
                            />
                          )}
                        </>
                      )}
                      {podeDarParecer() && (
                        <>
                          <Tooltip title="PARECER" arrow>
                            <Fab color="success" size="small" variant="soft" onClick={handleParecer}>
                              <ChatOutlinedIcon />
                            </Fab>
                          </Tooltip>
                          <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={processo?.id} />
                        </>
                      )}
                      {processo?.is_lock && processo?.perfil_id === perfilId && (
                        <Intervencao processo={processo} colaboradoresList={colaboradoresList} />
                      )}
                      {processo?.is_lock && processo?.perfil_id !== perfilId && isResponsavel && processoPertence() && (
                        <Libertar processoID={processo?.id} perfilID={perfilId} />
                      )}
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          }
          sx={{ color: 'text.secondary' }}
        />
        {isLoading ? (
          <SkeletonProcesso />
        ) : (
          <Grid container spacing={3}>
            {!processo ? (
              <Grid item xs={12}>
                <SearchNotFound404 message="Processo não encontrado ou não tens acesso..." />
              </Grid>
            ) : (
              <>
                {(hasHistorico || hasHPrisoes || hasPareceres) && (
                  <Grid item xs={12} sx={{ mt: { sm: -1 } }}>
                    <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
                      {hasPareceres && <Pareceres pareceres={processo?.pareceres} processoId={processo?.id} />}
                      {hasHistorico && <HistoricoProcesso historico={processo?.htransicoes} />}
                      {hasHPrisoes && <HistoricoPrisoes historico={processo?.hprisoes} />}
                    </Stack>
                  </Grid>
                )}
                <Grid item xs={12} lg={hasAnexos && 5}>
                  <Card sx={{ height: 1 }}>
                    <CardContent id="card_detail">
                      {processo?.nota && <NotaProcesso nota={processo.nota} />}
                      <DetalhesProcesso processo={processo} />
                    </CardContent>
                  </Card>
                </Grid>
                {hasAnexos && (
                  <Grid item xs={12} lg={7}>
                    <Card sx={{ height: 1 }}>
                      <CardContent>
                        <Anexos anexos={processo?.anexos} />
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {cc?.id === 423 && (
                  <>
                    {hasHistorico && (
                      <Grid item xs={12} lg={hasHPrisoes && 6}>
                        <HistoricoProcessoAnt historico={processo?.htransicoes} />
                      </Grid>
                    )}
                    {hasHPrisoes && (
                      <Grid item xs={12} lg={hasHistorico && 6}>
                        <HistoricoPrisoesAnt historico={processo?.hprisoes} />
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}
          </Grid>
        )}
      </Container>
    </Page>
  );
}
