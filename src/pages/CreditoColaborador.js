import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { temNomeacao, processoMePertence, findColaboradores } from '../utils/validarAcesso';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// hooks
import { getComparator, applySort } from '../hooks/useTable';
import useToggle, { useToggle1, useToggle3 } from '../hooks/useToggle';
// redux
import { selectItem } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
import { getFromCC, updateItem } from '../redux/slices/cc';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
// components
import Page from '../components/Page';
import { TabCard } from '../components/TabsWrapper';
import DialogConfirmar from '../components/DialogConfirmar';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { UpdateItem, DefaultAction, Pendente } from '../components/Actions';
// sections
import {
  Views,
  Pareceres,
  Transicoes,
  DadosGerais,
  TableDetalhes,
  EntidadesGarantias,
} from '../sections/credito-colaborador/Detalhes';
import { Abandonar, ColocarPendente, AtribuirForm } from '../sections/processo/IntervencaoForm';
import { EncaminharForm, ArquivarForm } from '../sections/credito-colaborador/Form/IntervencaoForm';

// ----------------------------------------------------------------------

export default function CreditoColaborador() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { pedidoCC, destinos, done, error, isSaving } = useSelector((state) => state.cc);
  const { meusAmbientes, iAmInGrpGerente, isAdmin, colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const isResponsavel = temNomeacao(cc) || iAmInGrpGerente;
  const colaboradoresList = findColaboradores(
    colaboradores,
    colaboradoresEstado?.map((row) => row?.perfil_id)
  );

  const fromArquivo = params?.get?.('from') === 'arquivo';
  const fromProcurar = params?.get?.('from') === 'procurar';
  const fromEntradas = params?.get?.('from') === 'entradas';
  const fromPorConcluir = params?.get?.('from') === 'porconcluir';
  const fromTrabalhados = params?.get?.('from') === 'trabalhados';
  const linkNavigate =
    (fromProcurar && `${PATH_DIGITALDOCS.processos.procurar}`) ||
    (fromArquivo && `${PATH_DIGITALDOCS.arquivo.lista}`) ||
    ((fromTrabalhados || fromPorConcluir || fromEntradas) && `${PATH_DIGITALDOCS.controle.lista}`) ||
    `${PATH_DIGITALDOCS.processos.lista}`;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      if (
        done === 'Processo encaminhado' ||
        done === 'Processo abandonado' ||
        done === 'Processo arquivado' ||
        done === 'Atribuição eliminada' ||
        done === 'Processo atribuído'
      ) {
        navigate(linkNavigate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const tabsList = useMemo(
    () => [
      { value: 'Dados gerais', component: <DadosGerais processo={pedidoCC} /> },
      ...(pedidoCC?.entidades?.length > 0
        ? [{ value: 'Entidades', component: <EntidadesGarantias item="entidades" dados={pedidoCC?.entidades} /> }]
        : []),
      ...(pedidoCC?.anexos?.length > 0 ? [{ value: 'Anexos', component: <TableDetalhes item="anexos" /> }] : []),
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
      ...(pedidoCC ? [{ value: 'Transições', component: <Transicoes /> }] : []),
      // ...(pedidoCC?.estados?.length > 0 ? [{ value: 'Estados', component: <Estados /> }] : []),
      ...(pedidoCC ? [{ value: 'Visualizações', component: <Views /> }] : []),
      ...(pedidoCC ? [{ value: 'Retenções', component: <TableDetalhes item="retencoes" /> }] : []),
      ...(pedidoCC ? [{ value: 'Atribuições', component: <TableDetalhes item="atribuicoes" /> }] : []),
      ...(pedidoCC ? [{ value: 'Pendências', component: <TableDetalhes item="pendencias" /> }] : []),
    ],
    [pedidoCC]
  );

  const handleEdit = () => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${id}/editar`);
  };

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getFromCC('pedido cc', { id, perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, id, cc?.perfil_id, mail]);

  useEffect(() => {
    if (mail && podeAtribuir() && pedidoCC?.ultimo_estado_id && cc?.perfil_id) {
      dispatch(
        getFromParametrizacao('colaboradoresEstado', { mail, id: pedidoCC?.ultimo_estado_id, perfilId: cc?.perfil_id })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, pedidoCC]);

  const handleAceitar = () => {
    dispatch(
      updateItem(
        'aceitar',
        JSON.stringify({
          perfilID: cc?.perfil_id,
          fluxoID: pedidoCC?.fluxo_id,
          estadoID: pedidoCC?.ultimo_estado_id,
        }),
        { id, perfilId: cc?.perfil_id, mail, msg: 'Processo aceitado' }
      )
    );
  };

  const handleResgatar = () => {
    dispatch(
      updateItem(
        'resgatar',
        JSON.stringify({
          perfil_id: cc?.perfil_id,
          fluxo_id: pedidoCC?.fluxo_id,
          estado_id: pedidoCC?.ultimo_estado_id,
        }),
        { id: pedidoCC?.id, mail, msg: 'Processo resgatado' }
      )
    );
    onClose();
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  function podeAtribuir() {
    return (
      !pedidoCC?.preso && ((processoMePertence(meusAmbientes, pedidoCC?.ultimo_estado_id) && isResponsavel) || isAdmin)
    );
  }
  return (
    <Page title="Detalhes do pedido">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading="Detalhes do pedido de crédito"
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
            { name: 'Detalhes do pedido' },
          ]}
          action={
            pedidoCC && (
              <Stack direction="row" spacing={0.5}>
                {!pedidoCC?.preso && (
                  <>
                    {processoMePertence(meusAmbientes, pedidoCC?.ultimo_estado_id) &&
                      (!pedidoCC?.afeto || (pedidoCC?.afeto && pedidoCC?.estados?.[0]?.perfil_id === cc?.perfil_id)) &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && (
                        <DefaultAction icon="aceitar" label="Aceitar" handleClick={handleAceitar} />
                      )}
                    {!pedidoCC?.pendente && pedidoCC?.estados?.length === 1 && (
                      <>
                        <DefaultAction icon="resgatar" label="Resgatar" color="warning" handleClick={onOpen} />
                        <DialogConfirmar
                          open={open}
                          onClose={onClose}
                          isSaving={isSaving}
                          handleOk={handleResgatar}
                          color="warning"
                          title="Resgatar"
                          desc="resgatar este processo"
                        />
                      </>
                    )}

                    {podeAtribuir() &&
                      pedidoCC?.estados?.length === 1 &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && (
                        <AtribuirForm
                          processoID={pedidoCC?.id}
                          fluxoId={pedidoCC?.fluxo_id}
                          colaboradoresList={colaboradoresList}
                          perfilId={pedidoCC?.estados?.[0]?.perfil_id}
                        />
                      )}
                  </>
                )}
                {pedidoCC?.estados?.[0]?.pareceres?.length > 0 && <Pareceres />}
                {pedidoCC?.preso && pedidoCC?.perfil_id === cc?.perfil_id && (
                  <>
                    <UpdateItem handleClick={handleEdit} />
                    {destinos?.length > 0 && (
                      <>
                        <DefaultAction icon="encaminhar" label="Encaminhar" handleClick={onOpen1} />
                        <EncaminharForm open={open1} onCancel={onClose1} destinos={destinos} />
                      </>
                    )}
                    <Abandonar isSaving={isSaving} processo={pedidoCC} />
                    {!pedidoCC?.pendente &&
                      pedidoCC?.estados?.length === 1 &&
                      pedidoCC?.estados?.[0]?.pareceres?.length === 0 && (
                        <>
                          <Pendente detail handleClick={() => handlePendente(pedidoCC)} />
                          <ColocarPendente from="pediddoCC" />
                        </>
                      )}
                    <DefaultAction icon="arquivo" label="Arquivar" color="error" handleClick={onOpen3} />
                    <ArquivarForm open={open3} onCancel={onClose3} />
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
