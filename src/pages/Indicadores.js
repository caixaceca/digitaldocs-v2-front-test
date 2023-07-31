import { useEffect, useState } from 'react';

// @mui
import { alpha, styled } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Container, Typography } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getAll, resetItem } from '../redux/slices/digitaldocs';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
// sections
import EstatisticaCredito from '../sections/indicadores/EstatisticaCredito';
import { TotalProcessos, Duracao, FileSystem, Execucao } from '../sections/indicadores/Indicadores';

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

export default function Indicadores() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meusacessos } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useState(meusacessos.includes('Todo-111') ? 'files' : 'total');

  const handleChangeTab = (event, newValue) => {
    dispatch(resetItem('indicadores'));
    setCurrentTab(newValue);
  };

  const tabFiles = meusacessos.includes('Todo-111')
    ? [{ value: 'files', label: 'Ficheiros', component: <FileSystem /> }]
    : [meusacessos];

  const tabs = [
    ...tabFiles,
    { value: 'total', label: 'Total de processos', component: <TotalProcessos /> },
    { value: 'duracao', label: 'Duração', component: <Duracao /> },
    { value: 'execucao', label: 'Tempo execução', component: <Execucao /> },
    { value: 'estatistica', label: 'Estatística de crédito', component: <EstatisticaCredito /> },
  ];

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('ambientes', { mail, perfilId: cc?.perfil_id }));
      dispatch(getAll('meusacessos', { mail, perfilId: cc?.perfil_id }));
      dispatch(getAll('motivos pendencias', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc, mail]);

  // const handleNotificationClick = () => {
  //   if (Notification.permission === 'granted') {
  //     const notification = new Notification('Título da Notificação', {
  //       body: 'Corpo da notificação aqui',
  //       icon: '/favicon/favicon.ico',
  //     });

  //     notification.onclick = () => {
  //       window.location.href = 'http://localhost:3000';
  //     };
  //   } else if (Notification.permission !== 'denied') {
  //     Notification.requestPermission().then((permission) => {
  //       if (permission === 'granted') {
  //         handleNotificationClick();
  //       }
  //     });
  //   }
  // };

  return (
    <Page title="Indicadores | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* <Button onClick={handleNotificationClick}>Enviar Notificação</Button> */}
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <RootStyle>
            <Box sx={{ px: 2, py: 1, color: 'common.white', textAlign: { md: 'left' } }}>
              <Typography variant="h4">Indicadores</Typography>
            </Box>
          </RootStyle>
          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
              scrollButtons="auto"
              variant="scrollable"
              allowScrollButtonsMobile
              onChange={handleChangeTab}
            >
              {tabs.map((tab) => (
                <Tab disableRipple key={tab.value} value={tab.value} label={tab.label} sx={{ px: 0.5 }} />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        {tabs.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
