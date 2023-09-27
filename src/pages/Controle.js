import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Container, Typography } from '@mui/material';
// utils
import selectTab from '../utils/selectTab';
import { emailCheck } from '../utils/validarAcesso';
import { paramsObject } from '../utils/normalizeText';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { useSelector } from '../redux/store';
// components
import Page from '../components/Page';
// sections
import { TableEntradas, TablePorConcluir, TableTrabalhados, TableCartoes } from '../sections/tabela';

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

export default function Controle() {
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isAdmin, meusAmbientes } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useSearchParams({
    tab: 'entradas',
    uoId: cc?.uo?.id || '',
    colaborador: cc?.perfil?.displayName || '',
  });

  useEffect(() => {
    if (cc?.uo && !currentTab?.get('uoId')) {
      setCurrentTab({ tab: 'trabalhados', ...paramsObject(currentTab), uoId: cc?.uo?.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cc?.uo]);

  useEffect(() => {
    if (cc?.perfil?.displayName && !currentTab?.get('colaborador')) {
      setCurrentTab({ tab: 'trabalhados', ...paramsObject(currentTab), colaborador: cc?.perfil?.displayName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cc?.perfil?.displayName]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab({ tab: newValue, ...paramsObject(currentTab) });
  };

  const acessoEntradas = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.is_inicial) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  const entradas =
    acessoEntradas() || isAdmin ? [{ value: 'entradas', label: 'Entradas', component: <TableEntradas /> }] : [];
  const cartoes =
    // isAdmin || cc?.uo?.tipo === 'Agências' || cc?.uo?.label === 'DOP-CE'
    emailCheck(mail, 'vc.axiac@arove.ordnavi')
      ? [{ value: 'cartoes', label: 'Receção de cartões', component: <TableCartoes /> }]
      : [];

  const VIEW_TABS = useMemo(
    () =>
      [
        ...entradas,
        { value: 'porconcluir', label: 'Por concluir', component: <TablePorConcluir /> },
        { value: 'trabalhados', label: 'Trabalhados', component: <TableTrabalhados /> },
        ...cartoes,
      ] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meusAmbientes, isAdmin, cc?.uo]
  );

  useEffect(() => {
    if (currentTab.get('tab') !== selectTab(VIEW_TABS, currentTab.get('tab'))) {
      setCurrentTab({ tab: VIEW_TABS?.[0]?.value, ...paramsObject(currentTab) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VIEW_TABS, currentTab.get('tab')]);

  return (
    <Page title="Controle | DigitalDocs">
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
