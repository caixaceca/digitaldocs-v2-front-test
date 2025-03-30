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
import { setItemValue } from '../../utils/formatObject';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, setModal, deleteItem } from '../../redux/slices/parametrizacao';
// routes
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { ActionButton } from '../../components/Actions';
import { SearchNotFound404 } from '../../components/table';
import { DialogConfirmar } from '../../components/CustomDialog';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import {
  FluxoForm,
  ChecklistForm,
  TransicaoForm,
  ClonarFluxoForm,
  NotificacaoForm,
} from '../../sections/parametrizacao/form-fluxo';
import TableInfoFluxo from '../../sections/parametrizacao/table-info-fluxo';
import { Detalhes, DetalhesContent } from '../../sections/parametrizacao/Detalhes';
//
import { listaTransicoes } from '../../sections/parametrizacao/applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageDetalhesFluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { perfilId } = useSelector((state) => state.intranet);
  const { fluxo, estados, selectedItem, modalParams, done, isSaving, isLoading } = useSelector(
    (state) => state.parametrizacao
  );
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabFluxo') || 'Dados');
  const transicoes = useMemo(
    () => listaTransicoes(fluxo?.transicoes?.filter((row) => row?.to_alert) || [], estados),
    [estados, fluxo?.transicoes]
  );
  const [transicao, setTransicao] = useState(
    transicoes?.find((row) => Number(row?.id) === Number(localStorage.getItem('transicaoParam'))) || null
  );

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('fluxo', { id, reset: { val: null } }));
  }, [dispatch, perfilId, id]);

  useEffect(() => {
    if (currentTab === 'Checklist' && fluxo?.id) dispatch(getFromParametrizacao('checklist', { fluxoId: fluxo?.id }));
  }, [dispatch, currentTab, fluxo?.id]);

  useEffect(() => {
    if (currentTab === 'Notificações' && transicao?.id)
      dispatch(getFromParametrizacao('notificacoes', { id: transicao?.id }));
  }, [dispatch, currentTab, transicao?.id]);

  const tabsList = [
    {
      value: 'Dados',
      component: (
        <Card sx={{ p: 3, pt: 1 }}>
          <DetalhesContent dados={fluxo} item="Fluxo" />
        </Card>
      ),
    },
    { value: 'Transições', component: <TableInfoFluxo item="transicoes" /> },
    { value: 'Estados', component: <TableInfoFluxo item="estados" /> },
    { value: 'Checklist', component: <TableInfoFluxo item="checklist" /> },
    { value: 'Notificações', component: <TableInfoFluxo item="notificacoes" /> },
  ];

  const form = useMemo(
    () =>
      (currentTab === 'Checklist' && 'checklist') ||
      (currentTab === 'Transições' && 'transicoes') ||
      (currentTab === 'Notificações' && !!transicao && 'notificacoes'),
    [currentTab, transicao]
  );

  const closeModal = () => dispatch(setModal());
  useNotificacao({
    done,
    afterSuccess: () => {
      if (!done.includes('Regra transição')) closeModal();
    },
  });

  const handleDelete = () => {
    const item = currentTab === 'Transições' ? 'transicoes' : 'notificacoes';
    const msg = `${currentTab === 'Transições' ? 'Transição' : 'Notificação'} eliminada`;
    dispatch(deleteItem(item, { item1: currentTab === 'Transições' ? 'fluxo' : '', id: selectedItem?.id, msg }));
  };

  return (
    <Page title="Fluxo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabFluxo"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={fluxo?.assunto || 'Detalhes do fluxo'}
        />
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={currentTab === 'Dados' ? 'Detalhes do fluxo' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
            { name: currentTab === 'Dados' ? 'Detalhes do fluxo' : currentTab },
          ]}
          action={
            fluxo && (
              <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {currentTab === 'Notificações' && (
                    <Autocomplete
                      fullWidth
                      size="small"
                      disableClearable
                      options={transicoes}
                      sx={{ minWidth: 300 }}
                      value={transicao || null}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      renderInput={(params) => <TextField {...params} label="Transição" />}
                      onChange={(event, newValue) => setItemValue(newValue, setTransicao, 'transicaoParam', true)}
                    />
                  )}
                  {currentTab === 'Dados' && (
                    <>
                      <ActionButton options={{ label: 'Editar', item: 'form-fluxo', dados: fluxo }} />
                      <ActionButton options={{ label: 'Clonar', item: 'form-clonar', dados: fluxo }} />
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
            <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
          )}

          {modalParams === 'form-fluxo' && <FluxoForm onCancel={() => closeModal()} />}
          {modalParams === 'form-clonar' && <ClonarFluxoForm onCancel={() => closeModal()} />}
          {modalParams === 'form-checklist' && <ChecklistForm onCancel={() => closeModal()} fluxo={fluxo} />}
          {modalParams === 'form-transicoes' && <TransicaoForm onCancel={() => closeModal()} fluxoId={fluxo?.id} />}
          {modalParams === 'form-notificacoes' && (
            <NotificacaoForm onCancel={() => closeModal()} transicao={transicao} fluxo={fluxo} />
          )}
          {modalParams === 'detalhes-fluxo' && <Detalhes item={currentTab} closeModal={() => closeModal()} />}
          {modalParams === 'eliminar-item' && (
            <DialogConfirmar
              isSaving={isSaving}
              handleOk={handleDelete}
              onClose={() => closeModal()}
              desc={(currentTab === 'Transições' && 'eliminar esta transição') || 'eliminar esta notificação'}
            />
          )}
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}
