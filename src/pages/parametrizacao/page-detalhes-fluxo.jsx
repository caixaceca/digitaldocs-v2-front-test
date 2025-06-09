import PropTypes from 'prop-types';
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
import { setItemValue, transicoesList } from '../../utils/formatObject';
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
import TableTransicoes from '../../sections/parametrizacao/table-transicoes';
import { Detalhes, DetalhesContent } from '../../sections/parametrizacao/Detalhes';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageDetalhesFluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [transicao, setTransicao] = useState(null);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabFluxo') || 'Dados');

  const { perfilId } = useSelector((state) => state.intranet);
  const { fluxo, selectedItem, modalParams, done, isSaving, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('fluxo', { id, reset: { val: null } }));
  }, [dispatch, perfilId, id]);

  useEffect(() => {
    if (currentTab === 'Checklist' && fluxo?.id) {
      const params = { fluxoId: fluxo?.id, transicaoId: transicao?.id, reset: { val: [] } };
      dispatch(getFromParametrizacao('checklist', params));
    }
  }, [dispatch, currentTab, fluxo?.id, transicao?.id]);

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
    { value: 'Transições', component: <TableTransicoes /> },
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
    onClose: () => {
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
          voltar
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
                  {(currentTab === 'Notificações' || currentTab === 'Checklist') && (
                    <Transicoes
                      options={{
                        transicao,
                        setTransicao,
                        transicoes: fluxo?.transicoes || [],
                        checklist: currentTab === 'Checklist',
                      }}
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
            <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
          )}

          {modalParams === 'form-fluxo' && <FluxoForm onClose={() => closeModal()} />}
          {modalParams === 'form-clonar' && <ClonarFluxoForm onClose={() => closeModal()} />}
          {modalParams === 'form-checklist' && <ChecklistForm onClose={() => closeModal()} fluxo={fluxo} />}
          {modalParams === 'form-transicoes' && <TransicaoForm onClose={() => closeModal()} fluxoId={fluxo?.id} />}
          {modalParams === 'form-notificacoes' && (
            <NotificacaoForm onClose={() => closeModal()} transicao={transicao} fluxo={fluxo} />
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

// ----------------------------------------------------------------------

Transicoes.propTypes = { options: PropTypes.object };

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
