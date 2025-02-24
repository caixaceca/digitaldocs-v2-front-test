import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { getProximoAnterior } from '../../utils/formatObject';
import { findColaboradores, pertencoEstadoId, gestorEstado } from '../../utils/validarAcesso';
// redux
import { useAcesso } from '../../hooks/useAcesso';
import { updateItem } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import { useNotificacao } from '../../hooks/useNotificacao';
import { useProcesso, useIdentificacao } from '../../hooks/useProcesso';
// components
import Page from '../../components/Page';
import { TabCard } from '../../components/TabsWrapper';
import { DefaultAction } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import {
  Views,
  Estados,
  Versoes,
  Pareceres,
  Transicoes,
  DadosGerais,
  TableDetalhes,
} from '../../sections/processo/Detalhes';
import Intervencao, { Libertar, Atribuir, Resgatar, Cancelar, Desarquivar } from '../../sections/processo/Intervencao';

// ----------------------------------------------------------------------

export default function PageProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { processos, done, isSaving, isLoading } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, isAdmin, isAuditoria, colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const acessoDesarquivar = useAcesso({ acessos: ['arquivo-111'] }) || isAdmin;
  const linkNavigate = useMemo(
    () =>
      (params?.get?.('from') === 'Arquivos' && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
      (params?.get?.('from') === 'Controle' && `${PATH_DIGITALDOCS.controle.lista}`) ||
      (params?.get?.('from') === 'Pesquisa' && `${PATH_DIGITALDOCS.filaTrabalho.procurar}`) ||
      `${PATH_DIGITALDOCS.filaTrabalho.lista}`,
    [params]
  );

  const identificador = useIdentificacao({ id });
  const processo = useProcesso({ id, perfilId });
  const proxAnt = getProximoAnterior(processos, processo?.id);
  const fluxoId = useMemo(() => processo?.fluxo_id || '', [processo?.fluxo_id]);
  const estado = useMemo(() => processo?.estado_processo || null, [processo?.estado_processo]);
  const ultimaTransicao = useMemo(() => processo?.htransicoes?.[0] || null, [processo?.htransicoes]);
  const estadoId = useMemo(() => processo?.estado_processo?.estado_id || '', [processo?.estado_processo?.estado_id]);

  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const handleAceitar = useCallback(
    (estadoId, modo) =>
      dispatch(updateItem('aceitar', null, { id, fluxoId, estadoId, modo, msg: 'Processo aceitado' })),
    [dispatch, fluxoId, id]
  );

  const tabsList = useMemo(() => {
    const tabs = [];
    tabs.push({ value: 'Dados gerais', component: <DadosGerais /> });

    if (processo?.estados && processo.estados?.length > 0)
      tabs.push({ value: 'Pareceres', component: <Estados handleAceitar={handleAceitar} /> });

    if (estado?.pareceres && estado.pareceres?.length > 0) {
      tabs.push({
        value: 'Pareceres',
        component: (
          <Pareceres
            id={id}
            estado={estado?.estado}
            pareceres={estado.pareceres}
            estadoId={estado?.estado_id}
            assunto={`${processo.assunto} - ${processo.titular}`}
          />
        ),
      });
    }

    if (processo?.htransicoes && processo.htransicoes?.length > 0) {
      tabs.push({
        value: 'Transições',
        component: (
          <Transicoes transicoes={processo.htransicoes} assunto={`${processo.assunto} - ${processo.titular}`} />
        ),
      });
    }

    if (processo) {
      tabs.push(
        { value: 'Retenções', component: <TableDetalhes id={id} item="hretencoes" /> },
        { value: 'Pendências', component: <TableDetalhes id={id} item="hpendencias" /> },
        { value: 'Atribuições', component: <TableDetalhes id={id} item="hatribuicoes" /> },
        { value: 'Confidencialidades', component: <TableDetalhes id={id} item="confidencialidades" /> }
      );
    }

    if (processo && (isAdmin || isAuditoria)) {
      tabs.push(
        { value: 'Versões', component: <Versoes id={id} /> },
        { value: 'Visualizações', component: <Views id={id} isLoading={isLoading} /> }
      );
    }

    return tabs;
  }, [id, isAdmin, isAuditoria, processo, estado, isLoading, handleAceitar]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) setCurrentTab(tabsList?.[0]?.value);
  }, [tabsList, currentTab]);

  const irParaProcesso = (idProcesso) => {
    navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${idProcesso}`);
  };

  useNotificacao({
    done,
    afterSuccess: () => {
      if (
        done !== 'Processo aceitado' &&
        done !== 'Pareceres fechado' &&
        done !== 'Processo resgatado' &&
        done !== 'Confidencialidade atualizado'
      ) {
        console.log(done);
      } else if (proxAnt?.proximo) {
        irParaProcesso(proxAnt?.proximo);
      } else {
        navigate(linkNavigate);
      }
    },
  });

  return (
    <Page title="Processo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={identificador}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: params?.get?.('from') || 'Processos', href: linkNavigate },
            { name: identificador },
          ]}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center">
              {processo && (
                <Stack spacing={0.5} direction={{ xs: 'row' }}>
                  {proxAnt?.anterior && (
                    <DefaultAction label="ANTERIOR" handleClick={() => irParaProcesso(proxAnt?.anterior)} />
                  )}
                  {proxAnt?.proximo && (
                    <DefaultAction label="PRÓXIMO" handleClick={() => irParaProcesso(proxAnt?.proximo)} />
                  )}
                  {processo?.status === 'Arquivado' ? (
                    <>{acessoDesarquivar && <Desarquivar id={id} colaboradoresList={colaboradoresList} />}</>
                  ) : (
                    <>
                      {/* Transição em série */}
                      {estado && processo?.estados?.length === 0 && (
                        <>
                          {/* Aceitar/Atribuir/Intervir */}
                          {pertencoEstadoId(meusAmbientes, estadoId) && processo?.pareceres_estado?.length === 0 && (
                            <>
                              {estado?._lock && processo?.atribuidoAMim && (
                                <Intervencao colaboradoresList={colaboradoresList} />
                              )}
                              {!processo?.atribuidoAMim && estado?._lock && gestorEstado(meusAmbientes, estadoId) && (
                                <Libertar dados={{ id, fluxoId, estadoId }} isSaving={isSaving} />
                              )}
                              {!estado?._lock && (!processo?.perfilAtribuido || processo?.atribuidoAMim) && (
                                <DefaultAction label="ACEITAR" handleClick={() => handleAceitar(estadoId, 'serie')} />
                              )}
                              {!estado?._lock && gestorEstado(meusAmbientes, estadoId) && (
                                <Atribuir
                                  dados={{ fluxoId, estadoId, perfilIdA: processo?.perfilAtribuido, processoId: id }}
                                />
                              )}
                            </>
                          )}
                          {/* Resgatar */}
                          {!!ultimaTransicao &&
                            !estado?._lock &&
                            !processo?.pendente &&
                            !ultimaTransicao?.resgate &&
                            perfilId === ultimaTransicao?.perfil_id &&
                            pertencoEstadoId(meusAmbientes, ultimaTransicao?.estado_inicial_id) &&
                            (!ultimaTransicao?.pareceres || ultimaTransicao?.pareceres?.length === 0) &&
                            (!estado?.pareceres || !estado?.pareceres?.find((row) => row?.parecer_em)) && (
                              <Resgatar dados={{ id, fluxoId, estadoId: ultimaTransicao?.estado_inicial_id }} />
                            )}
                        </>
                      )}

                      {/* Transição em paralelo */}
                      {processo?.estados?.length > 0 && pertencoEstadoId(meusAmbientes, estadoId) && (
                        <>
                          {estado?._lock && processo?.atribuidoAMim && (
                            <>
                              <Libertar dados={{ id, fluxoId, estadoId }} isSaving={isSaving} />
                              {processo?.estados?.find((row) => row?.parecer_em) ? (
                                <Cancelar id={id} estadoId={estadoId} fechar />
                              ) : (
                                <Cancelar id={id} estadoId={estadoId} />
                              )}
                            </>
                          )}
                          {!estado?._lock && (
                            <DefaultAction label="ACEITAR" handleClick={() => handleAceitar(estadoId, 'serie')} />
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
          <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
        </Card>
      </Container>
    </Page>
  );
}
