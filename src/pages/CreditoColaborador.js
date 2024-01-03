import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// hooks
import useToggle, { useToggle1, useToggle2, useToggle3 } from '../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromCC, updateItem } from '../redux/slices/cc';
// components
import Page from '../components/Page';
import { TabCard } from '../components/TabsWrapper';
import DialogConfirmar from '../components/DialogConfirmar';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { UpdateItem, DefaultAction } from '../components/Actions';
// sections
import { EncaminharForm, ArquivarForm } from '../sections/credito-colaborador/Form/IntervencaoForm';
import {
  Views,
  Transicoes,
  DadosGerais,
  TableDetalhes,
  EntidadesGarantias,
} from '../sections/credito-colaborador/Detalhes';

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
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { pedidoCC, destinos, done, error, isSaving } = useSelector((state) => state.cc);
  const [currentTab, setCurrentTab] = useState('Dados gerais');

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
      if (done === 'Processo encaminhado' || done === 'Processo abandonado' || done === 'Processo arquivado') {
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
        ? [{ value: 'Garantias', component: <EntidadesGarantias item="garantias" dados={pedidoCC?.garantias} /> }]
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

  const handleAbandonar = () => {
    dispatch(
      updateItem(
        'abandonar',
        JSON.stringify({
          perfilID: cc?.perfil_id,
          fluxoID: pedidoCC?.fluxo_id,
          estadoID: pedidoCC?.ultimo_estado_id,
        }),
        { id: pedidoCC?.id, mail, msg: 'Processo abandonado' }
      )
    );
  };

  const handleResgatar = () => {
    dispatch(
      updateItem(
        'resgatar',
        JSON.stringify({
          perfil_id: cc?.perfil_id,
          fluxoID: pedidoCC?.fluxo_id,
          estado_id: pedidoCC?.ultimo_estado_id,
        }),
        { id: pedidoCC?.id, mail, msg: 'Processo resgatado' }
      )
    );
    onClose();
  };

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
              <Stack direction="row" spacing={0.75}>
                {!pedidoCC?.preso && (
                  <>
                    <DefaultAction icon="aceitar" label="Aceitar" handleClick={handleAceitar} />
                    <DefaultAction icon="resgatar" label="Resgatar" color="warning" handleClick={onOpen} />
                  </>
                )}
                {pedidoCC?.preso && pedidoCC?.perfil_id === cc?.perfil_id && (
                  <>
                    <UpdateItem handleClick={handleEdit} />
                    {destinos?.length > 0 && (
                      <DefaultAction icon="encaminhar" label="Encaminhar" handleClick={onOpen1} />
                    )}
                    <DefaultAction icon="abandonar" label="Abandonar" color="warning" handleClick={onOpen2} />
                    <DefaultAction icon="arquivo" label="Arquivar" color="error" handleClick={onOpen3} />
                  </>
                )}

                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isSaving={isSaving}
                  handleOk={handleResgatar}
                  color="warning"
                  title="Resgatar"
                  desc="resgatar este processo"
                />

                <EncaminharForm open={open1} onCancel={onClose1} destinos={destinos} />

                <DialogConfirmar
                  open={open2}
                  onClose={onClose2}
                  isSaving={isSaving}
                  handleOk={handleAbandonar}
                  color="warning"
                  title="Abandonar"
                  desc="abandonar este processo"
                />

                <ArquivarForm open={open3} onCancel={onClose3} />
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
