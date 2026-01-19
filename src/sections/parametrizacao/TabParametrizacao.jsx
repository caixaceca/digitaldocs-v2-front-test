import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
// Components
import { AddItem } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import TableMotivos from './table-motivos';
import TableParametrizacao from './TableParametrizacao';

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

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
        { value: 'Transição', component: <TableMotivos transicao /> },
        { value: 'Pendência', component: <TableMotivos /> },
      ];
    }
    return [];
  }, [item]);

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setCurrentTab(tabsList?.[0]?.value, setCurrentTab);
  }, [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading={`${label} - ${currentTab}`} action={<AddItem />} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={(_, newVal) => setCurrentTab(newVal)} />
      <Box>{tabsList.find((tab) => tab.value === currentTab)?.component}</Box>
    </>
  );
}
