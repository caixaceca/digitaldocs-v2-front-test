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
import { useDispatch, useSelector } from '../redux/store';
import { getIndicadores } from '../redux/slices/indicadores';
// components
import Page from '../components/Page';
import { Notificacao } from '../components/NotistackProvider';
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
  const { error } = useSelector((state) => state.digitaldocs);
  const { totalP } = useSelector((state) => state.indicadores);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabProcessos') || 'Tarefas');

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getIndicadores('totalP', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, mail, currentTab, cc?.perfil_id]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabProcessos', newValue);
  };

  const VIEW_TABS = useMemo(
    () =>
      [
        { value: 'Tarefas', num: totalP?.total_tarefa || 0, component: <TableProcessos from="Tarefas" /> },
        { value: 'Retidos', num: totalP?.total_retido || 0, component: <TableProcessos from="Retidos" /> },
        { value: 'Atribuídos', num: totalP?.total_afeto || 0, component: <TableProcessos from="Atribuídos" /> },
        { value: 'Pendentes', num: totalP?.total_pendente || 0, component: <TableProcessos from="Pendentes" /> },
        ...(pertencoAoEstado(meusAmbientes, ['Validação OPE', 'Execução OPE'])
          ? [{ value: 'Agendados', num: totalP?.total_agendado || 0, component: <TableProcessos from="Agendados" /> }]
          : []),
        ...(pertencoAoEstado(meusAmbientes, ['DOP - Validação Notas Externas', 'DOP - Execução Notas Externas'])
          ? [
              {
                value: 'Finalizados',
                num: totalP?.total_finalizado || 0,
                component: <TableProcessos from="Finalizados" />,
              },
              {
                value: 'Executados',
                num: totalP?.total_executado || 0,
                component: <TableProcessos from="Executados" />,
              },
            ]
          : []),
      ] || [],
    [totalP, meusAmbientes]
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
        <Notificacao error={error} />
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
                      max={9999}
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
                      {tab.value}
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
