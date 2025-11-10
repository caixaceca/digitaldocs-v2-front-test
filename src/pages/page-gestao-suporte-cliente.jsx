import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { useSelector } from '../redux/store';
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
  const [department, setDepartment] = useState(null);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tab-suporte-cliente') || 'Tickets');

  const { departamentos, utilizador } = useSelector((state) => state.suporte);
  const admin = useMemo(() => utilizador?.role === 'ADMINISTRATOR', [utilizador]);

  const tabsList = useMemo(
    () => [
      { value: 'Tickets', component: <Tickets department={department} setDepartment={setDepartment} admin={admin} /> },
      {
        value: 'Dashboard',
        component: <Dashboard department={department} setDepartment={setDepartment} departamentos={departamentos} />,
      },
      { value: 'Configurações', component: <Configuracoes /> },
    ],
    [department, admin, departamentos]
  );

  useEffect(() => {
    if (!department?.id && departamentos?.length > 0 && !admin) {
      const idSel = localStorage.getItem('departmentTicket') || utilizador?.department_id;
      const dep = departamentos.find(({ id }) => Number(id) === Number(idSel));
      if (dep) setDepartment({ id: dep.id, abreviation: dep.abreviation });
    }
  }, [admin, departamentos, department?.id, utilizador]);

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
