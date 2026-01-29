import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchIcon from '@mui/icons-material/Search';
// utils
import { useSelector } from '../redux/store';
import useSettings from '../hooks/useSettings';
import { useTabsSync } from '../hooks/minimal-hooks/use-tabs-sync';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import Dashboard from '../sections/suporte-cliente/dashboard';
import Tickets from '../sections/suporte-cliente/lista-pedidos';
import Configuracoes from '../sections/suporte-cliente/configuracoes';
import AcessoSuporte from '../sections/suporte-cliente/acesso-suporte';
import ProcurarPedidos from '../sections/suporte-cliente/lista-pedidos/procurar-pedidos';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageGestaoSuporteCliente() {
  const { themeStretch } = useSettings();
  const [department, setDepartment] = useState(null);

  const { departamentos, utilizador } = useSelector((state) => state.suporte);

  const tabsList = useMemo(
    () => [
      {
        value: 'Tickets',
        component: (
          <Tickets department={department} setDepartment={setDepartment} admin={utilizador?.role === 'ADMINISTRATOR'} />
        ),
      },
      ...(utilizador?.role === 'ADMINISTRATOR' || utilizador?.role === 'COORDINATOR'
        ? [
            { value: 'Dashboard', component: <Dashboard params={{ department, setDepartment, departamentos }} /> },
            { value: 'Configurações', component: <Configuracoes role={utilizador?.role} /> },
          ]
        : []),

      { value: 'Procurar', icon: <SearchIcon sx={{ width: 20, height: 20 }} />, component: <ProcurarPedidos /> },
    ],
    [department, utilizador?.role, departamentos]
  );

  useEffect(() => {
    if (!department?.id && departamentos?.length > 0 && utilizador?.role !== 'ADMINISTRATOR') {
      const idSel = localStorage.getItem('departmentTicket') || utilizador?.department_id;
      const dep = departamentos.find(({ id }) => Number(id) === Number(idSel));
      if (dep) setDepartment({ id: dep.id, abreviation: dep.abreviation });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departamentos, utilizador]);

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
