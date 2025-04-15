import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { actionAcessoGaji9 } from '../../utils/validarAcesso';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, setModal, getSuccess, deleteItem } from '../../redux/slices/gaji9';
// routes
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFound404 } from '../../components/table';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import DialogPreviewDoc, { DialogConfirmar } from '../../components/CustomDialog';
// sections
import AcessoGaji9 from './acesso-gaji9';
import CreditoForm, { PreviewForm } from '../../sections/gaji9/form-credito';
import InfoCredito, { TableInfoCredito } from '../../sections/gaji9/info-credito';

// ----------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('Dados');
  const { credito, previewFile, utilizador, selectedItem, isLoading, isLoadingDoc, modalGaji9, isSaving, done } =
    useSelector((state) => state.gaji9);
  const contratado = useMemo(() => !!credito?.contratado, [credito?.contratado]);

  useEffect(() => {
    dispatch(getSuccess({ item: 'credito', dados: null }));
    if (id && actionAcessoGaji9(utilizador, ['READ_CREDITO'])) dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, id, utilizador]);

  const tabsList = [
    { value: 'Dados', component: <InfoCredito /> },
    {
      value: 'Garantias',
      component: <TableInfoCredito dados={credito?.garantias} params={{ id, tab: 'garantias', contratado }} />,
    },
    {
      value: 'Intervenientes',
      component: <TableInfoCredito dados={credito?.participantes} params={{ id, tab: 'intervenientes', contratado }} />,
    },
    { value: 'Contratos', component: <TableInfoCredito params={{ id, tab: 'contratos', contratado }} /> },
  ];

  const openForm = (item) => {
    dispatch(setModal({ item: item || '', dados: null }));
  };

  useNotificacao({ done, afterSuccess: () => openForm() });

  return (
    <Page title="Crédito | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
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
            credito?.ativo &&
            !credito?.contratado &&
            actionAcessoGaji9(utilizador, ['READ_CREDITO']) && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Dados' && actionAcessoGaji9(utilizador, ['UPDATE_CREDITO']) && (
                  <>
                    <DefaultAction button label="Editar" onClick={() => openForm('form-credito')} />
                    <DefaultAction button label="Eliminar" onClick={() => openForm('eliminar-credito')} />
                  </>
                )}
                {currentTab === 'Intervenientes' && actionAcessoGaji9(utilizador, ['CREATE_CREDITO']) && (
                  <DefaultAction button label="Adicionar" onClick={() => openForm('form-interveniente')} />
                )}
                {currentTab === 'Contratos' && actionAcessoGaji9(utilizador, ['READ_CONTRATO']) && (
                  <DefaultAction button label="Pré-visualizar" onClick={() => openForm('preview-contrato')} />
                )}
                {currentTab === 'Contratos' && actionAcessoGaji9(utilizador, ['CREATE_CONTRATO']) && (
                  <DefaultAction button label="Gerar contrato" onClick={() => openForm('gerar-contrato')} />
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
                  onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
                  params={{ url: previewFile, titulo: selectedItem?.titulo, isLoading: isLoadingDoc }}
                />
              )}

              {modalGaji9 === 'form-credito' && <CreditoForm onCancel={openForm} />}
              {(modalGaji9 === 'preview-contrato' || modalGaji9 === 'gerar-contrato') && (
                <PreviewForm item={modalGaji9} onCancel={openForm} />
              )}
              {modalGaji9 === 'eliminar-credito' && (
                <DialogConfirmar
                  isSaving={isSaving}
                  desc="eliminar este crédito"
                  onClose={() => openForm('', null)}
                  handleOk={() => {
                    const afterSuccess = () => navigate(`${PATH_DIGITALDOCS.gaji9.root}`);
                    dispatch(deleteItem('credito', { id, msg: 'Crédito eliminado', afterSuccess }));
                  }}
                />
              )}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
