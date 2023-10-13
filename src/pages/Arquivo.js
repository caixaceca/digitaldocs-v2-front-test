import { useState } from 'react';
// @mui
import { Box, Container } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import TableArquivo from '../sections/arquivo/TableArquivo';

// ----------------------------------------------------------------------

export default function Arquivo() {
  const { themeStretch } = useSettings();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabArquivo') || 'arquivos');

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabArquivo', newValue);
  };

  const tabsList = [
    { value: 'arquivos', label: 'Arquivos', component: <TableArquivo tab="arquivos" /> },
    { value: 'pedidos', label: 'Pedidos', component: <TableArquivo tab="pedidos" /> },
  ];

  return (
    <Page title="Arquivo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper title="Arquivo" tabsList={tabsList} changeTab={handleChangeTab} currentTab={currentTab} />
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
