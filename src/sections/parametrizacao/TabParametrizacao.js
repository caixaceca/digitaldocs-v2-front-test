import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
// Components
import { AddItem } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import TableParametrizacao from './TableParametrizacao';

// ----------------------------------------------------------------------
// Componente principal

TabParametrizacao.propTypes = { item: PropTypes.string, label: PropTypes.string, subTabs: PropTypes.bool };

export default function TabParametrizacao({ item, label, subTabs }) {
  return subTabs ? (
    <SubTabsParametrizacao item={item} label={label} />
  ) : (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading={label} action={<AddItem />} />
      <TableParametrizacao item={item} />
    </>
  );
}

// ----------------------------------------------------------------------

SubTabsParametrizacao.propTypes = { item: PropTypes.string, label: PropTypes.string };

function SubTabsParametrizacao({ item, label }) {
  const [currentTab, setCurrentTab] = useState(
    (item === 'motivos' && 'Transição') || (item === 'credito' && 'Linhas') || ''
  );

  const tabsList = useMemo(() => {
    if (item === 'credito') {
      return [
        { value: 'Linhas', component: <TableParametrizacao item="linhas" /> },
        { value: 'Despesas', component: <TableParametrizacao item="despesas" /> },
      ];
    }
    if (item === 'motivos') {
      return [
        { value: 'Transição', component: <TableParametrizacao item="motivosTransicao" /> },
        { value: 'Pendência', component: <TableParametrizacao item="motivosPendencia" /> },
      ];
    }
    return [];
  }, [item]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab))
      setCurrentTab(tabsList?.[0]?.value, setCurrentTab);
  }, [tabsList, currentTab]);

  const currentTabContent = useMemo(() => tabsList.find((tab) => tab.value === currentTab), [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading={`${label} - ${currentTab}`} action={<AddItem />} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={(_, newVal) => setCurrentTab(newVal)} />
      {currentTabContent && <Box key={currentTabContent.value}>{currentTabContent.component}</Box>}
    </>
  );
}
