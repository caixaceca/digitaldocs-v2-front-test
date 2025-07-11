import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatObject';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { TabsWrapperStyle } from '../../components/Panel';
import { SearchNotFound404 } from '../../components/table';
// sections
import PerfilCover from '../../sections/sobre/PerfilCover';
import TableAcessos from '../../sections/parametrizacao/TableAcessos';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageAcessosPerfil() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const colaborador = colaboradores?.find(({ perfil_id: pid }) => Number(pid) === Number(id));
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabAcesso') || 'Acessos');

  useEffect(() => {
    if (id && perfilId) dispatch(getFromParametrizacao('acessos', { perfilId: id, reset: { val: [] } }));
    if (id && perfilId) dispatch(getFromParametrizacao('estadosPerfil', { estadoId: id, reset: { val: [] } }));
  }, [dispatch, perfilId, id]);

  const TABS = [
    { value: 'Acessos', component: <TableAcessos tab="acessos" /> },
    { value: 'Estados', component: <TableAcessos tab="estados" /> },
  ];

  return (
    <Page title="Perfil do colaborador | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 170, position: 'relative' }}>
          <PerfilCover colaborador={colaborador} />
          <TabsWrapperStyle>
            <Tabs value={currentTab} onChange={(_, val) => setItemValue(val, setCurrentTab, 'tabAcesso', false)}>
              {TABS.map(({ value }) => (
                <Tab key={value} value={value} label={value} sx={{ py: 1.5, mt: 0.5, px: 0.64 }} />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>
        {colaborador ? (
          <Box>{TABS?.find((tab) => tab?.value === currentTab)?.component}</Box>
        ) : (
          <SearchNotFound404 message="Colaborador não encontrado..." />
        )}
      </Container>
    </Page>
  );
}
