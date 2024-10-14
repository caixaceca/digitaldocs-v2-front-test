import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { pertencoEstadoId, gestorEstado } from '../utils/validarAcesso';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// hooks
import { getComparator, applySort } from '../hooks/useTable';
import useToggle, { useToggle1, useToggle2 } from '../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromCC, updateItemCC } from '../redux/slices/cc';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
// components
import Page from '../components/Page';
import { TabCard } from '../components/TabsWrapper';
import { DialogConfirmar } from '../components/CustomDialog';
import { Notificacao } from '../components/NotistackProvider';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { UpdateItem, DefaultAction } from '../components/Actions';
// sections
import { Views, Transicoes } from '../sections/processo/Detalhes';
import { EncaminharForm } from '../sections/credito-colaborador/Form/IntervencaoForm';
import { Atribuir, ColocarPendente, Abandonar } from '../sections/processo/Intervencao';
import { Anexos, DadosGerais, TableDetalhes, EntidadesGarantias } from '../sections/credito-colaborador/Detalhes';

// ----------------------------------------------------------------------

export default function CreditoColaborador() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { pedidoCC, done, error, isLoading, isSaving } = useSelector((state) => state.cc);
  const destinosList = useMemo(
    () => ({
      seguimentos:
        pedidoCC?.destinos
          ?.filter((item) => item.modo === 'Seguimento')
          ?.map((row) => ({
            modo: row.modo,
            id: row.transicao_id,
            estado_final_id: row.estado_id,
            label: `${row?.modo} para ${row?.nome}`,
          })) || [],
      devolucoes:
        pedidoCC?.destinos
          ?.filter((item) => item.modo !== 'Seguimento')
          ?.map((row) => ({
            modo: row.modo,
            id: row.transicao_id,
            estado_final_id: row.estado_id,
            label: `${row?.modo} para ${row?.nome}`,
          })) || [],
    }),
    [pedidoCC?.destinos]
  );

  const fromArquivo = params?.get?.('from') === 'arquivo';
  const fromProcurar = params?.get?.('from') === 'Pesquisa';
  const fromControle = params?.get?.('from') === 'Controle';
  const linkNavigate =
    (fromProcurar && `${PATH_DIGITALDOCS.processos.procurar}`) ||
    (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
    (fromControle && `${PATH_DIGITALDOCS.controle.lista}`) ||
    `${PATH_DIGITALDOCS.processos.lista}`;

  const navigateToProcess = () => {
    if (
      done === 'Processo arquivado' ||
      done === 'Processo atribuído' ||
      done === 'Processo abandonado' ||
      done === 'Atribuição eliminada' ||
      done === 'Processo encaminhado' ||
      done === 'Processo adicionado a listagem de pendentes'
    ) {
      navigate(linkNavigate);
    }
  };

  const tabsList = useMemo(
    () => [
      { value: 'Dados gerais', component: <DadosGerais processo={pedidoCC} /> },
      ...(pedidoCC?.entidades?.length > 0
        ? [{ value: 'Entidades', component: <EntidadesGarantias item="entidades" dados={pedidoCC?.entidades} /> }]
        : []),
      {
        value: 'Anexos',
        component: (
          <Anexos
            item="anexos"
            anexos={[
              { designacao: 'CCRD.FM.P.001.00', ativo: true, anexo: 'anexo.pdf', criador: 'Gerado pelo sistema' },
              { designacao: 'CCRD.FM.P.003.00', ativo: true, anexo: 'anexo.pdf', criador: 'Gerado pelo sistema' },
              ...(pedidoCC?.anexos || []),
            ]}
          />
        ),
      },
      ...(pedidoCC?.garantias?.length > 0
        ? [
            {
              value: 'Garantias',
              component: (
                <EntidadesGarantias
                  item="garantias"
                  dados={applySort(pedidoCC?.garantias, getComparator('desc', 'ativo'))}
                />
              ),
            },
          ]
        : []),
      ...(pedidoCC?.despesas?.length > 0 ? [{ value: 'Despesas', component: <TableDetalhes item="despesas" /> }] : []),
      ...(pedidoCC?.outros_creditos?.length > 0
        ? [{ value: 'Responsabilidades', component: <TableDetalhes item="responsabilidades" /> }]
        : []),
      ...(pedidoCC && pedidoCC?.htransicoes?.length > 0
        ? [
            {
              value: 'Transições',
              component: (
                <Transicoes
                  transicoes={pedidoCC?.htransicoes}
                  assunto={`${pedidoCC?.assunto} - ${pedidoCC?.titular}`}
                />
              ),
            },
          ]
        : []),
      ...(pedidoCC
        ? [
            { value: 'Retenções', component: <TableDetalhes item="hretencoes" /> },
            { value: 'Atribuições', component: <TableDetalhes item="hatribuicoes" /> },
            { value: 'Pendências', component: <TableDetalhes item="hpendencias" /> },
            { value: 'Visualizações', component: <Views id={pedidoCC?.id} from="cc" isLoading={isLoading} /> },
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pedidoCC]
  );

  const handleEdit = () => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${id}/editar`);
  };

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getFromCC('pedido cc', { id, perfilId, mail }));
    }
  }, [dispatch, id, perfilId, mail]);

  useEffect(() => {
    if (mail && pedidoCC?.id) {
      dispatch(getFromCC('htransicoes', { mail, id: pedidoCC?.id }));
    }
  }, [dispatch, pedidoCC?.id, mail]);

  useEffect(() => {
    if (mail && id && pedidoCC?.preso && pedidoCC?.perfil_id === perfilId) {
      dispatch(getFromCC('destinos', { id, perfilId, mail }));
    }
  }, [dispatch, id, perfilId, mail, pedidoCC?.preso, pedidoCC?.perfil_id]);

  useEffect(() => {
    if (mail && podeAtribuir() && pedidoCC?.ultimo_estado_id && perfilId) {
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, id: pedidoCC?.ultimo_estado_id, perfilId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, pedidoCC]);

  const handleAceitar = () => {
    dispatch(
      updateItemCC(
        'aceitar',
        JSON.stringify({ perfilID: perfilId, fluxoID: pedidoCC?.fluxo_id, estadoID: pedidoCC?.ultimo_estado_id }),
        { id, perfilId, mail, msg: 'Processo aceitado' }
      )
    );
  };

  const handleResgatar = () => {
    dispatch(
      updateItemCC(
        'resgatar',
        JSON.stringify({ perfil_id: perfilId, fluxo_id: pedidoCC?.fluxo_id, estado_id: pedidoCC?.ultimo_estado_id }),
        { id: pedidoCC?.id, perfilId, mail, msg: 'Processo resgatado' }
      )
    );
    onClose();
  };

  function podeAtribuir() {
    return (
      !pedidoCC?.preso &&
      pertencoEstadoId(meusAmbientes, pedidoCC?.ultimo_estado_id) &&
      gestorEstado(meusAmbientes, pedidoCC?.ultimo_estado_id)
    );
  }

  return (
    <Page title="Detalhes do pedido">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={navigateToProcess} />
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading="Detalhes do pedido de crédito"
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            {
              name:
                (fromArquivo && 'Arquivos') ||
                (fromControle && 'Controle') ||
                (fromProcurar && 'Pesquisa') ||
                (params?.get?.('from') &&
                  params?.get?.('from')?.charAt(0)?.toUpperCase() + params?.get?.('from')?.slice(1)) ||
                'Processos',
              href: linkNavigate,
            },
            { name: 'Detalhes do pedido' },
          ]}
          action={
            pedidoCC && (
              <Stack direction="row" spacing={0.5}>
                {!pedidoCC?.preso && pedidoCC?.ultimo_estado !== 'Arquivo' && (
                  <>
                    {pertencoEstadoId(meusAmbientes, pedidoCC?.ultimo_estado_id) &&
                      (!pedidoCC?.afeto || (pedidoCC?.afeto && pedidoCC?.estados?.[0]?.perfil_id === perfilId)) &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && (
                        <DefaultAction label="ACEITAR" handleClick={handleAceitar} />
                      )}
                    {!pedidoCC?.pendente && pedidoCC?.estados?.length === 1 && (
                      <>
                        <DefaultAction label="RESGATAR" color="warning" handleClick={onOpen} />
                        {open && (
                          <DialogConfirmar
                            onClose={onClose}
                            isSaving={isSaving}
                            handleOk={handleResgatar}
                            color="warning"
                            title="Resgatar"
                            desc="resgatar este processo"
                          />
                        )}
                      </>
                    )}

                    {podeAtribuir() &&
                      pedidoCC?.estados?.length === 1 &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && (
                        <Atribuir
                          dados={{
                            processoId: pedidoCC?.id,
                            fluxoIdA: pedidoCC?.fluxoId,
                            estadoId: pedidoCC?.estado_final_id,
                            perfilId: pedidoCC?.estado_processo?.perfil_id,
                          }}
                        />
                      )}
                  </>
                )}
                {/* {pedidoCC?.estados?.[0]?.pareceres?.length > 0 && (
                  <>
                    <DefaultAction
                      icon="parecer"
                      label={`Pareceres - ${pedidoCC?.estados?.[0]?.estado}`}
                      handleClick={onOpen4}
                    />
                    {open4 && (
                      <PareceresEstado
                        onCancel={() => onClose4()}
                        estado={pedidoCC?.estados?.[0]?.estado}
                        pareceres={pedidoCC?.estados?.[0]?.pareceres}
                      />
                    )}
                  </>
                )} */}
                {pedidoCC?.preso && pedidoCC?.perfil_id === perfilId && (
                  <>
                    {destinosList?.devolucoes?.length > 0 && (
                      <>
                        <DefaultAction color="warning" icon="devolver" label="DEVOLVER" handleClick={onOpen2} />
                        {open2 && <EncaminharForm dev onCancel={onClose2} destinos={destinosList?.devolucoes} />}
                      </>
                    )}
                    {destinosList?.seguimentos?.length > 0 && (
                      <>
                        <DefaultAction icon="encaminhar" label="Encaminhar" handleClick={onOpen1} />
                        {open1 && <EncaminharForm onCancel={onClose1} destinos={destinosList?.seguimentos} />}
                      </>
                    )}
                    <Abandonar
                      id={pedidoCC?.id}
                      isSaving={isSaving}
                      fluxoId={pedidoCC?.fluxo_id}
                      estadoId={pedidoCC?.ultimo_estado_id}
                    />
                    {!pedidoCC?.pendente &&
                      pedidoCC?.estados?.length === 1 &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && <ColocarPendente />}

                    <UpdateItem handleClick={handleEdit} />
                    {/* {arquivarCC(meusAmbientes, pedidoCC?.ultimo_estado_id) && (
                      <>
                        <DefaultAction icon="arquivo" label="Arquivar" color="error" handleClick={onOpen3} />
                        {open3 && <ArquivarForm open onCancel={onClose3} />}
                      </>
                    )} */}
                  </>
                )}
              </Stack>
            )
          }
        />

        <Card>
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
