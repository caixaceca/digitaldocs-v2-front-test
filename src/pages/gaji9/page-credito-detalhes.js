import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, setModal, getSuccess, createItem } from '../../redux/slices/gaji9';
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
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import AcessoGaji9 from './acesso-gaji9';
import CreditForm, { PreviewForm } from '../../sections/gaji9/form-credito';
import InfoCredito, { TableInfoCredito } from '../../sections/gaji9/info-credito';

// ----------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('Dados');
  const { credito, isLoading, modalGaji9, isLoadingDoc, previewFile, utilizador, selectedItem, done } = useSelector(
    (state) => state.gaji9
  );

  useEffect(() => {
    dispatch(getSuccess({ item: 'credito', dados: null }));
    if (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO']))
      dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, utilizador, id]);

  const tabsList = [
    { value: 'Dados', component: <InfoCredito /> },
    { value: 'Participantes', component: <TableInfoCredito id={credito?.id} dados={credito?.participantes} /> },
    { value: 'Contratos', component: <TableInfoCredito id={credito?.id} contracts /> },
  ];

  const openForm = (item) => {
    dispatch(setModal({ item, dados: null }));
  };

  const closeForm = () => {
    dispatch(setModal({ item: '', dados: null }));
  };

  useNotificacao({ done, afterSuccess: () => closeForm() });

  return (
    <Page title="Estado | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
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
            (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO'])) &&
            !!credito?.ativo && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Dados' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['UPDATE_CREDITO'])) && (
                    <DefaultAction label="EDITAR" handleClick={() => openForm('form-credito')} />
                  )}
                {currentTab === 'Participantes' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['CREATE_CREDITO'])) && (
                    <DefaultAction button label="Adicionar" handleClick={() => openForm('form-participante')} />
                  )}
                {currentTab === 'Contratos' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['CREATE_CONTRATO'])) && (
                    <DefaultAction
                      button
                      icon="pdf"
                      label="Previsualizar contrato"
                      handleClick={() => openForm('preview-contrato')}
                    />
                  )}
              </Stack>
            )
          }
        />

        <AcessoGaji9 item="credito">
          {!isLoading && !credito ? (
            <SearchNotFound404 message="Crédito não encontrado..." />
          ) : (
            <>
              <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>

              {(isLoadingDoc || previewFile) && (
                <DialogPreviewDoc
                  url={previewFile}
                  isLoading={isLoadingDoc}
                  titulo={selectedItem?.titulo}
                  onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
                  extra={
                    previewFile && selectedItem?.titulo?.includes('Previsualização de contrato: Cliente') ? (
                      <DefaultAction
                        button
                        variant="contained"
                        label="GERAR CONTRATO"
                        handleClick={() =>
                          dispatch(
                            createItem('contratos', null, { getList: true, ...selectedItem, msg: 'Contrato gerado' })
                          )
                        }
                      />
                    ) : null
                  }
                />
              )}

              {modalGaji9 === 'preview-contrato' && <PreviewForm onCancel={closeForm} />}
              {modalGaji9 === 'form-credito' && <CreditForm isEdit dados={credito} onCancel={closeForm} />}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
