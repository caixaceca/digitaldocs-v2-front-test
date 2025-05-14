import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { getProximoAnterior } from '../../utils/formatObject';
import { pertencoEstadoId, gestorEstado, findColaboradores } from '../../utils/validarAcesso';
// redux
import { useAcesso } from '../../hooks/useAcesso';
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, getInfoProcesso, setModal, deleteItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import { useNotificacao } from '../../hooks/useNotificacao';
import { useProcesso, useIdentificacao } from '../../hooks/useProcesso';
// components
import Page from '../../components/Page';
import { TabCard } from '../../components/TabsWrapper';
import { DefaultAction, Voltar } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import DialogPreviewDoc, { DialogConfirmar } from '../../components/CustomDialog';
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
import {
  AnexosForm,
  EliminarForm,
  AtribuirForm,
  LibertarForm,
  ResgatarForm,
  FocalPointForm,
  DomiciliarForm,
  FinalizarNeForm,
  FinalizarOpeForm,
  ColocarPendenteForm,
} from '../../sections/processo/form/intervencao';
import Intervencao from '../../sections/processo/Intervencao';
import ProcessoForm from '../../sections/processo/form/form-processo';
import { DesarquivarForm } from '../../sections/processo/form/arquivo';

// ----------------------------------------------------------------------

