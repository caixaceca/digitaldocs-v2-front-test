import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { acessoGaji9 } from '../../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
// hooks
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
import { PreviewForm } from '../../sections/gaji9/form-minuta';
import InfoMinuta, { TableInfoMinuta } from '../../sections/gaji9/info-minuta';

// ----------------------------------------------------------------------

export default function PageMinutaDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [action, setAction] = useState('');
  const [currentTab, setCurrentTab] = useState('Dados');
  const { minuta, isLoading, isLoadingDoc, isOpenModal, previewFile, adminGaji9, utilizador } = useSelector(
    (state) => state.gaji9
  );

  useEffect(() => {
    dispatch(getSuccess({ item: 'minuta', dados: null }));
    if (adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_MINUTA'])) dispatch(getFromGaji9('minuta', { id }));
  }, [dispatch, adminGaji9, utilizador, id]);

  const handleClose = () => {
    setAction('');
    dispatch(closeModal());
  };

  const handleAction = (item) => {
    setAction(item);
    dispatch(openModal(''));
  };

  const tabsList = [
    { value: 'Dados', component: <InfoMinuta onClose={handleClose} /> },
    {
      value: 'Cláusulas',
      component: (
        <Card sx={{ p: 1, height: 1 }}>
          <TableInfoMinuta item="clausulaMinuta" onClose={handleClose} />
        </Card>
      ),
    },
  ];

  return (
    <Page title="Minuta | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
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
            !!minuta &&
            (adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_MINUTA'])) && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {minuta?.clausulas?.length > 0 && currentTab !== 'Tipos de garantia' && (
                  <DefaultAction button label="Pré-visualizar" onClick={() => handleAction('preview')} />
                )}
              </Stack>
            )
          }
        />

        <AcessoGaji9 item="minuta">
          {!isLoading && !minuta ? (
            <SearchNotFound404 message="Minuta não encontrada..." />
          ) : (
            <>
              <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
              {isOpenModal && action === 'preview' && <PreviewForm onClose={() => handleClose()} id={id} />}
            </>
          )}

          {(isLoadingDoc || previewFile) && (
            <DialogPreviewDoc
              params={{
                url: previewFile,
                isLoading: isLoadingDoc,
                titulo: `MINUTA: ${minuta?.titulo} - ${minuta?.subtitulo}`,
              }}
              onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
            />
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
