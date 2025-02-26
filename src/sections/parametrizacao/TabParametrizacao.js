import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
// utils
import { setItemValue } from '../../utils/formatObject';
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
  const initialTab = useMemo(() => {
    if (item === 'motivos') return 'Transição';
    if (item === 'credito') return 'Linhas';
    return '';
  }, [item]);

  const [currentTab, setCurrentTab] = useState(initialTab);

  const handleChangeTab = (event, newValue) => {
    setItemValue(newValue, setCurrentTab, '', false);
  };

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

  const currentTabContent = useMemo(() => tabsList.find((tab) => tab.value === currentTab), [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading={`${label} - ${currentTab}`} action={<AddItem />} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
      {currentTabContent && <Box key={currentTabContent.value}>{currentTabContent.component}</Box>}
    </>
  );
}
