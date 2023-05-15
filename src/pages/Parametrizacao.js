import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import SchemaOutlinedIcon from '@mui/icons-material/SchemaOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import { Tab, Box, Card, Tabs, Container, Typography } from '@mui/material';
import ModeStandbyOutlinedIcon from '@mui/icons-material/ModeStandbyOutlined';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
// utils
import selectTab from '../utils/selectTab';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { useSelector } from '../redux/store';
// components
import Page from '../components/Page';
import SvgIconStyle from '../components/SvgIconStyle';
// sections
import Linhas from '../sections/parametrizacao/Linhas';
import Fluxos from '../sections/parametrizacao/Fluxos';
import Origens from '../sections/parametrizacao/Origens';
import Estados from '../sections/parametrizacao/Estados';
import Acessos from '../sections/parametrizacao/Acessos';
import MotivosPendencias from '../sections/parametrizacao/MotivosPendencias';

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

const RootStyle = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.primary.main, 1),
}));

// ----------------------------------------------------------------------

export default function Parametrizacao() {
  const { themeStretch } = useSettings();
  const { meusacessos } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useSearchParams({ tab: 'acessos', filter: '' });
  const isAdmin = meusacessos?.includes('Todo-111') || meusacessos?.includes('Todo-110');
  const acessoMotivosPendencias = isAdmin;
  const acessoFluxos = isAdmin || meusacessos?.includes('fluxo-110') || meusacessos?.includes('fluxo-110');
  const acessoOrigens = isAdmin || meusacessos?.includes('origem-110') || meusacessos?.includes('origem-110');
  const acessoEstados = isAdmin || meusacessos?.includes('estado-110') || meusacessos?.includes('estado-110');
  const acessoAcessos =
    isAdmin ||
    meusacessos?.includes('acesso-110') ||
    meusacessos?.includes('acesso-110') ||
    meusacessos?.includes('perfilestado-110') ||
    meusacessos?.includes('perfilestado-110');

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue, filter: currentTab?.get('filter') || '' });
  };

  const acessos = useMemo(
    () =>
      acessoAcessos
        ? [{ value: 'acessos', label: 'Acessos', icon: <GroupAddOutlinedIcon />, component: <Acessos /> }]
        : [],
    [acessoAcessos]
  );

  const fluxos = useMemo(
    () =>
      acessoFluxos ? [{ value: 'fluxos', label: 'Fluxos', icon: <SchemaOutlinedIcon />, component: <Fluxos /> }] : [],
    [acessoFluxos]
  );

  const origens = useMemo(
    () =>
      acessoOrigens
        ? [{ value: 'origens', label: 'Origens', icon: <CorporateFareOutlinedIcon />, component: <Origens /> }]
        : [],
    [acessoOrigens]
  );

  const estados = useMemo(
    () =>
      acessoEstados
        ? [
            {
              value: 'estados',
              label: 'Estados',
              component: <Estados />,
              icon: <SvgIconStyle src={`/assets/icons/navbar/state.svg`} />,
            },
          ]
        : [],
    [acessoEstados]
  );

  const motivosPendencias = useMemo(
    () =>
      acessoMotivosPendencias
        ? [
            {
              value: 'motivospendencias',
              label: 'Motivos pendências',
              icon: <ModeStandbyOutlinedIcon />,
              component: <MotivosPendencias />,
            },
            {
              value: 'linhasCredito',
              label: 'Linhas crédito',
              icon: <CreditScoreOutlinedIcon />,
              component: <Linhas />,
            },
          ]
        : [],
    [acessoMotivosPendencias]
  );

  const VIEW_TABS = useMemo(
    () => [...acessos, ...fluxos, ...estados, ...origens, ...motivosPendencias] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fluxos]
  );

  useEffect(() => {
    if (currentTab.get('tab') !== selectTab(VIEW_TABS, currentTab.get('tab'))) {
      setCurrentTab({ tab: VIEW_TABS?.[0]?.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VIEW_TABS]);

  return (
    <Page title="Parametrização | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <RootStyle>
            <Box sx={{ px: 2, py: 1, color: 'common.white', textAlign: { md: 'left' } }}>
              <Typography variant="h4">Parametrização</Typography>
            </Box>
          </RootStyle>

          <TabsWrapperStyle>
            <Tabs
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={handleChangeTab}
              value={currentTab.get('tab')}
            >
              {VIEW_TABS.map((tab) => (
                <Tab
                  disableRipple
                  key={tab.value}
                  icon={tab.icon}
                  value={tab.value}
                  label={tab.label}
                  sx={{ px: 0.5, typography: 'subtitle2' }}
                />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        {VIEW_TABS.map((tab) => {
          const isMatched = tab.value === currentTab.get('tab');
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