export default function PageProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('Dados gerais');

  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin, isAuditoria, colaboradoresEstado: ce } = useSelector((state) => state.parametrizacao);
  const { processos, done, pdfPreview, selectedItem, isOpenModal, isSaving, isLoadingFile } = useSelector(
    (state) => state.digitaldocs
  );

  const identificador = useIdentificacao({ id });
  const processo = useProcesso({ id, perfilId });
  const { estado = null, credito = null, con = null, status = '' } = processo || {};
  const { estados = [], htransicoes = [], pareceres_estado: pareceres = [] } = processo || {};
  const { fluxo_id: fluxoId = '', valor = '', fluxo = '', titular = '', numero_operacao: numero } = processo || {};

  const proxAnt = getProximoAnterior(processos, id);
  const acessoDesarquivar = useAcesso({ acessos: ['arquivo-111'] }) || isAdmin;
  const estadoId = useMemo(() => estado?.estado_id || '', [estado?.estado_id]);
  const ultimaTransicao = useMemo(() => htransicoes?.[0] || null, [htransicoes]);
  const colaboradoresList = useMemo(() => findColaboradores(colaboradores, ce), [colaboradores, ce]);
  const linkNavigate = useMemo(
    () =>
      (params?.get?.('from') === 'Arquivos' && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
      (params?.get?.('from') === 'Controle' && `${PATH_DIGITALDOCS.controle.lista}`) ||
      (params?.get?.('from') === 'Pesquisa' && `${PATH_DIGITALDOCS.filaTrabalho.procurar}`) ||
      `${PATH_DIGITALDOCS.filaTrabalho.lista}`,
    [params]
  );

  const handleAceitar = useCallback(
    (estadoId, modo) => dispatch(getInfoProcesso('aceitar', { id, estadoId, modo, msg: 'Processo aceitado' })),
    [dispatch, id]
  );

  const tabsList = useMemo(() => {
    const tabs = [];
    tabs.push({ value: 'Dados gerais', component: <DadosGerais /> });

    if (credito)
      tabs.push({
        value: 'Info. crédito',
        component: (
          <InfoCredito dados={{ ...credito, processoId: id, modificar: estado?.preso && estado?.atribuidoAMim }} />
        ),
      });

    if (con) tabs.push({ value: 'Info. CON', component: <InfoCon dados={{ ...con, valor, numero }} /> });

    if (estados?.length > 0) tabs.push({ value: 'Pareceres', component: <Estados handleAceitar={handleAceitar} /> });

    if (estado?.pareceres && estado.pareceres?.length > 0) {
      tabs.push({
        value: 'Pareceres',
        component: (
          <Pareceres
            id={id}
            estado={estado?.estado}
            pareceres={estado.pareceres}
            estadoId={estado?.estado_id}
            assunto={`${fluxo ?? ''} - ${titular ?? ''}`}
          />
        ),
      });
    }

    if (htransicoes?.length > 0) {
      tabs.push({
        value: 'Encaminhamentos',
        component: <Transicoes transicoes={htransicoes} assunto={`${fluxo ?? ''} - ${titular ?? ''}`} />,
      });
    }

    if (processo) {
      tabs.push(
        { value: 'Anexos', component: <TodosAnexos /> },
        { value: 'Retenções', component: <TableDetalhes id={id} item="hretencoes" /> },
        { value: 'Pendências', component: <TableDetalhes id={id} item="hpendencias" /> },
        { value: 'Atribuições', component: <TableDetalhes id={id} item="hatribuicoes" /> }
      );
    }

    // if (htransicoes?.length > 0) {
    //   tabs.push({ value: 'Confidencialidades', component: <TableDetalhes id={id} item="confidencialidades" /> });
    // }

    if (processo && (isAdmin || isAuditoria)) {
      tabs.push({ value: 'Versões', component: <Versoes id={id} /> }, { value: 'Visualizações', component: <Views /> });
    }

    return tabs;
  }, [
    id,
    con,
    fluxo,
    valor,
    estado,
    numero,
    titular,
    credito,
    isAdmin,
    processo,
    htransicoes,
    isAuditoria,
    handleAceitar,
    estados?.length,
  ]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab)) setCurrentTab(tabsList?.[0]?.value);
  }, [tabsList, currentTab]);

  const irParaProcesso = (idProcesso) => {
    navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${idProcesso}`);
  };

  const openModal = (modal, dados) => {
    dispatch(setModal({ modal: modal || '', dados: dados || null }));
  };

  const eliminarAnexo = () => {
    const { id: anexoId, estadoId, entidade } = selectedItem;
    const params = { processoId: id, id: anexoId, estadoId, entidade, onClose: openModal };
    dispatch(deleteItem('anexo', { ...params, msg: 'Anexo eliminado' }));
  };

  useNotificacao({
    done,
    onClose: () => {
      openModal();
      if (
        !done.includes('Anexo') &&
        !done.includes('Stiuação') &&
        !done.includes('Garantia') &&
        done !== 'Processo aceitado' &&
        done !== 'Pareceres fechado' &&
        done !== 'Processo resgatado' &&
        done !== 'Processo adicionado' &&
        done !== 'Processo atualizado' &&
        done !== 'Focal Point alterado' &&
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
                  {status === 'A' ? (
                    <>
                      {acessoDesarquivar && (
                        <DefaultAction
                          label="DESARQUIVAR"
                          onClick={() => {
                            dispatch(setModal({ modal: 'desarquivar', dados: null }));
                            dispatch(getInfoProcesso('destinosDesarquivamento', { id }));
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* EM SÉRIE */}
                      {estado && estados?.length === 0 && (
                        <>
                          {pertencoEstadoId(meusAmbientes, estadoId) && pareceres?.length === 0 && (
                            <>
                              {estado?.preso && estado?.atribuidoAMim && <Intervencao />}
                              {estado?.preso && !estado?.atribuidoAMim && gestorEstado(meusAmbientes, estadoId) && (
                                <DefaultAction
                                  label="LIBERTAR"
                                  onClick={() => openModal('libertar', { id, estadoId, perfilId: estado?.perfil_id })}
                                />
                              )}
                              {!estado?.preso && (!estado?.perfil_id || estado?.atribuidoAMim) && (
                                <DefaultAction label="ACEITAR" onClick={() => handleAceitar(estadoId, 'serie')} />
                              )}
                              {!estado?.preso && gestorEstado(meusAmbientes, estadoId) && (
                                <DefaultAction
                                  label="ATRIBUIR"
                                  onClick={() =>
                                    openModal('atribuir', { estadoId, pid: estado?.perfil_id, processoId: id })
                                  }
                                />
                              )}
                            </>
                          )}
                          {/* Resgatar */}
                          {!!ultimaTransicao &&
                            !estado?.preso &&
                            !estado?.pendente &&
                            !ultimaTransicao?.resgate &&
                            !ultimaTransicao?.pareceres?.length &&
                            perfilId === ultimaTransicao?.perfil_id &&
                            pertencoEstadoId(meusAmbientes, ultimaTransicao?.estado_inicial_id) &&
                            !estado?.pareceres?.some(({ parecer_em: parecer }) => parecer) && (
                              <DefaultAction label="RESGATAR" onClick={() => openModal('resgatar', null)} />
                            )}
                        </>
                      )}

                      {/* EM PARALELO */}
                      {estados?.length > 0 && gestorEstado(meusAmbientes, estadoId) && (
                        <>
                          <DefaultAction label="FOCAL POINT" onClick={() => openModal('focal-point', null)} />
                          <DefaultAction label="RESGATAR" onClick={() => openModal('resgatar', null)} />
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

        {isOpenModal === 'libertar' && <LibertarForm onClose={() => openModal()} />}
        {isOpenModal === 'adicionar-anexo' && <AnexosForm onClose={() => openModal()} />}
        {isOpenModal === 'pendencia' && <ColocarPendenteForm onClose={() => openModal()} />}
        {isOpenModal === 'finalizar-ne' && <FinalizarNeForm onClose={() => openModal()} id={id} />}
        {isOpenModal === 'finalizar-ope' && <FinalizarOpeForm onClose={() => openModal()} id={id} />}
        {isOpenModal === 'domiciliar' && <DomiciliarForm ids={{ id, fluxoId }} onClose={() => openModal()} />}
        {isOpenModal === 'focal-point' && <FocalPointForm ids={{ id, fluxoId }} onClose={() => openModal()} />}
        {isOpenModal === 'editar-processo' && <ProcessoForm isEdit processo={processo} ambientId={estadoId} />}
        {isOpenModal === 'eliminar-processo' && <EliminarForm ids={{ id, estadoId }} onClose={() => openModal()} />}
        {isOpenModal === 'atribuir' && <AtribuirForm colaboradores={colaboradoresList} onClose={() => openModal()} />}
        {isOpenModal === 'desarquivar' && (
          <DesarquivarForm id={id} colaboradores={colaboradoresList} onClose={() => openModal()} />
        )}
        {isOpenModal === 'resgatar' && (
          <ResgatarForm
            onClose={() => openModal()}
            dados={{ id, fluxoId, estadoId: estados?.length > 0 ? estadoId : ultimaTransicao?.estado_inicial_id }}
          />
        )}
        {isOpenModal === 'eliminar-anexo' && (
          <DialogConfirmar
            isSaving={isSaving}
            handleOk={eliminarAnexo}
            desc="eliminar este anexo"
            onClose={() => openModal()}
          />
        )}
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
