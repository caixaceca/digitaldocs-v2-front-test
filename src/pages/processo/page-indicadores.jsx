import { useState, useMemo, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatObject';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import { DiscoFicheiros } from '../../sections/indicadores/disco-ficheiros';
import EstatisticaCredito from '../../sections/indicadores/EstatisticaCredito';
import { TotalProcessos, Duracao, SGQ } from '../../sections/indicadores/Indicadores';

// ----------------------------------------------------------------------

export default function PageIndicadores() {
  const { themeStretch } = useSettings();
  const { isAdmin } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabIndicadores') || 'total');

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

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabIndicadores', false);
  }, [tabsList, currentTab]);

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
        <TabsWrapper
          title="Indicadores"
          tab="tabIndicadores"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
      </Container>
    </Page>
  );
}
