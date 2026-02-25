import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { useSelector } from '@/redux/store';
import useSettings from '@/hooks/useSettings';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import Page from '@/components/Page';
import TabsWrapper from '@/components/TabsWrapper';
// sections
import { DiscoFicheiros } from '@/sections/indicadores/disco-ficheiros';
import EstatisticaCredito from '@/sections/indicadores/estatistica-credito';
import { TotalProcessos, Duracao, SGQ } from '@/sections/indicadores/Indicadores';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageIndicadores() {
  const { themeStretch } = useSettings();
  const { isAdmin } = useSelector((state) => state.parametrizacao);

  const tabsList = useMemo(
    () => [
      ...(isAdmin ? [{ value: 'files', label: 'Ficheiros', component: <DiscoFicheiros /> }] : []),
      { value: 'total', label: 'Total de processos', component: <TotalProcessos /> },
      { value: 'duracao', label: 'Duração', component: <Duracao /> },
      { value: 'sgq', label: 'SGQ', component: <SGQ /> },
      { value: 'estatistica', label: 'Estatística de crédito', component: <EstatisticaCredito /> },
    ],
    [isAdmin]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'total', 'tab-indicadores');

  // const handleNotificationClick = () => {
  //   if (Notification.permission === 'granted') {
  //     const notification = new Notification('Título da Notificação', {
  //       body: 'Corpo da notificação aqui',
  //       icon: '/favicon/favicon.ico',
  //     });

  //     notification.onclick = () => {
  //       window.location.href = 'http://localhost:3001';
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
        <TabsWrapper title="Indicadores" tabsList={tabsList} tab={tab} setTab={setTab} />
        <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
      </Container>
    </Page>
  );
}
