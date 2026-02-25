// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// hooks
import useSettings from '@/hooks/useSettings';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import Page from '@/components/Page';
import TabsWrapper from '@/components/TabsWrapper';
// sections
import TableArquivo from '@/sections/arquivo/TableArquivo';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageArquivo() {
  const { themeStretch } = useSettings();

  const tabsList = [
    { value: 'Arquivos', component: <TableArquivo tab="arquivos" /> },
    { value: 'Pedidos', component: <TableArquivo tab="pedidosAcesso" /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Arquivos', 'tab-arquivo');

  return (
    <Page title="Arquivo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper title="Arquivo" tabsList={tabsList} tab={tab} setTab={setTab} />
        <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
      </Container>
    </Page>
  );
}
