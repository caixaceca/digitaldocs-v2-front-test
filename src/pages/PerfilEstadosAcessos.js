import { useParams, useSearchParams } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Tab, Tabs, Grid, Card, Container } from '@mui/material';
// redux
import { useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { SearchNotFound404 } from '../components/table';
// sections
import PerfilCover from '../sections/sobre/PerfilCover';
import AcessosPerfil from '../sections/parametrizacao/AcessosPerfil';
import EstadosPerfil from '../sections/parametrizacao/EstadosPerfil';

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

export default function PerfilEstadosAcessos() {
  const { id } = useParams();
  const { themeStretch } = useSettings();
  const { colaboradores } = useSelector((state) => state.colaborador);
  const [currentTab, setCurrentTab] = useSearchParams({ tab: 'acessos' });
  const colaborador = colaboradores?.find((row) => Number(row?.perfil?.id) === Number(id));

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue });
  };

  const TABS = [
    { value: 'acessos', label: 'Acessos', component: <AcessosPerfil /> },
    { value: 'estados', label: 'Estados ', component: <EstadosPerfil /> },
  ];

  return (
    <Page title="Perfil do colaborador">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 170, position: 'relative' }}>
          <PerfilCover perfilColaborador={colaborador} />
          <TabsWrapperStyle>
            <Tabs value={currentTab.get('tab')} scrollButtons="auto" variant="scrollable" onChange={handleChangeTab}>
              {TABS.map((tab) => (
                <Tab disableRipple key={tab.value} value={tab.value} label={tab.label} sx={{ px: 1 }} />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>
        {!colaborador ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Colaborador não encontrado..." />
          </Grid>
        ) : (
          TABS.map((tab) => {
            const isMatched = tab.value === currentTab.get('tab');
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })
        )}
      </Container>
    </Page>
  );
}
