import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Container, Typography } from '@mui/material';
// utils
import selectTab from '../utils/selectTab';
// routes
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
// sections
import TableEntradas from '../sections/digitaldocs/TableEntradas';
import TablePorConcluir from '../sections/digitaldocs/TablePorConcluir';
import TableTrabalhados from '../sections/digitaldocs/TableTrabalhados';

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
  backgroundColor: alpha(theme.palette.primary.main, 1),
  width: '100%',
  height: '100%',
}));

// ----------------------------------------------------------------------

export default function Controle() {
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useSearchParams({ tab: 'minhastarefas', filter: '' });

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue });
  };

  const VIEW_TABS = useMemo(
    () =>
      [
        { value: 'entradas', label: 'Entradas', component: <TableEntradas /> },
        { value: 'porconcluir', label: 'Por concluir', component: <TablePorConcluir /> },
        { value: 'trabalhados', label: 'Trabalhados', component: <TableTrabalhados /> },
      ] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (currentTab.get('tab') !== selectTab(VIEW_TABS, currentTab.get('tab'))) {
      setCurrentTab({ tab: VIEW_TABS?.[0]?.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VIEW_TABS]);

  return (
    <Page title="Processos | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <RootStyle>
            <Box sx={{ px: 2, py: 1, color: 'common.white', textAlign: { md: 'left' } }}>
              <Typography variant="h4">Controle</Typography>
            </Box>
          </RootStyle>

          <TabsWrapperStyle>
            <Tabs
              value={currentTab.get('tab')}
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={handleChangeTab}
            >
              {VIEW_TABS.map((tab) => (
                <Tab disableRipple key={tab.value} value={tab.value} label={tab.label} sx={{ px: 0.5 }} />
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
