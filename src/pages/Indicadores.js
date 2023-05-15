import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Tab, Box, Card, Tabs, Stack, Button, Container, Typography } from '@mui/material';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
// sections
import { Tipos, Criacao, Volume, Duracao, FileSystem, Execucao } from '../sections/indicadores/Indicadores';
// assets
import ComingSoonIllustration from '../assets/ComingSoonIllustration';

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
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { meusacessos } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const [currentTab, setCurrentTab] = useState(meusacessos.includes('Todo-111') ? 'files' : 'total');

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabFiles = meusacessos.includes('Todo-111')
    ? [{ value: 'files', label: 'Ficheiros', component: <FileSystem /> }]
    : [];

  const tabs = [
    ...tabFiles,
    { value: 'total', label: 'Total de processos', component: <Criacao /> },
    { value: 'voloume', label: 'Volume', component: <Volume /> },
    { value: 'tipos', label: 'Tipos', component: <Tipos /> },
    { value: 'duracao', label: 'Duração', component: <Duracao /> },
    { value: 'tempoExecucao', label: 'Tempo execução', component: <Execucao /> },
  ];

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('ambientes', { mail, perfilId: currentColaborador?.perfil_id }));
      dispatch(getAll('meusacessos', { mail, perfilId: currentColaborador?.perfil_id }));
      dispatch(getAll('motivos pendencias', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador, mail]);

  return (
    <Page title="Indicadores | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        {meusacessos.includes('transicao-111') ? (
          <>
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
          </>
        ) : (
          <Card sx={{ p: 5 }}>
            <Stack sx={{ alignItems: 'center' }}>
              <Typography variant="h3" paragraph sx={{ mt: 5 }}>
                Brevemente
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>
                Estamos trabalhando nos seus indicadores, da sua equipa, da sua unidade orgânica e da Caixa!
              </Typography>

              <ComingSoonIllustration sx={{ mb: 7, height: { xs: 300, sm: 450 } }} />

              <Button size="large" variant="contained" onClick={() => navigate(-1)}>
                Voltar
              </Button>
            </Stack>
          </Card>
        )}
      </Container>
    </Page>
  );
}
