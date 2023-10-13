import { useEffect, useMemo, useState } from 'react';
// @mui
import { Box, Container } from '@mui/material';
// utils
import selectTab from '../utils/selectTab';
import { estadoInicial } from '../utils/validarAcesso';
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
  const { isAdmin, meusAmbientes } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabControle') || 'trabalhados');

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

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabControle', newValue);
  };

  const entradas = useMemo(
    () =>
      estadoInicial(meusAmbientes) || isAdmin
        ? [{ value: 'entradas', label: 'Entradas', component: <TableControle from="entradas" /> }]
        : [],
    [isAdmin, meusAmbientes]
  );

  const cartoes = useMemo(
    () =>
      isAdmin || cc?.uo?.tipo === 'Agências' || cc?.uo?.label === 'DOP-CE'
        ? [{ value: 'cartoes', label: 'Receção de cartões', component: <TableCartoes /> }]
        : [],
    [cc?.uo?.label, cc?.uo?.tipo, isAdmin]
  );

  const con = useMemo(
    () => (isAdmin || cc?.uo?.label === 'GFC' ? [{ value: 'con', label: 'CON', component: <TableCON /> }] : []),
    [cc?.uo?.label, isAdmin]
  );

  const tabsList = useMemo(
    () =>
      [
        ...entradas,
        { value: 'trabalhados', label: 'Trabalhados', component: <TableControle from="trabalhados" /> },
        { value: 'porconcluir', label: 'Por concluir', component: <TableControle from="porconcluir" /> },
        ...cartoes,
        ...con,
      ] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meusAmbientes, isAdmin, cc?.uo]
  );

  useEffect(() => {
    if (currentTab !== selectTab(tabsList, currentTab)) {
      setCurrentTab(tabsList?.[0]?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsList, currentTab]);

  return (
    <Page title="Controle | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper title="Controle" tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
