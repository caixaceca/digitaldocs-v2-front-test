import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
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
import TableInfoEstado from '../../sections/parametrizacao/table-info-estado';
import { Detalhes, DetalhesContent } from '../../sections/parametrizacao/Detalhes';
import { EstadoForm, PerfisEstadoForm, RegrasForm, EstadosPerfilForm } from '../../sections/parametrizacao/form-estado';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageDetalhesEstado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEstado') || 'Dados');

  const { perfilId, uos } = useSelector((state) => state.intranet);
  const { estado, selectedItem, modalParams, done, isLoading, isSaving } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    if (perfilId && id) dispatch(getFromParametrizacao('estado', { id, reset: { val: null } }));
  }, [dispatch, perfilId, id]);

  useEffect(() => {
    if (done === 'Estado eliminado') navigate(PATH_DIGITALDOCS.parametrizacao.root);
  }, [done, navigate]);

  const tabsList = [
    {
      value: 'Dados',
      component: (
        <Card sx={{ p: 3, pt: 1 }}>
          <DetalhesContent
            item="Estado"
            dados={estado}
            uo={uos?.find(({ id }) => Number(id) === Number(estado?.uo_id))}
          />
        </Card>
      ),
    },
    { value: 'Colaboradores', component: <TableInfoEstado item="colaboradores" dados={estado?.perfis || []} /> },
    { value: 'Regras parecer', component: <TableInfoEstado item="regrasEstado" dados={estado?.regras || []} /> },
  ];

  const confirmEliminar = () => {
    const item1 = currentTab === 'Colaboradores' ? { item: 'perfis', item1: 'estado' } : null;
    const msg = (currentTab === 'Colaboradores' && 'Colaborador') || (currentTab === 'Dados' && 'Estado');
    const item = (currentTab === 'Colaboradores' && 'estadosPerfil') || (currentTab === 'Dados' && 'estado');
    const params = { id: selectedItem?.id, estadoId: id, getItem: currentTab === 'Regras parecer' ? 'estado' : '' };
    dispatch(deleteItem(item || 'regrasEstado', { ...params, ...item1, msg: `${msg || 'Regra'} eliminado` }));
  };

  const onClose = () => dispatch(setModal());
  useNotificacao({ done, onClose });

  return (
    <Page title="Estado | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
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
                  {currentTab === 'Dados' && (
                    <>
                      <ActionButton options={{ sm: true, label: 'Editar', item: 'form-estado', dados: estado }} />
                      <ActionButton options={{ sm: true, label: 'Eliminar', item: 'eliminar-item', dados: estado }} />
                    </>
                  )}
                  {(currentTab === 'Colaboradores' ||
                    (currentTab === 'Regras parecer' && estado?.perfis?.length > 0)) && (
                    <ActionButton options={{ label: 'Adicionar', item: currentTab }} />
                  )}
                </Stack>
              </RoleBasedGuard>
            )
          }
        />

        <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
          {!isLoading && !estado ? (
            <SearchNotFound404 message="Estado não encontrado..." />
          ) : (
            <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
          )}

          {modalParams === 'form-estado' && <EstadoForm onClose={onClose} />}
          {modalParams === 'Colaboradores' && <PerfisEstadoForm onClose={onClose} />}
          {modalParams === 'detalhes-estado' && <Detalhes item="" closeModal={onClose} />}
          {modalParams === 'colaboradores' && <EstadosPerfilForm estadoId={id} onClose={onClose} />}
          {(modalParams === 'Regras parecer' || modalParams === 'regrasEstado') && (
            <RegrasForm item={estado} estado selectedItem={selectedItem} onClose={onClose} />
          )}
          {modalParams === 'eliminar-item' && (
            <DialogConfirmar
              onClose={onClose}
              isSaving={isSaving}
              handleOk={() => confirmEliminar()}
              desc={`eliminar est${
                (currentTab === 'Colaboradores' && 'e colaborador') ||
                (currentTab === 'Regras parecer' && 'a regra') ||
                'e estado'
              }`}
            />
          )}
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}
