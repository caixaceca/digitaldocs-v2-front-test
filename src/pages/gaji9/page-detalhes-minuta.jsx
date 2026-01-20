import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
//
import useSettings from '../../hooks/useSettings';
import { usePermissao } from '../../hooks/useAcesso';
import { PATH_DIGITALDOCS } from '../../routes/paths';
import { useTabsSync } from '../../hooks/minimal-hooks/use-tabs-sync';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
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

// ---------------------------------------------------------------------------------------------------------------------

export default function PageMinutaDetalhes() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { temPermissao } = usePermissao();
  const [action, setAction] = useState('');
  const permissao = temPermissao(['READ_MINUTA']);

  const { minuta, isLoading, isLoadingDoc, isOpenModal, previewFile } = useSelector((state) => state.gaji9);

  useEffect(() => {
    dispatch(getSuccess({ item: 'minuta', dados: null }));
    if (permissao) dispatch(getFromGaji9('minuta', { id }));
  }, [dispatch, id, permissao]);

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

  const [tab, setTab] = useTabsSync(tabsList, 'Dados', 'tab-detalhes-minuta');

  return (
    <Page title="Minuta | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
          tab={tab}
          setTab={setTab}
          tabsList={tabsList}
          title={minuta?.titulo || 'Detalhes da minuta'}
        />

        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={tab === 'Dados' ? 'Detalhes da minuta' : tab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJ-i9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: tab === 'Dados' ? 'Detalhes da minuta' : tab },
          ]}
          action={
            !!minuta &&
            temPermissao(['READ_MINUTA']) && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {minuta?.clausulas?.length > 0 && tab !== 'Tipos de garantia' && (
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
              <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
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
