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
import { canPreview } from '../utils/getFileFormat';
import { temAcesso, findColaboradores, pertencoEstadoId, gestorEstado } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getAll, getProcesso, getAnexo, updateItem } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
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
  Atribuir,
  Resgatar,
  Cancelar,
  Abandonar,
  Restaurar,
  Desarquivar,
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
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { mail, uos, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { processo, done, error, isSaving, isLoading } = useSelector((state) => state.digitaldocs);
  const { meusacessos, meusAmbientes, isAdmin, auditoriaProcesso, colaboradoresEstado } = useSelector(
    (state) => state.parametrizacao
  );
  const historico = useMemo(
    () => params?.get('from') === 'Pesquisa' && localStorage.getItem('procHistorico') === 'true',
    [params]
  );

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getProcesso('processo', { id, mail, perfilId, historico }));
    }
  }, [dispatch, perfilId, mail, historico, id]);

  const fluxoId = useMemo(() => processo?.fluxo_id, [processo?.fluxo_id]);
  const ultimaTransicao = useMemo(() => processo?.htransicoes?.[0], [processo?.htransicoes]);
  const estadoId = useMemo(() => processo?.estado_processo?.estado_id || '', [processo?.estado_processo?.estado_id]);
  const uoOrigem = useMemo(() => uos?.find((row) => row?.id === processo?.uo_origem_id), [processo?.uo_origem_id, uos]);
  const perfilEstado = useMemo(
    () => processo?.estado_processo?.perfil_id || '',
    [processo?.estado_processo?.perfil_id]
  );

  const podeVerProxAnt = useMemo(
    () => !!estadoId && meusAmbientes?.find((row) => row?.id === estadoId),
    [meusAmbientes, estadoId]
  );

  const linkNavigate = useMemo(
    () =>
      (params?.get?.('from') === 'Arquivos' && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
      (params?.get?.('from') === 'Controle' && `${PATH_DIGITALDOCS.controle.lista}`) ||
      (params?.get?.('from') === 'Pesquisa' && `${PATH_DIGITALDOCS.processos.procurar}`) ||
      `${PATH_DIGITALDOCS.processos.lista}`,
    [params]
  );

  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const tabsList = useMemo(
    () => [
      { value: 'Dados gerais', component: <DadosGerais /> },
      ...(processo && processo?.estados?.length > 0
        ? [{ value: 'Pareceres', component: <Estados handleAceitar={handleAceitar} /> }]
        : []),
      ...(processo && processo?.estado_processo?.pareceres?.length > 0
        ? [
            {
              value: 'Pareceres',
              component: (
                <Pareceres
                  id={id}
                  estado={processo?.estado_processo?.estado}
                  estadoId={processo?.estado_processo?.estado_id}
                  pareceres={processo?.estado_processo?.pareceres}
                  assunto={`${processo?.assunto} - ${processo?.titular}`}
                />
              ),
            },
          ]
        : []),
      ...(processo && processo?.htransicoes?.length > 0
        ? [
            {
              value: 'Transições',
              component: (
                <Transicoes
                  transicoes={processo?.htransicoes}
                  assunto={`${processo?.assunto} - ${processo?.titular}`}
                />
              ),
            },
          ]
        : []),
      ...(processo && !historico
        ? [
            { value: 'Retenções', component: <TableDetalhes id={processo?.id} item="hretencoes" /> },
            { value: 'Pendências', component: <TableDetalhes id={processo?.id} item="hpendencias" /> },
            { value: 'Atribuições', component: <TableDetalhes id={processo?.id} item="hatribuicoes" /> },
          ]
        : []),
      ...(processo && !historico && (isAdmin || auditoriaProcesso)
        ? [{ value: 'Versões', component: <Versoes id={id} /> }]
        : []),
      ...(processo && !historico && (isAdmin || auditoriaProcesso)
        ? [{ value: 'Visualizações', component: <Views id={id} isLoading={isLoading} /> }]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, isAdmin, auditoriaProcesso, processo]
  );

  useEffect(() => {
    const anexoPreview = processo?.anexos?.filter((item) => item?.ativo)?.find((row) => !!canPreview(row));
    if (anexoPreview) {
      dispatch(getAnexo('filePreview', { mail, perfilId, anexo: { ...anexoPreview, tipo: canPreview(anexoPreview) } }));
    }
  }, [dispatch, mail, perfilId, processo?.anexos]);

  const proximoAnterior = (next) => {
    if (mail && perfilId && id && estadoId) {
      dispatch(
        getProcesso('prevnext', { mail, next, perfilId, estadoId, processoId: id, estado: processo?.estado_atual })
      );
    } else {
      navigate(linkNavigate);
    }
  };

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
    }
    if (
      done === 'Processo arquivado' ||
      done === 'Processo devolvido' ||
      done === 'Pendência eliminada' ||
      done === 'Processo finalizado' ||
      done === 'Processo encaminhado' ||
      done === 'Processo colocado pendente'
    ) {
      proximoAnterior('true');
      setCurrentTab('Dados gerais');
    }
    if (
      done === 'Parecer enviado' ||
      done === 'Processo atribuído' ||
      done === 'Processo abandonado' ||
      done === 'Processo domiciliado' ||
      done === 'Atribuição eliminada' ||
      done === 'Processo desarquivado'
    ) {
      navigate(linkNavigate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error && typeof error === 'string') {
      const noMoreProcess = error?.includes('Sem mais processos disponíveis no estado');
      if (noMoreProcess && error?.includes('Atendimento')) {
        //
      } else {
        enqueueSnackbar(error, { variant: noMoreProcess ? 'info' : 'error' });
      }
      if (noMoreProcess) {
        navigate(linkNavigate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (mail && processo?.id && !historico) {
      dispatch(getAll('htransicoes', { id: processo?.id, mail, perfilId }));
    }
  }, [dispatch, mail, perfilId, historico, processo?.id]);

  useEffect(() => {
    if (mail && processo?.estado_processo?._lock && estadoId && perfilEstado === perfilId) {
      dispatch(getAll('destinos', { id, mail, perfilId, estadoId }));
    }
  }, [dispatch, estadoId, id, mail, perfilId, perfilEstado, processo?.estado_processo]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) {
      setCurrentTab(tabsList?.[0]?.value);
    }
  }, [tabsList, currentTab]);

  const handleAceitar = (estadoId, modo) => {
    dispatch(updateItem('aceitar', null, { mail, id, fluxoId, perfilId, estadoId, modo, msg: 'Processo aceitado' }));
  };

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={
            processo
              ? `Info. do processo: ${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
                  processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                }`
              : 'Info. do processo'
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: params?.get?.('from') || 'Processos', href: linkNavigate },
            {
              name: processo
                ? `${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
                    processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                  }`
                : 'Info. do processo',
            },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={0.5} direction={{ xs: 'row' }}>
                  {!!podeVerProxAnt &&
                    ['ANTERIOR', 'PRÓXIMO']?.map((row) => (
                      <DefaultAction
                        key={row}
                        icon={row}
                        color="inherit"
                        label={`${row} (${podeVerProxAnt?.nome})`}
                        handleClick={() => proximoAnterior(row === 'PRÓXIMO' ? 'true' : 'false')}
                      />
                    ))}
                  {processo?.status === 'Arquivado' ? (
                    <>
                      {(processo?.historico && isAdmin && <Restaurar id={id} />) ||
                        (!processo?.historico && temAcesso(['arquivo-110', 'arquivo-111'], meusacessos) && (
                          <Desarquivar id={id} colaboradoresList={colaboradoresList} />
                        ))}
                    </>
                  ) : (
                    <>
                      {/* Transição em série */}
                      {processo?.estado_processo && processo?.estados?.length === 0 && (
                        <>
                          {/* Aceitar/Atribuir/Intervir */}
                          {pertencoEstadoId(meusAmbientes, estadoId) && processo?.pareceres_estado?.length === 0 && (
                            <>
                              {processo?.estado_processo?._lock && perfilEstado === perfilId ? (
                                <Intervencao colaboradoresList={colaboradoresList} />
                              ) : (
                                <>
                                  {!processo?.estado_processo?._lock &&
                                    (!perfilEstado || perfilEstado === perfilId) && (
                                      <DefaultAction
                                        label="ACEITAR"
                                        handleClick={() => handleAceitar(estadoId, 'serie')}
                                      />
                                    )}
                                  {!processo?.estado_processo?._lock && gestorEstado(meusAmbientes, estadoId) && (
                                    <Atribuir
                                      dados={{ fluxoId, estadoId, perfilIdA: perfilEstado, processoId: processo?.id }}
                                    />
                                  )}
                                </>
                              )}
                            </>
                          )}
                          {/* Resgatar */}
                          {ultimaTransicao &&
                            !processo?.pendente &&
                            !ultimaTransicao?.resgate &&
                            !processo?.estado_processo?._lock &&
                            perfilId === ultimaTransicao?.perfil_id &&
                            pertencoEstadoId(meusAmbientes, ultimaTransicao?.estado_inicial_id) &&
                            (!ultimaTransicao?.pareceres || ultimaTransicao?.pareceres?.length === 0) &&
                            (!processo?.estado_processo?.pareceres ||
                              !processo?.estado_processo?.pareceres?.find((row) => row?.parecer_em)) && (
                              <Resgatar
                                processoId={id}
                                fluxoId={fluxoId}
                                estadoId={ultimaTransicao?.estado_inicial_id}
                              />
                            )}
                        </>
                      )}

                      {/* Transição em paralelo */}
                      {processo?.estados?.length > 0 && (
                        <>
                          {pertencoEstadoId(meusAmbientes, estadoId) && (
                            <>
                              {processo?.estado_processo?._lock && perfilEstado === perfilId && (
                                <>
                                  <Abandonar
                                    id={processo?.id}
                                    fluxoId={fluxoId}
                                    isSaving={isSaving}
                                    estadoId={estadoId}
                                  />
                                  {processo?.estados?.find((row) => row?.parecer_em) ? (
                                    <Cancelar id={id} estadoId={estadoId} fechar />
                                  ) : (
                                    <Cancelar id={id} estadoId={estadoId} />
                                  )}
                                </>
                              )}
                              {!processo?.estado_processo?._lock && (
                                <DefaultAction label="ACEITAR" handleClick={() => handleAceitar(estadoId, 'serie')} />
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
