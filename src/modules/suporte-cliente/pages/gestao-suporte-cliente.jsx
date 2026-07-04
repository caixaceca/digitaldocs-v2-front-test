import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchIcon from '@mui/icons-material/Search';
// utils
import { useSelector } from '@/redux/store';
import useSettings from '@/hooks/useSettings';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
import { useDepartmentSelection } from '../useDepartmentSelection';
// components
import Page from '@/components/Page';
import TabsWrapper from '@/components/TabsWrapper';
// sections
import AcessoSuporte from '../acesso-suporte';
import Dashboard from '../components/dashboard';
import Tickets from '../components/lista-pedidos';
import FilaEspera from '../components/fila-espera';
import Configuracoes from '../components/configuracoes';
import Avaliacoes from '../components/lista-pedidos/avaliacoes';
import ProcurarPedidos from '../components/lista-pedidos/procurar-pedidos';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageGestaoSuporteCliente() {
  const { themeStretch } = useSettings();
  const { departamentos, utilizador } = useSelector((state) => state.suporte);
  const isAdmin = utilizador?.role === 'ADMINISTRATOR';

  const { selectedDepartment, departmentList, setDepartment } = useDepartmentSelection({
    utilizador,
    departamentos,
    isAdmin,
  });

  const tabsList = useMemo(
    () => [
      {
        value: 'Tickets',
        component: (
          <Tickets setDepartment={setDepartment} departmentList={departmentList} department={selectedDepartment} />
        ),
      },
      ...(isAdmin || utilizador?.role === 'COORDINATOR'
        ? [
            {
              value: 'Dashboard',
              component: <Dashboard params={{ selectedDepartment, setDepartment, departmentList, isAdmin }} />,
            },
          ]
        : []),
      { value: 'Avaliações', component: <Avaliacoes /> },
      ...(isAdmin
        ? [
            { value: 'Configurações', component: <Configuracoes /> },
            { value: 'Fila de Espera', component: <FilaEspera /> },
          ]
        : []),
      { value: 'Procurar', icon: <SearchIcon sx={{ width: 20, height: 20 }} />, component: <ProcurarPedidos /> },
    ],
    [utilizador, selectedDepartment, setDepartment, departmentList, isAdmin]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Tickets', 'tab-suporte-cliente');

  return (
    <Page title="Suporte ao cliente | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper tab={tab} setTab={setTab} tabsList={tabsList} title="Suporte ao cliente" />
        <AcessoSuporte>
          <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
        </AcessoSuporte>
      </Container>
    </Page>
  );
}
