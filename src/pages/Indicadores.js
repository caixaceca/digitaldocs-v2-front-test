import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { temAcesso } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import EstatisticaCredito from '../sections/indicadores/EstatisticaCredito';
import { TotalProcessos, Duracao, FileSystem, Execucao } from '../sections/indicadores/Indicadores';

// ----------------------------------------------------------------------

export default function Indicadores() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meusacessos } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem('tabIndicadores') || (temAcesso(['Todo-111'], meusacessos) && 'files') || 'total'
  );

  const tabsList = useMemo(
    () => [
      ...(temAcesso(['Todo-111'], meusacessos)
        ? [{ value: 'files', label: 'Ficheiros', component: <FileSystem /> }]
        : []),
      { value: 'total', label: 'Total de processos', component: <TotalProcessos /> },
      { value: 'duracao', label: 'Duração', component: <Duracao /> },
      { value: 'execucao', label: 'Tempo execução', component: <Execucao /> },
      { value: 'estatistica', label: 'Estatística de crédito', component: <EstatisticaCredito /> },
    ],
    [meusacessos]
  );

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getFromParametrizacao('motivos', { mail, perfilId: cc?.perfil_id }));
      dispatch(getFromParametrizacao('ambientes', { mail, perfilId: cc?.perfil_id }));
      dispatch(getFromParametrizacao('meusacessos', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc, mail]);

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
