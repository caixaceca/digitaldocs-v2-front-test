import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import useSettings from '@/hooks/useSettings';
import { PATH_DIGITALDOCS } from '@/routes/paths';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
import { setItemValue, transicoesList } from '@/utils/formatObject';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getFromParametrizacao, setModal, deleteItem } from '@/redux/slices/parametrizacao';
// components
import Page from '@/components/Page';
import TabsWrapper from '@/components/TabsWrapper';
import { ActionButton } from '@/components/Actions';
import { SearchNotFound404 } from '@/components/table';
import { DialogConfirmar } from '@/components/CustomDialog';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
// sections
import {
  FluxoForm,
  ChecklistForm,
  TransicaoForm,
  ClonarFluxoForm,
  NotificacaoForm,
} from '@/sections/parametrizacao/form-fluxo';
import TableInfoFluxo from '@/sections/parametrizacao/table-info-fluxo';
import TableTransicoes from '@/sections/parametrizacao/table-transicoes';
import { Detalhes, DetalhesContent } from '@/sections/parametrizacao/Detalhes';
// guards
import RoleBasedGuard from '@/guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageDetalhesFluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [transicao, setTransicao] = useState(null);

  const { perfilId } = useSelector((state) => state.intranet);
  const { fluxo, selectedItem, modalParams, isSaving, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('fluxo', { id, reset: { val: null } }));
  }, [dispatch, perfilId, id]);

  const tabsList = [
    {
      value: 'Dados',
      component: (
        <Card sx={{ p: 3, pt: 1 }}>
          <DetalhesContent dados={fluxo} item="Fluxo" />
        </Card>
      ),
    },
    { value: 'Transições', component: <TableTransicoes /> },
    { value: 'Estados', component: <TableInfoFluxo item="estados" /> },
    { value: 'Checklist', component: <TableInfoFluxo item="checklist" /> },
    { value: 'Notificações', component: <TableInfoFluxo item="notificacoes" /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Dados', 'tab-detalhes-fluxo');

  useEffect(() => {
    if (tab === 'Checklist' && fluxo?.id) {
      const params = { fluxoId: fluxo?.id, transicaoId: transicao?.id, reset: { val: [] } };
      dispatch(getFromParametrizacao('checklist', params));
    }
  }, [dispatch, tab, fluxo?.id, transicao?.id]);

  useEffect(() => {
    if (tab === 'Notificações' && transicao?.id) dispatch(getFromParametrizacao('notificacoes', { id: transicao?.id }));
  }, [dispatch, tab, transicao?.id]);

  const form = useMemo(
    () =>
      (tab === 'Checklist' && 'checklist') ||
      (tab === 'Transições' && 'transicoes') ||
      (tab === 'Notificações' && !!transicao && 'notificacoes'),
    [tab, transicao]
  );

  const onClose = () => dispatch(setModal());

  const handleDelete = () => {
    const item = tab === 'Transições' ? 'transicoes' : 'notificacoes';
    const msg = `${tab === 'Transições' ? 'Transição' : 'Notificação'} eliminada`;
    dispatch(deleteItem(item, { item1: tab === 'Transições' && 'fluxo', id: selectedItem?.id, msg, onClose }));
  };

  return (
    <Page title="Fluxo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
          tab={tab}
          setTab={setTab}
          tabsList={tabsList}
          title={fluxo?.assunto || 'Detalhes do fluxo'}
        />
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={tab === 'Dados' ? 'Detalhes do fluxo' : tab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
            { name: tab === 'Dados' ? 'Detalhes do fluxo' : tab },
          ]}
          action={
            fluxo && (
              <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {(tab === 'Notificações' || tab === 'Checklist') && (
                    <Transicoes
                      options={{
                        transicao,
                        setTransicao,
                        checklist: tab === 'Checklist',
                        transicoes: fluxo?.transicoes || [],
                      }}
                    />
                  )}
                  {tab === 'Dados' && (
                    <>
                      <ActionButton options={{ label: 'Editar', item: 'form-fluxo', dados: fluxo, sm: true }} />
                      <ActionButton options={{ label: 'Clonar', item: 'form-clonar', dados: fluxo, sm: true }} />
                    </>
                  )}
                  {fluxo?.is_ativo && form && <ActionButton options={{ label: 'Adicionar', item: `form-${form}` }} />}
                </Stack>
              </RoleBasedGuard>
            )
          }
        />

        <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
          {!isLoading && !fluxo ? (
            <SearchNotFound404 message="Fluxo não encontrado..." />
          ) : (
            <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
          )}

          {modalParams === 'form-fluxo' && <FluxoForm onClose={onClose} />}
          {modalParams === 'form-clonar' && <ClonarFluxoForm onClose={onClose} />}
          {modalParams === 'form-checklist' && <ChecklistForm onClose={onClose} fluxo={fluxo} />}
          {modalParams === 'detalhes-fluxo' && <Detalhes item={tab} closeModal={onClose} />}
          {modalParams === 'form-transicoes' && <TransicaoForm onClose={onClose} fluxoId={fluxo?.id} />}
          {modalParams === 'form-notificacoes' && (
            <NotificacaoForm onClose={onClose} transicao={transicao} fluxo={fluxo} />
          )}
          {modalParams === 'eliminar-item' && (
            <DialogConfirmar
              onClose={onClose}
              isSaving={isSaving}
              handleOk={handleDelete}
              desc={(tab === 'Transições' && 'eliminar esta transição') || 'eliminar esta notificação'}
            />
          )}
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Transicoes({ options }) {
  const { transicao, setTransicao, transicoes, checklist } = options;
  const { estados } = useSelector((state) => state.parametrizacao);
  const listaTransicoes = useMemo(
    () => transicoesList(transicoes || [], estados, true, checklist),
    [estados, transicoes, checklist]
  );

  useEffect(() => {
    if (!transicao && listaTransicoes?.length > 0)
      setTransicao(listaTransicoes?.find(({ id }) => id === Number(localStorage.getItem('trsParam'))) || null);
  }, [setTransicao, transicao, listaTransicoes]);

  return (
    <Autocomplete
      fullWidth
      size="small"
      sx={{ minWidth: 300 }}
      options={listaTransicoes}
      value={transicao || null}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Transição" />}
      onChange={(event, newValue) => setItemValue(newValue, setTransicao, 'trsParam', true)}
    />
  );
}
