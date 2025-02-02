import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
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
import { FiadoresForm, PreviewForm } from '../../sections/gaji9/form-credito';
import InfoCredito, { TableInfoCredito } from '../../sections/gaji9/info-credito';
// guards
// import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabInfoCredito') || 'Dados');
  const { credito, isLoading, isOpenModal, isOpenView, previewFile, done, error } = useSelector((state) => state.gaji9);

  useEffect(() => {
    dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (credito?.id) {
      dispatch(getFromGaji9('minutasPublicas'));
    }
  }, [dispatch, credito?.id]);

  const tabsList = [
    { value: 'Dados', component: <InfoCredito /> },
    { value: 'Participantes', component: <TableInfoCredito dados={credito?.participantes} isLoading={isLoading} /> },
  ];

  return (
    <Page title="Estado | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={() => dispatch(closeModal())} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabMinuta"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={credito ? `${credito?.rotulo || credito?.componente} - ${credito?.cliente}` : 'Detalhes do crédito'}
        />

        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={currentTab === 'Dados' ? 'Detalhes do crédito' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJ-i9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: currentTab === 'Dados' ? 'Detalhes do crédito' : currentTab },
          ]}
          action={
            credito?.ativo && (
              <>
                {currentTab === 'Dados' ? (
                  <DefaultAction
                    button
                    icon="pdf"
                    label="Previsualizar contrato"
                    handleClick={() => dispatch(openModal('view'))}
                  />
                ) : (
                  <DefaultAction button icon="adicionar" label="Fiadores" handleClick={() => dispatch(openModal())} />
                )}
              </>
            )
          }
        />

        {!isLoading && !credito ? (
          <SearchNotFound404 message="Crédito não encontrado..." />
        ) : (
          <>
            {tabsList.map((tab) => {
              const isMatched = tab.value === currentTab;
              return isMatched && <Box key={tab.value}>{tab.component}</Box>;
            })}

            {isOpenModal && <FiadoresForm id={credito?.id} onCancel={() => dispatch(closeModal())} />}
            {isOpenView && <PreviewForm creditoId={credito?.id} onCancel={() => dispatch(closeModal())} />}
            {previewFile && (
              <DialogPreviewDoc
                url={previewFile}
                titulo={`Contrato - ${credito?.cliente}`}
                onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
              />
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
