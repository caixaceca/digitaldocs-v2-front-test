import { useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { SearchNotFound404 } from '../../components/table';
// sections
import PerfilCover from '../../sections/sobre/PerfilCover';
import TableAcessos from '../../sections/parametrizacao/TableAcessos';

// ----------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: { justifyContent: 'center' },
  [theme.breakpoints.up('md')]: { justifyContent: 'flex-end', paddingRight: theme.spacing(3) },
}));

// ----------------------------------------------------------------------

export default function PageAcessosPerfil() {
  const { id } = useParams();
  const { themeStretch } = useSettings();
  const { colaboradores } = useSelector((state) => state.intranet);
  const colaborador = colaboradores?.find((row) => Number(row?.perfil?.id) === Number(id));
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabAcesso') || 'Acessos');

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabAcesso', newValue);
  };

  const TABS = [
    { value: 'Acessos', component: <TableAcessos tab="acessos" /> },
    { value: 'Estados', component: <TableAcessos tab="estados" /> },
  ];

  return (
    <Page title="Perfil do colaborador">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 170, position: 'relative' }}>
          <PerfilCover perfilColaborador={colaborador} />
          <TabsWrapperStyle>
            <Tabs value={currentTab} scrollButtons="auto" variant="scrollable" onChange={handleChangeTab}>
              {TABS.map((tab) => (
                <Tab disableRipple key={tab?.value} value={tab?.value} label={tab?.value} sx={{ px: 0.5 }} />
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
