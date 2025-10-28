import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import useSettings from '../hooks/useSettings';
import { setItemValue } from '../utils/formatObject';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import Tickets from '../sections/suporte-cliente/tickets';
import Dashboard from '../sections/suporte-cliente/dashboard';
import Configuracoes from '../sections/suporte-cliente/configuracoes';
import AcessoSuporte from '../sections/suporte-cliente/acesso-suporte';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageGestaoSuporteCliente() {
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tab-suporte-cliente') || 'Tickets');

  const tabsList = useMemo(
    () => [
      { value: 'Tickets', component: <Tickets /> },
      { value: 'Dashboard', component: <Dashboard /> },
      { value: 'Configurações', component: <Configuracoes /> },
    ],
    []
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tab-suporte-cliente', false);
  }, [tabsList, currentTab]);

  return (
    <Page title="Suporte ao cliente | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          tab="tab-suporte-cliente"
          title="Suporte ao cliente"
        />
        <AcessoSuporte>
          <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
        </AcessoSuporte>
      </Container>
    </Page>
  );
}
