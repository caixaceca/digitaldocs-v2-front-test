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
  temNomeacao,
  podeDarParecer,
  isResponsavelUo,
  findColaboradores,
  processoMePertence,
} from '../utils/validarAcesso';
import selectTab from '../utils/selectTab';
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
  const { done, error, processo, isOpenModal, isLoading, isOpenModalDesariquivar } = useSelector(
    (state) => state.digitaldocs
  );
  const { meusacessos, meusAmbientes, iAmInGrpGerente, isAdmin, colaboradoresEstado } = useSelector(
    (state) => state.parametrizacao
  );
  const perfilId = cc?.perfil_id;
  const estadoId = processo?.estado_atual_id;
  const fromArquivo = params?.get?.('from') === 'arquivo';
  const fromProcurar = params?.get?.('from') === 'procurar';
  const fromEntradas = params?.get?.('from') === 'entradas';
  const fromPorConcluir = params?.get?.('from') === 'porconcluir';
  const fromTrabalhados = params?.get?.('from') === 'trabalhados';
  const uo = uos?.find((row) => row?.id === processo?.uoIdEstadoAtual);
  const estadoAtual = meusAmbientes?.find((row) => row?.id === estadoId);
  const isResponsavel = temNomeacao(cc) || isResponsavelUo(uo, mail) || iAmInGrpGerente;

  const linkNavigate =
    (fromProcurar && `${PATH_DIGITALDOCS.processos.procurar}`) ||
    (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
    ((fromTrabalhados || fromPorConcluir || fromEntradas) && `${PATH_DIGITALDOCS.controle.lista}`) ||
    `${PATH_DIGITALDOCS.processos.lista}`;

  const colaboradoresList = findColaboradores(
    colaboradores,
    colaboradoresEstado?.map((row) => row?.perfil_id)
  );

  const tabsList = useMemo(
    () => [
      { value: 'Dados gerais', component: <DadosGerais /> },
      ...(processo && processo?.pareceres && processo?.pareceres?.length > 0
        ? [
            {
              value: 'Pareceres',
              component: <Pareceres id={processo?.id} assunto={processo?.titular} pareceres={processo?.pareceres} />,
            },
          ]
        : []),
      ...(processo && processo?.htransicoes && processo?.htransicoes?.length > 0
        ? [{ value: 'Transições', component: <HistoricoTransicao historico={processo?.htransicoes} /> }]
        : []),
      ...(processo && processo?.hprisoes && processo?.hprisoes?.length > 0
        ? [{ value: 'Retenções', component: <HistoricoPrisoes historico={processo?.hprisoes} /> }]
        : []),
      ...(processo && isAdmin ? [{ value: 'Versões', component: <Versoes id={processo?.id} /> }] : []),
      ...(processo && isAdmin
        ? [{ value: 'Visualizações', component: <Views id={processo?.id} isLoading={isLoading} /> }]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const idEstado = (item) => {
    if (item === 'devdop') {
      return processo?.destinos?.find((row) => row?.modo === 'Seguimento' && !row?.nome?.includes('Atendimento'));
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
    if (mail && perfilId && processo?.id && estadoId) {
      dispatch(
        getItem('prevnext', { mail, perfilId, estadoId, processoId: processo?.id, next, estado: processo?.nome })
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
    const errorStd = error?.error || error;
    const noMoreProcess = errorStd?.includes('Sem mais processos disponíveis no estado');
    if (errorStd) {
      if (noMoreProcess && errorStd?.includes('Atendimento')) {
        //
      } else {
        enqueueSnackbar(
          errorStd === 'Processo não encontrado ou Não tem permissão para o vê-lo!'
            ? 'Processo não encontrado ou não tens acesso'
            : errorStd,
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
    if (mail && processo?.origem_id && perfilId) {
      dispatch(getFromParametrizacao('origem', { id: processo?.origem_id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, processo?.origem_id]);

  useEffect(() => {
    if (mail && perfilId && processo?.nome) {
      if (
        (processo?.nome?.includes('Gerência') || processo?.nome?.includes('Caixa Principal')) &&
        idEstado('gerencia')?.id
      ) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('gerencia')?.id }));
      } else if (processo?.nome === 'Devolução AN' && idEstado('devdop')?.id) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('devdop')?.id }));
      } else if (processo?.nome === 'Diário' && idEstado('diario')?.id) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: idEstado('diario')?.id }));
      } else if (estadoId) {
        dispatch(getFromParametrizacao('colaboradoresEstado', { mail, id: estadoId, perfilId }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, perfilId, processo?.nome, estadoId]);

  const handleAceitar = () => {
    const formData = { fluxoID: processo?.fluxo_id, perfilID: perfilId, estadoID: estadoId };
    dispatch(
      updateItem('aceitar', JSON.stringify(formData), {
        mail,
        perfilId,
        processoId: processo?.id,
        msg: 'Processo aceitado',
      })
    );
  };

  const handlePedirAcesso = () => {
    dispatch(updateItem('pedir acesso', '', { perfilId, id: processo?.id, mail, msg: 'Pedido enviado' }));
  };

  const handleDesarquivar = () => {
    dispatch(getAll('destinosDesarquivamento', { mail, processoId: processo?.id }));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleParecer = () => {
    dispatch(selectItem(podeDarParecer(meusAmbientes, processo?.pareceres)));
  };

  useEffect(() => {
    if (currentTab !== selectTab(tabsList, currentTab)) {
      setCurrentTab(tabsList?.[0]?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsList, currentTab]);

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={
            processo
              ? `${processo?.nentrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
                  processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                }`
              : 'Detalhes do processo'
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            {
              name:
                (fromArquivo && 'Arquivos') ||
                (fromEntradas && 'Entradas') ||
                (fromTrabalhados && 'Trabalhados') ||
                (fromPorConcluir && 'Por concluir') ||
                (fromProcurar && 'Pesquisa') ||
                (params?.get?.('from') &&
                  params?.get?.('from')?.charAt(0)?.toUpperCase() + params?.get?.('from')?.slice(1)) ||
                'Processos',
              href: linkNavigate,
            },
            {
              name: processo
                ? `${processo?.nentrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
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
                      {!meusacessos.includes('arquivo-110') && !meusacessos.includes('arquivo-111') && (
                        <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={handlePedirAcesso} />
                      )}
                    </>
                  ) : (
                    <>
                      {processo?.in_paralelo_mode && processoMePertence(meusAmbientes, processo?.estado_atual_id) && (
                        <>
                          <Cancelar
                            processoId={processo?.id}
                            fluxoId={processo?.fluxo_id}
                            estadoId={processo?.estado_atual_id}
                          />
                          <Cancelar
                            cancelar
                            processoId={processo?.id}
                            fluxoId={processo?.fluxo_id}
                            estadoId={processo?.estado_atual_id}
                          />
                        </>
                      )}
                      {!processo?.is_lock && !processo?.in_paralelo_mode && (
                        <>
                          {processo?.pareceres_estado?.length === 0 ? (
                            <>
                              {((processoMePertence(meusAmbientes, processo?.estado_atual_id) &&
                                isResponsavel &&
                                processo?.nome !== 'Diário' &&
                                processo?.nome !== 'Devolução AN' &&
                                !processo?.nome?.includes('Gerência') &&
                                !processo?.nome?.includes('Caixa Principal')) ||
                                isAdmin) && (
                                <AtribuirForm
                                  processoID={processo?.id}
                                  fluxoId={processo?.fluxo_id}
                                  perfilId={processo?.perfil_id}
                                  colaboradoresList={colaboradoresList}
                                />
                              )}
                              {processoMePertence(meusAmbientes, processo?.estado_atual_id) &&
                                (!processo?.perfil_id || processo?.perfil_id === perfilId) && (
                                  <DefaultAction label="ACEITAR" handleClick={handleAceitar} />
                                )}
                            </>
                          ) : (
                            <PareceresEstado
                              normal
                              pareceres={processo?.pareceres_estado}
                              estado={processo?.nome?.replace(' - P/S/P', '')}
                            />
                          )}
                          {!processo.ispendente &&
                            processo?.estado_atual_id !== processo?.htransicoes?.[0]?.estado_inicial_id &&
                            perfilId === processo?.htransicoes?.[0]?.perfil_id &&
                            processoMePertence(meusAmbientes, processo?.htransicoes?.[0]?.estado_inicial_id) && (
                              <Resgatar
                                processoId={processo?.id}
                                fluxoId={processo?.fluxo_id}
                                estadoId={processo?.htransicoes?.[0]?.estado_inicial_id}
                              />
                            )}
                        </>
                      )}
                      {podeDarParecer(meusAmbientes, processo?.pareceres) && (
                        <>
                          <DefaultAction label="PARECER" handleClick={() => handleParecer()} />
                          <ParecerForm open={isOpenModal} onCancel={handleClose} processoId={processo?.id} />
                        </>
                      )}
                      {processo?.is_lock && processo?.perfil_id === perfilId && (
                        <Intervencao colaboradoresList={colaboradoresList} />
                      )}
                      {isResponsavel &&
                        processo?.is_lock &&
                        processo?.perfil_id !== perfilId &&
                        processoMePertence(meusAmbientes, processo?.estado_atual_id) && (
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
