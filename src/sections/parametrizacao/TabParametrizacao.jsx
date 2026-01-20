import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
// utils
import { useTabsSync } from '../../hooks/minimal-hooks/use-tabs-sync';
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

  const [tab, setTab] = useTabsSync(
    tabsList,
    (item === 'motivos' && 'Transição') || (item === 'credito' && 'Linhas') || ''
  );

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading={`${label} - ${tab}`} action={<AddItem />} />
      <TabsWrapperSimple tabsList={tabsList} tab={tab} setTab={setTab} />
      <Box>{tabsList.find(({ value }) => value === tab)?.component}</Box>
    </>
  );
}
