import { useEffect, useState, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// utils
import selectTab from '../utils/selectTab';
import { colorLabel } from '../utils/getColorPresets';
import { pertencoAoEstado } from '../utils/validarAcesso';
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

// ----------------------------------------------------------------------

export default function Processos() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meusProcessos } = useSelector((state) => state.digitaldocs);
  const { meuAmbiente, meusAmbientes, meuFluxo } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabProcessos') || 'tarefas');
  const tab = localStorage.getItem('tabProcessos');

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && cc?.perfil_id) {
      dispatch(
        getAll('meusprocessos', { mail, fluxoId: meuFluxo?.id, estadoId: meuAmbiente?.id, perfilId: cc?.perfil_id })
      );
    }
  }, [dispatch, mail, meuAmbiente?.id, meuFluxo?.id, cc?.perfil_id, tab]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabProcessos', newValue);
  };

  const agendados = useMemo(
    () =>
      pertencoAoEstado(meusAmbientes, 'Validação OPE') || pertencoAoEstado(meusAmbientes, 'Execução OPE')
        ? [
            {
              value: 'agendados',
              label: 'Agendados',
              num: meusProcessos?.totalagendado || 0,
              component: <TableProcessos from="agendados" />,
            },
          ]
        : [],
    [meusAmbientes, meusProcessos?.totalagendado]
  );

  const finalizados = useMemo(
    () =>
      (pertencoAoEstado(meusAmbientes, 'DOP - Validação Notas Externas') ||
        pertencoAoEstado(meusAmbientes, 'DOP - Execução Notas Externas')) &&
      meusProcessos?.totalfinalizado > 0
        ? [
            {
              value: 'finalizados',
              label: 'Finalizados',
              num: meusProcessos?.totalfinalizado || 0,
              component: <TableProcessos from="finalizados" />,
            },
          ]
        : [],
    [meusAmbientes, meusProcessos?.totalfinalizado]
  );

  const executados = useMemo(
    () =>
      (pertencoAoEstado(meusAmbientes, 'DOP - Validação Notas Externas') ||
        pertencoAoEstado(meusAmbientes, 'DOP - Execução Notas Externas')) &&
      meusProcessos?.totalexecutado > 0
        ? [
            {
              value: 'executados',
              label: 'Executados',
              num: meusProcessos?.totalexecutado || 0,
              component: <TableProcessos from="executados" />,
            },
          ]
        : [],
    [meusAmbientes, meusProcessos?.totalexecutado]
  );

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
          value: 'atribuidos',
          label: 'Atribuídos',
          num: meusProcessos?.totalafetosEQ || 0,
          component: <TableProcessos from="atribuidos" />,
        },
        {
          value: 'pendentes',
          label: 'Pendentes',
          num: meusProcessos?.totalpendencias || 0,
          component: <TableProcessos from="pendentes" />,
        },
        ...agendados,
        ...finalizados,
        ...executados,
      ] || [],
    [agendados, finalizados, executados, meusProcessos]
  );

  useEffect(() => {
    if (currentTab !== selectTab(VIEW_TABS, currentTab)) {
      setCurrentTab(VIEW_TABS?.[0]?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VIEW_TABS]);

  return (
    <Page title="Processos | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <Box sx={{ px: 2, py: 1, color: 'common.white', backgroundColor: 'primary.main' }}>
            <Typography variant="h4">Processos</Typography>
          </Box>

          <TabsWrapperStyle>
            <Tabs
              value={currentTab}
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
                      color={colorLabel(tab.value)}
                      sx={{
                        ml: 0.5,
                        '& .MuiBadge-badge': {
                          top: 10,
                          padding: '0 4px',
                          color: 'common.white',
                          right: (tab.num > 999 && -25) || (tab.num > 99 && -20) || -15,
                        },
                        mr: (tab.num < 100 && 3.5) || (tab.num < 1000 && 4.5) || 5.5,
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
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
