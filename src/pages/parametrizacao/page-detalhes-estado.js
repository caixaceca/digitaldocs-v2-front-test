import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
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
import { AddItem, UpdateItem } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
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
  const { estado, done } = useSelector((state) => state.parametrizacao);
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

  useNotificacao({ done, afterSuccess: () => handleCloseModal() });

  return (
    <Page title="Estado | DigitalDocs">
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
                {currentTab === 'Dados' && <UpdateItem dados={{ button: true, dados: estado }} />}
                {(currentTab === 'Colaboradores' ||
                  (currentTab === 'Regras parecer' && estado?.perfis?.length > 0)) && <AddItem />}
              </RoleBasedGuard>
            )
          }
        />

        {estado ? (
          <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
            <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
          </RoleBasedGuard>
        ) : (
          <SearchNotFound404 message="Estado não encontrado..." />
        )}
      </Container>
    </Page>
  );
}
