import { useEffect, useState } from 'react';
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
import { getFromGaji9, setModal, deleteItem } from '../../redux/slices/gaji9';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFound404 } from '../../components/table';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import AcessoGaji9 from './acesso-gaji9';
import { DialogConfirmar } from '../../components/CustomDialog';
import { DetalhesContent } from '../../sections/gaji9/detalhes-gaji9';
import ClausulaForm from '../../sections/gaji9/clausulas/form-clausula';
import { NumerosClausula, RelacionadosCl } from '../../sections/gaji9/clausulas/opcoes-clausulas';
import { SegmentosForm, TiposTitularesForm, CondicionalForm } from '../../sections/gaji9/clausulas/form-opcoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageDetalhesClausula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { temPermissao } = usePermissao();
  const permissao = temPermissao(['READ_CLAUSULA']);
  const [currentTab, setCurrentTab] = useState('Dados');

  const { clausula, isLoading, modalGaji9, selectedItem, done, isSaving } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (permissao) dispatch(getFromGaji9('clausula', { id, reset: { dados: null } }));
  }, [dispatch, id, permissao]);

  useEffect(() => {
    if (done === 'Cláusula eliminada') navigate(`${PATH_DIGITALDOCS.gaji9.root}`);
  }, [done, navigate]);

  const openModal = (item, dados, isEdit) => {
    dispatch(setModal({ item: item || '', dados: dados || null, isEdit: isEdit || false }));
  };

  const tabsList = [
    {
      value: 'Dados',
      component: (
        <Card sx={{ p: 3, pt: 1 }}>
          <DetalhesContent dados={clausula} item="clausula" />
        </Card>
      ),
    },
    { value: 'Números', component: <NumerosClausula dados={clausula?.alineas} id={id} /> },
    { value: 'Tipos de titular', component: <RelacionadosCl id={id} dados={clausula?.tipos_titulares} /> },
    { value: 'Segmentos', component: <RelacionadosCl item="Segmento" id={id} dados={clausula?.segmentos} /> },
    {
      value: 'Condicionais',
      component: <RelacionadosCl item="Condição" id={id} dados={clausula?.conteudos_condicionais || []} />,
    },
  ];

  const confirmDelete = () => {
    const itemDel =
      (modalGaji9 === 'eliminar-Segmento' && 'segmentoCl') ||
      (modalGaji9 === 'eliminar-Condição' && 'condicionalCl') ||
      (modalGaji9 === 'eliminar-Tipo de titular' && 'tipoTitularCl') ||
      'clausulas';
    const getItem = modalGaji9 === 'eliminar-clausula' ? '' : 'clausula';
    const msg = modalGaji9 === 'eliminar-clausula' ? 'Cláusula eliminada' : 'Item eliminado';
    dispatch(deleteItem(itemDel, { id, itemId: selectedItem, getItem, msg, onClose: () => openModal() }));
  };

  return (
    <Page title="Cláusula | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          voltar
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={clausula?.titulo || 'Detalhes da cláusula'}
        />

        <HeaderBreadcrumbs
          sx={{ px: 1 }}
          heading={currentTab === 'Dados' ? 'Detalhes da cláusula' : currentTab}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'GAJ-i9', href: PATH_DIGITALDOCS.gaji9.gestao },
            { name: currentTab === 'Dados' ? 'Detalhes da cláusula' : currentTab },
          ]}
          action={
            !!clausula &&
            temPermissao(['READ_CLAUSULA']) && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                {currentTab === 'Dados' && (
                  <>
                    <DefaultAction small label="CLONAR" onClick={() => openModal('clonar-clausula', clausula)} />
                    {clausula?.ativo && temPermissao(['UPDATE_CLAUSULA']) && (
                      <DefaultAction small label="EDITAR" onClick={() => openModal('form-clausula', clausula, true)} />
                    )}
                    <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-clausula', clausula)} />
                  </>
                )}
                {((clausula?.segmento_id && currentTab === 'Segmentos') ||
                  (clausula?.tipo_titular_id && currentTab === 'Tipos de titular') ||
                  (clausula?.alineas?.length > 0 && currentTab === 'Condicionais')) && (
                  <DefaultAction button small label="Adicionar" onClick={() => openModal(currentTab)} />
                )}
              </Stack>
            )
          }
        />

        <AcessoGaji9 item="clausula">
          {!isLoading && !clausula ? (
            <SearchNotFound404 message="Minuta não encontrada..." />
          ) : (
            <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
          )}

          {modalGaji9 === 'Condicionais' && <CondicionalForm onClose={() => openModal()} id={id} />}
          {modalGaji9 === 'Tipos de titular' && <TiposTitularesForm onClose={() => openModal()} id={id} />}
          {modalGaji9 === 'form-clausula' && <ClausulaForm onClose={() => openModal()} clausula={clausula} />}
          {modalGaji9 === 'clonar-clausula' && <ClausulaForm onClose={() => openModal()} clausula={clausula} />}
          {modalGaji9 === 'Segmentos' && <SegmentosForm onClose={() => openModal()} id={id} dados={clausula} />}
          {modalGaji9?.includes('eliminar-') && (
            <DialogConfirmar
              isSaving={isSaving}
              onClose={() => openModal()}
              handleOk={() => confirmDelete()}
              desc={`eliminar ${modalGaji9 === 'eliminar-clausula' ? 'esta cláusula' : 'este item'}`}
            />
          )}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
