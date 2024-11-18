import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import EstatisticaCredito from '../../sections/indicadores/EstatisticaCredito';
import { TotalProcessos, Duracao, SGQ, FileSystem } from '../../sections/indicadores/Indicadores';

// ----------------------------------------------------------------------

export default function Indicadores() {
  const { themeStretch } = useSettings();
  const { isAdmin } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem('tabIndicadores') || (isAdmin && 'files') || 'total'
  );

  const tabsList = useMemo(
    () => [
      ...(isAdmin ? [{ value: 'files', label: 'Ficheiros', component: <FileSystem /> }] : []),
      { value: 'total', label: 'Total de processos', component: <TotalProcessos /> },
      { value: 'duracao', label: 'Duração', component: <Duracao /> },
      { value: 'sgq', label: 'SGQ', component: <SGQ /> },
      { value: 'estatistica', label: 'Estatística de crédito', component: <EstatisticaCredito /> },
    ],
    [isAdmin]
  );

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
        {/* <Button onClick={handleNotificationClick}>Enviar Notificação</Button> */}
        <TabsWrapper
          title="Indicadores"
          tab="tabIndicadores"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
