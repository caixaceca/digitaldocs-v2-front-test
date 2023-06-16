import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Tab, Box, Grid, Card, Tabs, Container, Typography } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, getAll, resetItem } from '../redux/slices/digitaldocs';
// routes
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import SvgIconStyle from '../components/SvgIconStyle';
import { SearchNotFound404 } from '../components/table';
// sections
import Estado from '../sections/parametrizacao/Estado';
import Transicao from '../sections/parametrizacao/Transicao';

// ----------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  [theme.breakpoints.up('sm')]: { justifyContent: 'center' },
  [theme.breakpoints.up('md')]: { justifyContent: 'flex-end', paddingRight: theme.spacing(3) },
  backgroundColor: theme.palette.background.paper,
}));

const RootStyle = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.primary.main, 1),
}));

// ----------------------------------------------------------------------

export default function Fluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState('transicoes');
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fluxo, estados } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getItem('fluxo', { id, mail, perfilId: cc?.perfil_id }));
    }
    return () => dispatch(resetItem('fluxo'));
  }, [dispatch, cc?.perfil_id, mail, id]);

  useEffect(() => {
    if (mail && cc?.perfil_id && estados?.length === 0) {
      dispatch(getAll('estados', { mail, perfilId: cc?.perfil_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cc?.perfil_id, mail]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const PROFILE_TABS = [
    {
      value: 'transicoes',
      label: 'Transições',
      icon: <SvgIconStyle src="/assets/icons/navbar/transition.svg" sx={{ width: 17 }} />,
      component: <Transicao />,
    },
    {
      value: 'estados',
      label: 'Estados',
      icon: <SvgIconStyle src="/assets/icons/navbar/state.svg" sx={{ width: 18 }} />,
      component: <Estado />,
    },
  ];

  return (
    <Page title="Fluxo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
          <RootStyle>
            <Box sx={{ px: 2, py: 1.25, color: 'common.white', textAlign: { md: 'left' } }}>
              <Typography variant="h5">{fluxo?.assunto || 'Detalhes do fluxo'}</Typography>
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
              {PROFILE_TABS.map((tab) => (
                <Tab disableRipple key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
              ))}
            </Tabs>
          </TabsWrapperStyle>
        </Card>

        {!fluxo ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Fluxo não encontrado..." />
          </Grid>
        ) : (
          PROFILE_TABS.map((tab) => {
            const isMatched = tab.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })
        )}
      </Container>
    </Page>
  );
}
