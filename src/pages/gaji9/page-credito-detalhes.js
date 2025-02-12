import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { acessoGaji9, gestaoContrato } from '../../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, createItem, openModal, closeModal } from '../../redux/slices/gaji9';
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
import CreditForm, { PreviewForm } from '../../sections/gaji9/form-credito';
import InfoCredito, { TableInfoCredito } from '../../sections/gaji9/info-credito';

// ----------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [form, setSetForm] = useState('');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabInfoCredito') || 'Dados');
  const { credito, isLoading, isOpenModal, isLoadingDoc, previewFile, utilizador, selectedItem, done, error } =
    useSelector((state) => state.gaji9);

  useEffect(() => {
    if (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO']))
      dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, utilizador, id]);

  const tabsList = [
    { value: 'Dados', component: <InfoCredito /> },
    { value: 'Participantes', component: <TableInfoCredito id={credito?.id} dados={credito?.participantes} /> },
    {
      value: 'Contratos',
      component: <TableInfoCredito id={credito?.id} dados={credito?.participantes} contracts={form || 'noform'} />,
    },
  ];

  const openForm = (action) => {
    setSetForm(action);
    dispatch(openModal());
  };

  const closeForm = () => {
    setSetForm('');
    dispatch(closeModal());
  };

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
            (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['READ_CREDITO'])) &&
            !!credito?.ativo && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Dados' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['UPDATE_CREDITO'])) && (
                    <DefaultAction label="EDITAR" color="warning" handleClick={() => openForm('credito')} />
                  )}
                {currentTab === 'Participantes' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['CREATE_CREDITO'])) && (
                    <DefaultAction button icon="adicionar" label="Fiadores" handleClick={() => dispatch(openModal())} />
                  )}
                {currentTab === 'Contratos' &&
                  (gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, ['CREATE_CONTRATO'])) && (
                    <DefaultAction
                      button
                      icon="pdf"
                      label="Previsualizar contrato"
                      handleClick={() => openForm('contrato')}
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
              {tabsList.map((tab) => {
                const isMatched = tab.value === currentTab;
                return isMatched && <Box key={tab.value}>{tab.component}</Box>;
              })}

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

              {isOpenModal && form === 'contrato' && <PreviewForm onCancel={closeForm} />}
              {isOpenModal && form === 'credito' && <CreditForm isEdit dados={credito} onCancel={closeForm} />}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
