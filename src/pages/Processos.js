import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Badge, Container, Typography } from '@mui/material';
// utils
import selectTab from '../utils/selectTab';
import { paramsObject } from '../utils/normalizeText';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// components
import Page from '../components/Page';
// sections
import { TableProcessos } from '../sections/tabela';

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

export default function Processos() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const [currentTab, setCurrentTab] = useSearchParams({
    tab: 'tarefas',
    filter: '',
    segmento: '',
    colaborador: cc?.perfil?.displayName,
  });
  const { meusProcessos, meuAmbiente, meusAmbientes, meuFluxo } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && cc?.perfil_id) {
      dispatch(
        getAll('meusprocessos', { mail, fluxoId: meuFluxo?.id, estadoId: meuAmbiente?.id, perfilId: cc?.perfil_id })
      );
    }
  }, [dispatch, mail, meuAmbiente?.id, meuFluxo?.id, cc?.perfil_id, currentTab]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue, ...paramsObject(currentTab) });
  };

  const acessoAgendados = () => {
    let temAcesso = false;
    meusAmbientes?.forEach((row) => {
      if (row?.nome === 'Validação OPE' || row?.nome === 'Execução OPE') {
        temAcesso = true;
      }
    });
    return temAcesso;
  };

  const acessoFinalizadosExecutados = () => {
    let temAcesso = false;
    meusAmbientes?.forEach((row) => {
      if (row?.nome === 'DOP - Validação Notas Externas' || row?.nome === 'DOP - Execução Notas Externas') {
        temAcesso = true;
      }
    });
    return temAcesso;
  };

  const agendados = acessoAgendados()
    ? [
        {
          value: 'agendados',
          label: 'Agendados',
          num: meusProcessos?.totalagendado || 0,
          component: <TableProcessos from="agendados" />,
        },
      ]
    : [];

  const finalizados =
    acessoFinalizadosExecutados() && meusProcessos?.totalfinalizado > 0
      ? [
          {
            value: 'finalizados',
            label: 'Finalizados',
            num: meusProcessos?.totalfinalizado || 0,
            component: <TableProcessos from="finalizados" />,
          },
        ]
      : [];

  const executados =
    acessoFinalizadosExecutados() && meusProcessos?.totalexecutado > 0
      ? [
          {
            value: 'executados',
            label: 'Executados',
            num: meusProcessos?.totalexecutado || 0,
            component: <TableProcessos from="executados" />,
          },
        ]
      : [];

  const VIEW_TABS = useMemo(
    () =>
      [
        {
          value: 'tarefas',
          label: 'Tarefas',
          num: meusProcessos?.total || 0,
          component: <TableProcessos from="tarefas" />,
        },
        {
          value: 'retidos',
          label: 'Retidos',
          num: meusProcessos?.totalpendenteEQ || 0,
          component: <TableProcessos from="retidos" />,
        },
        {
          value: 'pendentes',
          label: 'Pendentes',
          num: meusProcessos?.totalpendencias || 0,
          component: <TableProcessos from="pendentes" />,
        },
        {
          value: 'atribuidos',
          label: 'Atribuídos',
          num: meusProcessos?.totalafetosEQ || 0,
          component: <TableProcessos from="atribuidos" />,
        },
        ...agendados,
        ...finalizados,
        ...executados,
      ] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agendados, finalizados, executados]
  );

  useEffect(() => {
    if (currentTab.get('tab') !== selectTab(VIEW_TABS, currentTab.get('tab'))) {
      setCurrentTab({ tab: VIEW_TABS?.[0]?.value, ...paramsObject(currentTab) });
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
                        (tab.value === 'retidos' && 'warning') ||
                        (tab.value === 'pendentes' && 'focus') ||
                        (tab.value === 'atribuidos' && 'info') ||
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
