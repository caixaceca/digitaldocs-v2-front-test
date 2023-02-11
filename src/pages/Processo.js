import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// @mui
import { Fab, Grid, Card, Stack, Tooltip, Dialog, Container, CardContent } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, getAll, aceitarProcesso, pedirAcessoProcesso, closeModal } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import SvgIconStyle from '../components/SvgIconStyle';
import { SearchNotFound404 } from '../components/table';
import { SkeletonProcesso } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import {
  Anexos,
  Resgatar,
  Intervencao,
  NotaProcesso,
  DetalhesProcesso,
  HistoricoPrisoes,
  HistoricoProcesso,
} from '../sections/digitaldocs/processo';
import Ambiente from '../sections/digitaldocs/Ambiente';
import Views from '../sections/digitaldocs/processo/Views';
import DesarquivarForm from '../sections/digitaldocs/DesarquivarForm';
import AtribuirAcessoForm from '../sections/digitaldocs/AtribuirAcessoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Processo() {
  const { id } = useParams();
  const refColumn1 = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [from] = useSearchParams();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { isLoading, done, error, meuAmbiente, processo, meusAmbientes, isOpenModalDesariquivar } = useSelector(
    (state) => state.digitaldocs
  );
  const hasHistorico = processo?.htransicoes && processo?.htransicoes?.length > 0;
  const hasHPrisoes = processo?.hprisoes && processo?.hprisoes?.length > 0;
  const hasAnexos = processo?.anexos && processo?.anexos?.length > 0;
  const perfilId = currentColaborador?.perfil_id;
  const widthC1 = refColumn1?.current?.offsetWidth - 25;
  const fromArquivo = from?.get?.('from') === 'arquivo';
  const fromEntradas = from?.get?.('from') === 'entradas';
  const fromProcurar = from?.get?.('from') === 'procurar';
  const fromPorConcluir = from?.get?.('from') === 'porconcluir';
  const fromMinhasTarefas = from?.get?.('from') === 'minhastarefas';
  const fromMeusPendentes = from?.get?.('from') === 'meuspendentes';

  useEffect(() => {
    if (done === 'aceitado') {
      enqueueSnackbar('Processo aceitado com sucesso', { variant: 'success' });
    } else if (done === 'resgatado') {
      enqueueSnackbar('Processo resgatado com sucesso', { variant: 'success' });
    } else if (done === 'finalizado') {
      enqueueSnackbar('Processo finalizado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.processos.root);
    } else if (done === 'abandonado') {
      enqueueSnackbar('Processo abandonado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.processos.root);
    } else if (done === 'solicitado') {
      enqueueSnackbar('Pedido enviado com sucesso', { variant: 'success' });
    } else if (done === 'Processo eliminado') {
      enqueueSnackbar('Processo eliminado com sucesso', { variant: 'success' });
      navigate(
        (fromMinhasTarefas && `${PATH_DIGITALDOCS.processos.lista}?tab=minhastarefas`) ||
          (fromMeusPendentes && `${PATH_DIGITALDOCS.processos.lista}?tab=meuspendentes`) ||
          (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}?tab=arquivos`) ||
          (fromEntradas && `${PATH_DIGITALDOCS.controle.lista}?tab=entradas`) ||
          (fromPorConcluir && `${PATH_DIGITALDOCS.controle.lista}?tab=porconcluir`) ||
          (fromProcurar && PATH_DIGITALDOCS.processos.procurar) ||
          PATH_DIGITALDOCS.processos.root
      );
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
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.id === processo?.estado_atual_id) {
          return true;
        }
        i += 1;
      }
    } else if (processo?.estado_atual_id === meuAmbiente?.id) {
      return true;
    }
    return false;
  };

  const podeResgatar = () => {
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.id === processo?.htransicoes?.[0]?.estado_inicial_id) {
          return true;
        }
        i += 1;
      }
    } else if (processo?.htransicoes?.[0]?.estado_inicial_id === meuAmbiente?.id) {
      return true;
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
                (fromArquivo && 'Arquivos') ||
                (fromEntradas && 'Entradas') ||
                (fromPorConcluir && 'Por concluir') ||
                (fromMinhasTarefas && 'Minhas tarefas') ||
                (fromProcurar && 'Resultado de procura') ||
                (fromMeusPendentes && 'Tarefas pendentes') ||
                'Processos',
              href:
                (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}?tab=arquivos`) ||
                (fromEntradas && `${PATH_DIGITALDOCS.controle.lista}?tab=entradas`) ||
                (fromPorConcluir && `${PATH_DIGITALDOCS.controle.lista}?tab=porconcluir`) ||
                (fromMinhasTarefas && `${PATH_DIGITALDOCS.processos.lista}?tab=minhastarefas`) ||
                (fromMeusPendentes && `${PATH_DIGITALDOCS.processos.lista}?tab=meuspendentes`) ||
                (fromProcurar && PATH_DIGITALDOCS.processos.procurar) ||
                PATH_DIGITALDOCS.processos.root,
            },
            { name: processo?.referencia || 'Detalhes do processo' },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={1} direction={{ xs: 'row' }}>
                  <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                    <Views processoId={processo?.id} />
                  </RoleBasedGuard>
                  {processo?.situacao === 'A' ? (
                    <>
                      <RoleBasedGuard roles={['arquivo-110', 'arquivo-111']}>
                        <Tooltip title="ATRIBUIR ACESSO" arrow>
                          <Fab color="success" size="small" variant="soft" onClick={onOpen}>
                            <SvgIconStyle src="/assets/icons/check.svg" />
                          </Fab>
                        </Tooltip>

                        <Tooltip title="DESARQUIVAR" arrow>
                          <Fab color="error" size="small" variant="soft" onClick={handleDesarquivar}>
                            <SvgIconStyle src="/assets/icons/unarchive.svg" />
                          </Fab>
                        </Tooltip>
                      </RoleBasedGuard>
                      {!fromArquivo && (
                        <Tooltip title="PEDIR ACESSO" arrow>
                          <Fab color="success" size="small" variant="soft" onClick={handlePedirAcesso}>
                            <SvgIconStyle src="/assets/icons/check.svg" />
                          </Fab>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <>
                      {!processo?.is_lock && processo?.situacao !== 'F' && (
                        <>
                          {podeAceitar() && (
                            <Tooltip title="ACEITAR" arrow>
                              <Fab color="success" size="small" variant="soft" onClick={handleAceitar}>
                                <SvgIconStyle src="/assets/icons/lock.svg" />
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
              {meusAmbientes?.length > 1 && <Ambiente origem="processo" />}
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
                <Grid item xs={12} lg={hasAnexos && 5}>
                  <Card sx={{ minHeight: widthC1 }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        {processo?.nota && <NotaProcesso nota={processo.nota} />}
                        <DetalhesProcesso processo={processo} />
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                {hasAnexos && (
                  <Grid item xs={12} lg={7}>
                    <Card ref={refColumn1}>
                      <CardContent>
                        <Anexos anexos={processo?.anexos} />
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {hasHistorico && (
                  <Grid item xs={12} lg={hasHPrisoes && 6}>
                    <HistoricoProcesso historico={processo?.htransicoes} fluxoId={processo?.fluxo_id} />
                  </Grid>
                )}
                {hasHPrisoes && (
                  <Grid item xs={12} lg={hasHistorico && 6}>
                    <HistoricoPrisoes historico={processo?.hprisoes} />
                  </Grid>
                )}

                {processo?.situacao === 'A' && (
                  <>
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
