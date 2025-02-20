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

  useEffect(() => {
    if (cc?.uo?.id && !localStorage.getItem('uoSearch')) {
      localStorage.setItem('uoSearch', cc?.uo?.id);
    }
  }, [cc?.uo?.id]);

  useEffect(() => {
    if (cc?.perfil?.displayName && !localStorage.getItem('colaboradorControle')) {
      localStorage.setItem('colaboradorControle', cc?.perfil?.displayName);
    }
  }, [cc?.perfil?.displayName]);

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
        ...(isAdmin ||
        isAuditoria ||
        cc?.uo?.tipo === 'Agências' ||
        cc?.uo?.label === 'DOP-CE' ||
        temAcesso(['emissao-cartoes-100'], meusacessos)
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
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) {
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabControle');
    }
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
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
