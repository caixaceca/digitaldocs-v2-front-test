import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { acessoGaji9 } from '../../utils/validarAcesso';
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
import AcessoGaji9 from './acesso-gaji9';
import InfoCredito, { TableInfoCredito } from '../../sections/gaji9/info-credito';
import CreditForm, { FiadoresForm, PreviewForm } from '../../sections/gaji9/form-credito';

// ----------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabInfoCredito') || 'Dados');
  const { credito, isLoading, isOpenModal, isOpenView, isLoadingDoc, previewFile, utilizador, done, error } =
    useSelector((state) => state.gaji9);

  useEffect(() => {
    if (utilizador._role === 'ADMIN' || acessoGaji9(utilizador.acessos, ['READ_CREDITO']))
      dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, utilizador, id]);

  const tabsList = [
    { value: 'Dados', component: <InfoCredito /> },
    {
      value: 'Participantes',
      component: <TableInfoCredito id={credito?.id} dados={credito?.participantes} isLoading={isLoading} />,
    },
  ];

  return (
    <Page title="Estado | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={() => dispatch(closeModal())} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tabsList={tabsList}
          tab="tabInfoCredito"
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
            (utilizador._role === 'ADMIN' || acessoGaji9(utilizador.acessos, ['READ_CREDITO'])) &&
            !!credito?.ativo && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Dados' &&
                  (utilizador._role === 'ADMIN' || acessoGaji9(utilizador.acessos, ['UPDATE_CREDITO'])) && (
                    <DefaultAction label="EDITAR" color="warning" handleClick={() => dispatch(openModal())} />
                  )}
                {currentTab === 'Participantes' &&
                  (utilizador._role === 'ADMIN' || acessoGaji9(utilizador.acessos, ['CREATE_CREDITO'])) && (
                    <DefaultAction button icon="adicionar" label="Fiadores" handleClick={() => dispatch(openModal())} />
                  )}
                <DefaultAction
                  button
                  icon="pdf"
                  label="Previsualizar contrato"
                  handleClick={() => dispatch(openModal('view'))}
                />
              </Stack>
            )
          }
        />

        <AcessoGaji9 item="credito">
          {!isLoading && !credito ? (
            <SearchNotFound404 message="Crédito não encontrado..." />
          ) : (
            <>
              {tabsList.map((tab) => {
                const isMatched = tab.value === currentTab;
                return isMatched && <Box key={tab.value}>{tab.component}</Box>;
              })}
              {(isLoadingDoc || previewFile) && (
                <DialogPreviewDoc
                  url={previewFile}
                  isLoading={isLoadingDoc}
                  titulo={`Contrato - ${credito?.cliente}`}
                  onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
                />
              )}

              {isOpenView && <PreviewForm credito={credito} onCancel={() => dispatch(closeModal())} />}
              {isOpenModal && currentTab === 'Dados' && (
                <CreditForm isEdit dados={credito} onCancel={() => dispatch(closeModal())} />
              )}
              {isOpenModal && currentTab === 'Participantes' && (
                <FiadoresForm id={id} onCancel={() => dispatch(closeModal())} />
              )}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
