import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { getProximoAnterior } from '../../utils/formatObject';
import { pertencoEstadoId, gestorEstado } from '../../utils/validarAcesso';
// redux
import { useAcesso } from '../../hooks/useAcesso';
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, getInfoProcesso } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import { useNotificacao } from '../../hooks/useNotificacao';
import { useProcesso, useIdentificacao } from '../../hooks/useProcesso';
// components
import Page from '../../components/Page';
import { TabCard } from '../../components/TabsWrapper';
import DialogPreviewDoc from '../../components/CustomDialog';
import { DefaultAction, Voltar } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import {
  Views,
  Estados,
  Versoes,
  InfoCon,
  Pareceres,
  Transicoes,
  DadosGerais,
  InfoCredito,
  TodosAnexos,
  TableDetalhes,
} from '../../sections/processo/Detalhes';
import ProcessoForm from '../../sections/processo/form/form-processo';
import Intervencao, { Libertar, Atribuir, Resgatar, Cancelar, Desarquivar } from '../../sections/processo/Intervencao';

// ----------------------------------------------------------------------

export default function PageProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('Dados gerais');

  const { perfilId } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);
  const { processos, done, pdfPreview, isOpenModal, isLoadingFile } = useSelector((state) => state.digitaldocs);
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

  const handleAceitar = useCallback(
    (estadoId, modo) => dispatch(getInfoProcesso('aceitar', { id, estadoId, modo, msg: 'Processo aceitado' })),
    [dispatch, id]
  );

  const tabsList = useMemo(() => {
    const tabs = [];
    tabs.push({ value: 'Dados gerais', component: <DadosGerais /> });

    if (processo?.credito)
      tabs.push({
        value: 'Info. crédito',
        component: (
          <InfoCredito
            dados={{ ...processo.credito, processoId: id, modificar: estado?.is_lock && processo?.atribuidoAMim }}
          />
        ),
      });

    if (processo?.con)
      tabs.push({
        value: 'Info. CON',
        component: <InfoCon dados={processo?.con} valor={processo?.valor} numero={processo?.numero_operacao} />,
      });

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
        { value: 'Anexos', component: <TodosAnexos /> },
        { value: 'Retenções', component: <TableDetalhes id={id} item="hretencoes" /> },
        { value: 'Pendências', component: <TableDetalhes id={id} item="hpendencias" /> },
        { value: 'Atribuições', component: <TableDetalhes id={id} item="hatribuicoes" /> },
        { value: 'Confidencialidades', component: <TableDetalhes id={id} item="confidencialidades" /> }
      );
    }

    if (processo && (isAdmin || isAuditoria)) {
      tabs.push({ value: 'Versões', component: <Versoes id={id} /> }, { value: 'Visualizações', component: <Views /> });
    }

    return tabs;
  }, [id, isAdmin, isAuditoria, processo, estado, handleAceitar]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab)) setCurrentTab(tabsList?.[0]?.value);
  }, [tabsList, currentTab]);

  const irParaProcesso = (idProcesso) => {
    navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${idProcesso}`);
  };

  useNotificacao({
    done,
    afterSuccess: () => {
      if (
        !done.includes('Stiuação') &&
        !done.includes('Garantia') &&
        done !== 'Anexo eliminado' &&
        done !== 'Processo aceitado' &&
        done !== 'Pareceres fechado' &&
        done !== 'Processo resgatado' &&
        done !== 'Processo adicionado' &&
        done !== 'Processo atualizado' &&
        done !== 'Confidencialidade atualizado'
      ) {
        if (proxAnt?.proximo) irParaProcesso(proxAnt?.proximo);
        else navigate(linkNavigate);
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Voltar fab />
              {processo && (
                <Stack spacing={0.5} direction={{ xs: 'row' }}>
                  {processo?.status === 'Arquivado' ? (
                    <>{acessoDesarquivar ? <Desarquivar id={id} /> : ''}</>
                  ) : (
                    <>
                      {/* EM SÉRIE */}
                      {estado && processo?.estados?.length === 0 && (
                        <>
                          {pertencoEstadoId(meusAmbientes, estadoId) && processo?.pareceres_estado?.length === 0 && (
                            <>
                              {estado?.is_lock && processo?.atribuidoAMim && <Intervencao />}
                              {estado?.is_lock && !processo?.atribuidoAMim && gestorEstado(meusAmbientes, estadoId) && (
                                <Libertar dados={{ id, estadoId }} />
                              )}
                              {!estado?.is_lock && (!processo?.perfilAtribuido || processo?.atribuidoAMim) && (
                                <DefaultAction label="ACEITAR" onClick={() => handleAceitar(estadoId, 'serie')} />
                              )}
                              {!estado?.is_lock && gestorEstado(meusAmbientes, estadoId) && (
                                <Atribuir dados={{ estadoId, perfilIdA: processo?.perfilAtribuido, processoId: id }} />
                              )}
                            </>
                          )}
                          {/* Resgatar */}
                          {!!ultimaTransicao &&
                            !estado?.is_lock &&
                            !processo?.pendente &&
                            !ultimaTransicao?.resgate &&
                            !ultimaTransicao?.pareceres?.length &&
                            perfilId === ultimaTransicao?.perfil_id &&
                            pertencoEstadoId(meusAmbientes, ultimaTransicao?.estado_inicial_id) &&
                            !estado?.pareceres?.some(({ parecer_em: parecer }) => parecer) && (
                              <Resgatar dados={{ id, fluxoId, estadoId: ultimaTransicao?.estado_inicial_id }} />
                            )}
                        </>
                      )}

                      {/* EM PARALELO */}
                      {processo?.estados?.length > 0 && pertencoEstadoId(meusAmbientes, estadoId) && (
                        <>
                          {estado?.is_lock && processo?.atribuidoAMim && (
                            <>
                              <Libertar dados={{ id, estadoId }} />
                              {processo?.estados?.find(({ parecer_em: parecer }) => parecer) ? (
                                <Cancelar id={id} estadoId={estadoId} fechar />
                              ) : (
                                <Cancelar id={id} estadoId={estadoId} />
                              )}
                            </>
                          )}
                          {!estado?.is_lock && (
                            <DefaultAction label="ACEITAR" onClick={() => handleAceitar(estadoId, 'serie')} />
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
        <Card>
          <TabCard tabs={tabsList} tipo={currentTab} setTipo={setCurrentTab} />
          <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
        </Card>

        {(proxAnt?.anterior || proxAnt?.proximo) && (
          <Stack direction="row" spacing={3} justifyContent="space-between" sx={{ mt: 3 }}>
            <DefaultAction
              small
              button
              label="Anterior"
              disabled={!proxAnt?.anterior}
              onClick={() => irParaProcesso(proxAnt?.anterior)}
            />
            <DefaultAction
              small
              button
              label="Próximo"
              disabled={!proxAnt?.proximo}
              onClick={() => irParaProcesso(proxAnt?.proximo)}
            />
          </Stack>
        )}

        {isOpenModal === 'editar-processo' && <ProcessoForm processo={processo} ambientId={estadoId} />}

        {pdfPreview && (
          <DialogPreviewDoc
            onClose={() => dispatch(getSuccess({ item: 'pdfPreview', dados: null }))}
            params={{ url: pdfPreview?.url, titulo: pdfPreview?.nome, isLoading: !!isLoadingFile }}
          />
        )}
      </Container>
    </Page>
  );
}
