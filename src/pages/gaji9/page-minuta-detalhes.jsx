import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
// utils
import { acessoGaji9 } from '../../utils/validarAcesso';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
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
import InfoMinuta, { TableInfoMinuta } from '../../sections/gaji9/info-minuta';
import MinutaForm, { ComposicaoForm, PublicarRevogarForm, PreviewForm } from '../../sections/gaji9/form-minuta';

// ----------------------------------------------------------------------

export default function PageMinutaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [action, setAction] = useState('');
  const [currentTab, setCurrentTab] = useState('Dados');
  const { minuta, isLoading, isLoadingDoc, isOpenModal, minutaId, previewFile, adminGaji9, utilizador, done } =
    useSelector((state) => state.gaji9);

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
    dispatch(openModal(item === 'update' ? 'update' : ''));
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

  useNotificacao({
    done,
    onClose: () => {
      if (!done?.includes('Regra')) handleClose();
      if (done === 'Minuta publicada' || done === 'Minuta revogada') navigate(PATH_DIGITALDOCS.gaji9.root);
      else if (done === 'Minuta clonada' || (done === 'Minuta versionada' && minutaId))
        navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${minutaId}`);
    },
  });

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
                {minuta?.ativo && (adminGaji9 || acessoGaji9(utilizador?.acessos, ['CREATE_MINUTA'])) && (
                  <>
                    {currentTab === 'Dados' && (
                      <>
                        <DefaultAction color="inherit" label="CLONAR" onClick={() => handleAction('Clonar')} />
                        {minuta?.em_analise && (
                          <>
                            <DefaultAction label="EDITAR" onClick={() => handleAction('Atualizar')} />
                            {minuta?.clausulas?.length > 0 && (
                              <DefaultAction label="PUBLICAR" onClick={() => handleAction('Publicar')} />
                            )}
                          </>
                        )}
                        {minuta?.em_vigor && (
                          <>
                            <DefaultAction label="VERSIONAR" onClick={() => handleAction('Versionar')} />
                            <DefaultAction label="REVOGAR" onClick={() => handleAction('Revogar')} />
                          </>
                        )}
                      </>
                    )}
                    {minuta?.em_analise && currentTab === 'Cláusulas' && (
                      <>
                        <DefaultAction button label="Adicionar" onClick={() => handleAction('compor')} />
                        {minuta?.clausulas?.length > 0 && (
                          <DefaultAction button label="Composição" onClick={() => handleAction('composicao')} />
                        )}
                      </>
                    )}
                  </>
                )}
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

              {isOpenModal && (
                <>
                  {(action === 'Atualizar' || action === 'Clonar' || action === 'Versionar') && (
                    <MinutaForm action={action} onClose={() => handleClose()} minuta={minuta} />
                  )}
                  {currentTab === 'Cláusulas' && (action === 'compor' || action === 'composicao') && (
                    <ComposicaoForm action={action} onClose={() => handleClose()} />
                  )}
                  {(action === 'Publicar' || action === 'Revogar') && (
                    <PublicarRevogarForm onClose={() => handleClose()} action={action} />
                  )}
                  {action === 'preview' && <PreviewForm onClose={() => handleClose()} id={id} />}
                </>
              )}
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
