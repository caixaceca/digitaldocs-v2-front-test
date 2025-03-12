import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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
import { getFromParametrizacao, openModal, getSuccess, closeModal } from '../../redux/slices/parametrizacao';
// routes
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { SearchNotFound404 } from '../../components/table';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { AddItem, UpdateItem, DefaultAction } from '../../components/Actions';
// sections
import InfoFluxo, { TableInfoFluxo } from '../../sections/parametrizacao/InfoFluxo';
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
  const { fluxo, estados, done } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabFluxo') || 'Dados');
  const transicoes = useMemo(
    () => listaTransicoes(fluxo?.transicoes?.filter((row) => row?.to_alert) || [], estados),
    [estados, fluxo?.transicoes]
  );
  const [transicao, setTransicao] = useState(
    transicoes?.find((row) => Number(row?.id) === Number(localStorage.getItem('transicaoParam'))) || null
  );

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('fluxo', { id }));
  }, [dispatch, perfilId, id]);

  useEffect(() => {
    if (currentTab === 'Checklist' && fluxo?.id) {
      dispatch(getFromParametrizacao('documentos', { gestao: true }));
      dispatch(getFromParametrizacao('checklist', { fluxoId: fluxo?.id, gestao: true }));
    }
  }, [dispatch, currentTab, fluxo?.id]);

  useEffect(() => {
    if (currentTab === 'Notificações' && transicao?.id)
      dispatch(getFromParametrizacao('notificacoes', { id: transicao?.id }));
  }, [dispatch, currentTab, transicao?.id]);

  const tabsList = [
    { value: 'Dados', component: <InfoFluxo onClose={() => dispatch(closeModal())} /> },
    { value: 'Transições', component: <TableInfoFluxo item="transicoes" onClose={() => dispatch(closeModal())} /> },
    { value: 'Estados', component: <TableInfoFluxo item="estados" onClose={() => dispatch(closeModal())} /> },
    { value: 'Checklist', component: <TableInfoFluxo item="checklist" onClose={() => dispatch(closeModal())} /> },
    {
      value: 'Notificações',
      component: <TableInfoFluxo item="notificacoes" transicao={transicao} onClose={() => dispatch(closeModal())} />,
    },
  ];

  useNotificacao({
    done,
    afterSuccess: () => {
      if (!done.includes('Regra transição')) dispatch(closeModal());
    },
  });

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
                      <UpdateItem dados={{ button: true, dados: fluxo }} />
                      <DefaultAction
                        button
                        label="Clonar"
                        color="inherit"
                        handleClick={() => {
                          dispatch(openModal('view'));
                          dispatch(getSuccess({ item: 'selectedItem', dados: fluxo }));
                        }}
                      />
                    </>
                  )}
                  {fluxo?.is_ativo &&
                    (currentTab === 'Transições' ||
                      currentTab === 'Checklist' ||
                      (currentTab === 'Notificações' && !!transicao)) && <AddItem />}
                </Stack>
              </RoleBasedGuard>
            )
          }
        />

        {!fluxo ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Fluxo não encontrado..." />
          </Grid>
        ) : (
          <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
            <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
          </RoleBasedGuard>
        )}
      </Container>
    </Page>
  );
}
