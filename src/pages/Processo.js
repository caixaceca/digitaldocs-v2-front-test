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
  naGerencia,
  temNomeacao,
  isResponsavelUo,
  findColaboradores,
  processoMePertence,
} from '../utils/validarAcesso';
import { fYear } from '../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { parecerEstadoSuccess } from '../redux/slices/cc';
import { getAll, getItem, closeModal, updateItem } from '../redux/slices/digitaldocs';
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
import AtribuirAcessoForm from '../sections/arquivo/AtribuirAcessoForm';
import Intervencao, { Libertar } from '../sections/processo/Intervencao';
import { DesarquivarForm, Resgatar, Cancelar, AtribuirForm } from '../sections/processo/form/IntervencaoForm';
import { Views, Versoes, Pareceres, Transicoes, DadosGerais, TableDetalhes } from '../sections/processo/Detalhes';
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
  const { processo, done, error } = useSelector((state) => state.digitaldocs);
  const { mail, uos, cc, colaboradores } = useSelector((state) => state.intranet);
  const { meusacessos, meusAmbientes, isGerente, isAdmin, auditoriaProcesso, colaboradoresEstado } = useSelector(
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
  const uoOrigem = uos?.find((row) => row?.id === processo?.uo_origem_id);
  const estadoAtual = meusAmbientes?.find((row) => row?.id === estadoId);
  const isResponsavel = temNomeacao(cc) || isResponsavelUo(uo, mail) || isGerente;
  const inGerencia = naGerencia(estado);

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
      done === 'Anexo eliminado' ||
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
    if (mail && processo?.id) {
      dispatch(getAll('htransicoes', { id: processo?.id, mail, perfilId }));
    }
  }, [dispatch, mail, perfilId, processo?.id]);

  const handleAceitar = () => {
    dispatch(updateItem('aceitar', null, { mail, fluxoId, perfilId, estadoId, id, msg: 'Processo aceitado' }));
  };

  const handlePedirAcesso = () => {
    dispatch(updateItem('pedir acesso', '', { perfilId, id, mail, msg: 'Pedido enviado' }));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

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
                  {processo?.status === 'Arquivado' ? (
                    <>
                      <RoleBasedGuard roles={['arquivo-110', 'arquivo-111']}>
                        <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={onOpen} />
                        <DesarquivarForm id={id} onCancel={handleClose} colaboradoresList={colaboradoresList} />
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
                          {processo?.pareceres_estado?.length === 0 && (
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
