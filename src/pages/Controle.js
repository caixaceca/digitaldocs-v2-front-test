import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../utils/formatObject';
import { temAcesso, estadoInicial } from '../utils/validarAcesso';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { useSelector } from '../redux/store';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import { TableCON, TableControle, TableCartoes } from '../sections/tabela';

// ----------------------------------------------------------------------

export default function Controle() {
  const { themeStretch } = useSettings();
  const { cc } = useSelector((state) => state.intranet);
  const { isAdmin, isAuditoria, meusAmbientes, meusacessos } = useSelector((state) => state.parametrizacao);

  const tabsList = useMemo(
    () =>
      [
        ...(isAdmin || isAuditoria || estadoInicial(meusAmbientes)
          ? [
              { value: 'Entradas', component: <TableControle from="Entradas" /> },
              { value: 'Por concluir', component: <TableControle from="Por concluir" /> },
              { value: 'Devoluções', component: <TableControle from="Devoluções" /> },
            ]
          : []),
        { value: 'Trabalhados', component: <TableControle from="Trabalhados" /> },
        ...(isAdmin || isAuditoria || cc?.uo?.label === 'DOP-CE' || cc?.uo?.tipo === 'Agências'
          ? [{ value: 'Receção de cartões', component: <TableCartoes /> }]
          : []),
        ...(isAdmin || isAuditoria || temAcesso(['con-100'], meusacessos)
          ? [{ value: 'CON', component: <TableCON /> }]
          : []),
        ...(isAdmin || isAuditoria || temAcesso(['pjf-100'], meusacessos)
          ? [{ value: 'Judiciais & Fiscais', component: <TableCON item="pjf" /> }]
          : []),
      ] || [],
    [meusAmbientes, meusacessos, isAdmin, isAuditoria, cc?.uo]
  );

  const [currentTab, setCurrentTab] = useState(
    tabsList?.map((row) => row?.value)?.find((item) => item === localStorage.getItem('tabControle')) || 'Trabalhados'
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabControle');
  }, [tabsList, currentTab]);

  return (
    <Page title="Controle | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          title="Controle"
          tab="tabControle"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
      </Container>
    </Page>
  );
}
