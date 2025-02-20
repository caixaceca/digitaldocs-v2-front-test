import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, closeModal } from '../../redux/slices/parametrizacao';
// routes
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { SearchNotFound404 } from '../../components/table';
import { Notificacao } from '../../components/NotistackProvider';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { AddItem, UpdateItem } from '../../components/Actions';
// sections
import InfoEstado, { TableInfoEstado } from '../../sections/parametrizacao/InfoEstado';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageDetalhesEstado() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { perfilId } = useSelector((state) => state.intranet);
  const { estado, done, error } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEstado') || 'Dados');

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('estado', { id }));
  }, [dispatch, perfilId, id]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const tabsList = [
    { value: 'Dados', component: <InfoEstado onClose={handleCloseModal} /> },
    { value: 'Colaboradores', component: <TableInfoEstado item="colaboradores" onClose={handleCloseModal} /> },
    { value: 'Regras parecer', component: <TableInfoEstado item="regrasEstado" onClose={handleCloseModal} /> },
  ];

  return (
    <Page title="Estado | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={() => handleCloseModal()} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabEstado"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={estado?.nome || 'Detalhes do estado'}
        />
        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={currentTab === 'Dados' ? 'Detalhes do estado' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
            { name: currentTab === 'Dados' ? 'Detalhes do estado' : currentTab },
          ]}
          action={
            estado?.is_ativo && (
              <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {currentTab === 'Dados' && <UpdateItem dados={{ button: true, dados: estado }} />}
                  {currentTab !== 'Dados' && <AddItem />}
                </Stack>
              </RoleBasedGuard>
            )
          }
        />

        {!estado ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Estado não encontrado..." />
          </Grid>
        ) : (
          <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
            {tabsList.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}
          </RoleBasedGuard>
        )}
      </Container>
    </Page>
  );
}
