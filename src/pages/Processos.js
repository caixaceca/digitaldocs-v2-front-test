import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Badge, Container, Typography } from '@mui/material';
// utils
import selectTab from '../utils/selectTab';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// components
import Page from '../components/Page';
// sections
import TableProcessos from '../sections/digitaldocs/TableProcessos';

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

export default function Processos() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const [currentTab, setCurrentTab] = useSearchParams({ tab: 'minhastarefas', filter: '' });
  const { meusProcessos, meuAmbiente, meuFluxo } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && currentColaborador?.perfil_id) {
      dispatch(
        getAll('meusprocessos', {
          mail,
          fluxoId: meuFluxo?.id,
          estadoId: meuAmbiente?.id,
          perfilId: currentColaborador?.perfil_id,
        })
      );
    }
  }, [dispatch, mail, meuAmbiente?.id, meuFluxo?.id, currentColaborador?.perfil_id, currentTab]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue });
  };

  const outros = meuFluxo?.is_interno
    ? [
        {
          value: 'agendados',
          label: 'Agendados',
          component: <TableProcessos from="agendados" />,
          num: meusProcessos?.totalagendado || 0,
        },
      ]
    : [
        {
          value: 'finalizados',
          label: 'Finalizados',
          component: <TableProcessos from="finalizados" />,
          num: meusProcessos?.totalfinalizado || 0,
        },
        {
          value: 'executados',
          label: 'Executados',
          component: <TableProcessos from="executados" />,
          num: meusProcessos?.totalexecutado || 0,
        },
      ];

  const VIEW_TABS = useMemo(
    () =>
      [
        {
          value: 'minhastarefas',
          label: 'Tarefas da equipa',
          component: <TableProcessos from="minhastarefas" />,
          num: meusProcessos?.total || 0,
        },
        {
          value: 'meuspendentes',
          label: 'Tarefas pendentes',
          component: <TableProcessos from="meuspendentes" />,
          num: meusProcessos?.totalpendente || 0,
        },
        {
          value: 'devolvidosEquipa',
          label: 'Devolvidos da equipa',
          component: <TableProcessos from="devolvidosEquipa" />,
          num: meusProcessos?.totaldevolvido || 0,
        },
        {
          value: 'devolvidosPessoal',
          label: 'Devolvidos pessoal',
          component: <TableProcessos from="devolvidosPessoal" />,
          num: meusProcessos?.totaldevolvidop || 0,
        },
        ...outros,
      ] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outros]
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
              <Typography variant="h4">Processos</Typography>
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
                <Tab
                  disableRipple
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Badge
                      showZero
                      max={999}
                      badgeContent={tab.num}
                      color={
                        (tab.value === 'meuspendentes' && 'warning') ||
                        ((tab.value === 'devolvidosEquipa' || tab.value === 'devolvidosPessoal') && 'error') ||
                        'success'
                      }
                      sx={{
                        ml: 0.5,
                        mr: (tab.num < 100 && 3.5) || (tab.num < 1000 && 4.5) || 5.5,
                        '& .MuiBadge-badge': {
                          top: 10,
                          padding: '0 4px',
                          color: 'common.white',
                          right: (tab.num > 999 && -25) || (tab.num > 99 && -20) || -15,
                        },
                      }}
                    >
                      {tab.label}
                    </Badge>
                  }
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
