import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// @mui
import LockPersonIcon from '@mui/icons-material/LockPerson';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import { Fab, Grid, Card, Stack, Tooltip, Dialog, Container, CardContent } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../redux/store';
import {
  getAll,
  getItem,
  resetItem,
  closeModal,
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
  Resgatar,
  Intervencao,
  NotaProcesso,
  DetalhesProcesso,
  HistoricoPrisoes,
  HistoricoProcesso,
} from '../sections/processo';
import { DesarquivarForm } from '../sections/processo/IntervencaoForm';
import AtribuirAcessoForm from '../sections/arquivo/AtribuirAcessoForm';
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
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { isLoading, done, error, processo, meusAmbientes, isOpenModalDesariquivar, meusacessos } = useSelector(
    (state) => state.digitaldocs
  );
  const hasHistorico = processo?.htransicoes && processo?.htransicoes?.length > 0;
  const hasHPrisoes = processo?.hprisoes && processo?.hprisoes?.length > 0;
  const hasAnexos = processo?.anexos && processo?.anexos?.length > 0;
  const perfilId = currentColaborador?.perfil_id;
  const fromArquivo = from?.get?.('from') === 'arquivo';
  const fromTarefas = from?.get?.('from') === 'tarefas';
  const fromEntradas = from?.get?.('from') === 'entradas';
  const fromProcurar = from?.get?.('from') === 'procurar';
  const fromPendentes = from?.get?.('from') === 'pendentes';
  const fromPorConcluir = from?.get?.('from') === 'porconcluir';
  const fromRetidos = from?.get?.('from') === 'retidos';

  const linkNavigate =
    (fromTarefas && `${PATH_DIGITALDOCS.processos.lista}?tab=tarefas`) ||
    (fromRetidos && `${PATH_DIGITALDOCS.processos.lista}?tab=retidos`) ||
    (fromPendentes && `${PATH_DIGITALDOCS.processos.lista}?tab=pendentes`) ||
    (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}?tab=arquivos`) ||
    (fromEntradas && `${PATH_DIGITALDOCS.controle.lista}?tab=entradas`) ||
    (fromPorConcluir && `${PATH_DIGITALDOCS.controle.lista}?tab=porconcluir`) ||
    (fromProcurar && PATH_DIGITALDOCS.processos.procurar) ||
    PATH_DIGITALDOCS.processos.root;

  useEffect(() => {
    if (done === 'aceitado') {
      enqueueSnackbar('Processo aceitado com sucesso', { variant: 'success' });
    } else if (done === 'arquivado') {
      enqueueSnackbar('Processo arquivado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    } else if (done === 'realizada') {
      enqueueSnackbar('Intervenção realizada com sucesso', { variant: 'success' });
      dispatch(resetItem('processo'));
      navigate(linkNavigate);
    } else if (done === 'resgatado') {
      enqueueSnackbar('Processo resgatado com sucesso', { variant: 'success' });
    } else if (done === 'finalizado') {
      enqueueSnackbar('Processo finalizado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    } else if (done === 'abandonado') {
      enqueueSnackbar('Processo abandonado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    } else if (done === 'solicitado') {
      enqueueSnackbar('Pedido enviado com sucesso', { variant: 'success' });
    } else if (done === 'desarquivado') {
      enqueueSnackbar('Processo desarquivado com sucesso', { variant: 'success' });
      navigate(linkNavigate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(
        error === 'Processo não encontrado ou Não tem permissão para o vê-lo!'
          ? 'Processo não encontrado ou não tens acesso a este item'
          : error[0]?.msg || error,
        {
          variant: 'error',
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getItem('processo', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  const handleAceitar = () => {
    const formData = { fluxoID: processo?.fluxo_id, perfilID: perfilId, estadoID: processo?.estado_atual_id };
    dispatch(aceitarProcesso(JSON.stringify(formData), { processoId: processo?.id, perfilId, mail }));
  };

  const podeAceitar = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.id === processo?.estado_atual_id) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  const podeResgatar = () => {
    let i = 0;
    if (!processo.ispendente && processo?.estado_atual_id !== processo?.htransicoes?.[0]?.estado_inicial_id) {
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.id === processo?.htransicoes?.[0]?.estado_inicial_id) {
          return true;
        }
        i += 1;
      }
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

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={processo?.referencia || 'Detalhes do processo'}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            {
              name:
                (fromTarefas && 'Tarefas') ||
                (fromArquivo && 'Arquivos') ||
                (fromEntradas && 'Entradas') ||
                (fromPendentes && 'Pendentes') ||
                (fromRetidos && 'Retidos') ||
                (fromPorConcluir && 'Por concluir') ||
                (fromProcurar && 'Pesquisa') ||
                'Processos',
              href: linkNavigate,
            },
            { name: processo?.referencia || 'Detalhes do processo' },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={1} direction={{ xs: 'row' }}>
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
                      {!processo?.is_lock && (
                        <>
                          {podeAceitar() && (
                            <Tooltip title="ACEITAR" arrow>
                              <Fab color="success" size="small" variant="soft" onClick={handleAceitar}>
                                <LockPersonIcon />
                              </Fab>
                            </Tooltip>
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
                      {processo?.is_lock && processo?.perfil_id === perfilId && <Intervencao processo={processo} />}
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
                <SearchNotFound404 message="Processo não encontrado ou não tens acesso a este item..." />
              </Grid>
            ) : (
              <>
                {(hasHistorico || hasHPrisoes) && (
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
                      {hasHistorico && <HistoricoProcesso historico={processo?.htransicoes} />}
                      {hasHPrisoes && <HistoricoPrisoes historico={processo?.hprisoes} />}
                    </Stack>
                  </Grid>
                )}
                <Grid item xs={12} lg={hasAnexos && 5}>
                  <Card sx={{ height: 1 }}>
                    <CardContent>
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
              </>
            )}
          </Grid>
        )}
      </Container>
    </Page>
  );
}
