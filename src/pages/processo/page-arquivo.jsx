import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import TableArquivo from '../../sections/arquivo/TableArquivo';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageArquivo() {
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabArquivo') || 'Arquivos');

  const tabsList = [
    { value: 'Arquivos', component: <TableArquivo tab="arquivos" /> },
    { value: 'Pedidos', component: <TableArquivo tab="pedidosAcesso" /> },
  ];

  return (
    <Page title="Arquivo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          title="Arquivo"
          tab="tabArquivo"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
      </Container>
    </Page>
  );
}
