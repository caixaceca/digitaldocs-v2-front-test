import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
//
import useSettings from '../../hooks/useSettings';
import { usePermissao } from '../../hooks/useAcesso';
import { PATH_DIGITALDOCS } from '../../routes/paths';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, setModal, getSuccess, deleteItem } from '../../redux/slices/gaji9';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFound404 } from '../../components/table';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import DialogPreviewDoc, { DialogConfirmar } from '../../components/CustomDialog';
// sections
import AcessoGaji9 from './acesso-gaji9';
import InfoCredito from '../../sections/gaji9/credito/info-credito';
import { TableInfoCredito } from '../../sections/gaji9/credito/table-info';
import CreditoForm, { PreviewForm } from '../../sections/gaji9/credito/form-credito';
import MetadadosCredito from '../../sections/processo/info-credito/metadados-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageCreditoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { temPermissao, isGerente } = usePermissao();
  const [currentTab, setCurrentTab] = useState('Caracterização');
  const permissao = isGerente || temPermissao(['READ_CREDITO']);

  const { credito, previewFile, selectedItem, isLoading, isLoadingDoc, modalGaji9, isSaving } = useSelector(
    (state) => state.gaji9
  );
  const contratado = useMemo(() => !!credito?.contratado, [credito?.contratado]);

  useEffect(() => {
    dispatch(getSuccess({ item: 'credito', dados: null }));
    if (id && permissao) dispatch(getFromGaji9('credito', { id }));
  }, [dispatch, id, permissao]);

  const tabsList = [
    { value: 'Caracterização', component: <InfoCredito /> },
    {
      value: 'Metadados',
      component: credito?.metadados ? (
        <MetadadosCredito dados={credito?.metadados} />
      ) : (
        <Card sx={{ p: 3 }}>
          <MetadadosCredito dados={credito?.metadados} />
        </Card>
      ),
    },
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

  const openForm = (item) => dispatch(setModal({ item: item || '', dados: null }));

  const onClose = () => {
    openForm('', null);
    navigate(`${PATH_DIGITALDOCS.gaji9.root}`);
  };

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
          heading={currentTab === 'Caracterização' ? 'Detalhes do crédito' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJ-i9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: currentTab === 'Caracterização' ? 'Detalhes do crédito' : currentTab },
          ]}
          action={
            credito?.ativo &&
            !credito?.contratado &&
            permissao && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Caracterização' && (isGerente || temPermissao(['UPDATE_CREDITO'])) && (
                  <>
                    <DefaultAction small button label="Editar" onClick={() => openForm('form-credito')} />
                    <DefaultAction small button label="Eliminar" onClick={() => openForm('eliminar-credito')} />
                  </>
                )}
                {currentTab === 'Intervenientes' && (isGerente || temPermissao(['CREATE_CREDITO'])) && (
                  <DefaultAction small button label="Adicionar" onClick={() => openForm('form-interveniente')} />
                )}
                {currentTab === 'Contratos' && (isGerente || temPermissao(['READ_CONTRATO'])) && (
                  <DefaultAction small button label="Pré-visualizar" onClick={() => openForm('preview-contrato')} />
                )}
                {currentTab === 'Contratos' && (isGerente || temPermissao(['CREATE_CONTRATO'])) && (
                  <DefaultAction small button label="Gerar contrato" onClick={() => openForm('gerar-contrato')} />
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
              <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>

              {(isLoadingDoc || previewFile) && (
                <DialogPreviewDoc
                  onClose={() => {
                    openForm('', null);
                    dispatch(getSuccess({ item: 'previewFile', dados: '' }));
                  }}
                  params={{ url: previewFile, titulo: selectedItem?.titulo, isLoading: isLoadingDoc }}
                />
              )}

              {modalGaji9 === 'form-credito' && <CreditoForm onClose={() => openForm()} />}

              {(modalGaji9 === 'preview-contrato' || modalGaji9 === 'gerar-contrato') && (
                <PreviewForm item={modalGaji9} onClose={() => openForm()} />
              )}

              {modalGaji9 === 'eliminar-credito' && (
                <DialogConfirmar
                  isSaving={isSaving}
                  desc="eliminar este crédito"
                  onClose={() => openForm('', null)}
                  handleOk={() => dispatch(deleteItem('credito', { id, msg: 'Crédito eliminado', onClose }))}
                />
              )}
            </>
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
