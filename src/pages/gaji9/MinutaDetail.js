import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, closeModal } from '../../redux/slices/gaji9';
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

export default function MinutaDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { perfilId } = useSelector((state) => state.intranet);
  const { minuta, done, error } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabMinuta') || 'Dados');

  useEffect(() => {
    if (perfilId && id) {
      dispatch(getFromGaji9('minuta', { id }));
    }
  }, [dispatch, perfilId, id]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const tabsList = [
    { value: 'Dados', component: <InfoEstado onClose={handleCloseModal} /> },
    { value: 'Tipos de garantia', component: <TableInfoEstado item="tiposGarantias" onClose={handleCloseModal} /> },
    { value: 'Cláusulas', component: <TableInfoEstado item="clausulas" onClose={handleCloseModal} /> },
  ];

  return (
    <Page title="Estado | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={() => handleCloseModal()} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabMinuta"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={minuta?.titulo || 'Detalhes da minuta'}
        />

        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={currentTab === 'Dados' ? 'Detalhes da minuta' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJi9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: currentTab === 'Dados' ? 'Detalhes da minuta' : currentTab },
          ]}
          action={
            <RoleBasedGuard roles={['gaji9-111']}>
              {minuta?.ativo && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {currentTab === 'Dados' && <UpdateItem dados={{ button: true, dados: minuta }} />}
                  {currentTab !== 'Dados' && <AddItem />}
                </Stack>
              )}
            </RoleBasedGuard>
          }
        />

        {!minuta ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Minuta não encontrada..." />
          </Grid>
        ) : (
          <RoleBasedGuard hasContent roles={['gaji9-111']}>
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
