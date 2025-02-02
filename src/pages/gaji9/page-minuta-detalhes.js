import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, getDocumento, openModal, closeModal } from '../../redux/slices/gaji9';
// routes
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFound404 } from '../../components/table';
import DialogPreviewDoc from '../../components/CustomDialog';
import { Notificacao } from '../../components/NotistackProvider';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import InfoMinuta, { TableInfoMinuta } from '../../sections/gaji9/info-minuta';
import MinutaForm, { ComposicaoForm, PublicarRevogarForm } from '../../sections/gaji9/form-minuta';
// guards
// import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageMinutaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [action, setAction] = useState('');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabMinuta') || 'Dados');
  const { minuta, isLoading, isOpenModal, minutaId, previewFile, done, error } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (done === 'Minuta publicada' || done === 'Minuta revogada') {
      navigate(PATH_DIGITALDOCS.gaji9.root);
    } else if (done === 'Minuta clonada' || (done === 'Minuta versionada' && minutaId)) {
      navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${minutaId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    dispatch(getFromGaji9('minuta', { id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (minuta?.id) {
      dispatch(getFromGaji9('componentes'));
      dispatch(getFromGaji9('tiposTitulares'));
      dispatch(getFromGaji9('tiposGarantias'));
    }
  }, [dispatch, minuta?.id]);

  const handleClose = () => {
    setAction('');
    dispatch(closeModal());
  };

  const handleAction = (item) => {
    if (item === 'ordenar') {
      dispatch(getFromGaji9('ordenarClausulas', { id, item: 'minuta', msg: 'Cláusulas ordenadas' }));
    } else {
      setAction(item);
      dispatch(openModal(item === 'update' ? 'update' : ''));
    }
  };

  const tabsList = [
    { value: 'Dados', component: <InfoMinuta /> },
    { value: 'Tipos de garantia', component: <TableInfoMinuta item="tiposGarantias" onClose={handleClose} /> },
    { value: 'Cláusulas', component: <TableInfoMinuta item="clausulas" onClose={handleClose} /> },
  ];

  return (
    <Page title="Estado | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={() => handleClose()} />
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
            { name: 'GAJ-i9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: currentTab === 'Dados' ? 'Detalhes da minuta' : currentTab },
          ]}
          action={
            // <RoleBasedGuard roles={['gaji9-111']}>
            <>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {minuta?.ativo && (
                  <>
                    {currentTab === 'Dados' && (
                      <>
                        <DefaultAction color="inherit" label="CLONAR" handleClick={() => handleAction('Clonar')} />
                        {minuta?.em_analise && (
                          <>
                            <DefaultAction
                              label="EDITAR"
                              color="warning"
                              handleClick={() => handleAction('Atualizar')}
                            />
                            {minuta?.clausulas?.length > 0 && (
                              <DefaultAction label="PUBLICAR" handleClick={() => handleAction('Publicar')} />
                            )}
                          </>
                        )}
                        {minuta?.em_vigor && (
                          <>
                            <DefaultAction
                              color="info"
                              label="VERSIONAR"
                              handleClick={() => handleAction('Versionar')}
                            />
                            <DefaultAction color="error" label="REVOGAR" handleClick={() => handleAction('Revogar')} />
                          </>
                        )}
                      </>
                    )}
                    {minuta?.em_analise && (
                      <>
                        {currentTab === 'Tipos de garantia' && (
                          <DefaultAction button label="Adicionar" handleClick={() => dispatch(openModal())} />
                        )}
                        {currentTab === 'Cláusulas' && (
                          <>
                            <DefaultAction label="ADICIONAR" handleClick={() => handleAction('compor')} />
                            {minuta?.clausulas?.length > 0 && (
                              <>
                                <DefaultAction
                                  icon="editar"
                                  color="warning"
                                  label="COMPOSIÇÂO"
                                  handleClick={() => handleAction('composicao')}
                                />
                                <DefaultAction label="ORDENAR" handleClick={() => handleAction('ordenar')} />
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {minuta?.clausulas?.length > 0 && (
                  <DefaultAction
                    button
                    icon="pdf"
                    label="Previsualizar"
                    handleClick={() => dispatch(getDocumento('previewFile', { id }))}
                  />
                )}
              </Stack>
            </>
            // </RoleBasedGuard>
          }
        />

        {!isLoading && !minuta ? (
          <SearchNotFound404 message="Minuta não encontrada..." />
        ) : (
          // <RoleBasedGuard hasContent roles={['gaji9-111']}>
          <>
            {tabsList.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}

            {isOpenModal && (
              <>
                {(action === 'Atualizar' || action === 'Clonar' || action === 'Versionar') && (
                  <MinutaForm action={action} onCancel={() => handleClose()} minuta={minuta} />
                )}
                {currentTab === 'Cláusulas' && (action === 'compor' || action === 'composicao') && (
                  <ComposicaoForm action={action} onCancel={() => handleClose()} />
                )}
                {(action === 'Publicar' || action === 'Revogar') && (
                  <PublicarRevogarForm onCancel={() => handleClose()} action={action} />
                )}
              </>
            )}
          </>
          // </RoleBasedGuard>
        )}

        {previewFile && (
          <DialogPreviewDoc
            url={previewFile}
            titulo={`Minuta - ${minuta?.titulo}`}
            onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
          />
        )}
      </Container>
    </Page>
  );
}
