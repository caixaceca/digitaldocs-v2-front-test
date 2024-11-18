import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
// utils
import { setItemValue } from '../../utils/formatText';
// redux
import { useDispatch } from '../../redux/store';
import { openModal } from '../../redux/slices/gaji9';
// Components
import { DefaultAction } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import TableGaji9 from './TableGaji9';

// ----------------------------------------------------------------------

TabGaji9.propTypes = { item: PropTypes.string, label: PropTypes.string, subTabs: PropTypes.bool };

export default function TabGaji9({ item, label, subTabs }) {
  return subTabs ? (
    <SubTabsGaji9 item={item} label={label} />
  ) : (
    <>
      <HeaderBreadcrumb label={label} />
      <TableGaji9 item={item} />
    </>
  );
}

// ----------------------------------------------------------------------

SubTabsGaji9.propTypes = { item: PropTypes.string, label: PropTypes.string };

function SubTabsGaji9({ item, label }) {
  const [currentTab, setCurrentTab] = useState(
    (item === 'identificadores' && 'Produtos') || (item === 'parametros' && 'Marcadores') || 'Representantes'
  );

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, '', false);
  };

  const tabsList = [
    ...((item === 'acessos' && [
      { value: 'Representantes', component: <TableGaji9 item="representantes" /> },
      { value: 'Grupos', component: <TableGaji9 item="grupos" /> },
      { value: 'Funções', component: <TableGaji9 item="funcoes" /> },
      { value: 'Recursos', component: <TableGaji9 item="recursos" /> },
    ]) ||
      (item === 'identificadores' && [
        { value: 'Produtos', component: <TableGaji9 item="produtos" /> },
        { value: 'Titulares', component: <TableGaji9 item="titulares" /> },
        { value: 'Garantias', component: <TableGaji9 item="garantias" /> },
      ]) ||
      (item === 'parametros' && [
        { value: 'Marcadores', component: <TableGaji9 item="marcadores" /> },
        { value: 'Variáveis', component: <TableGaji9 item="variaveis" /> },
      ]) ||
      []),
  ];

  return (
    <>
      <HeaderBreadcrumb label={`${label} - ${currentTab}`} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} sx={{ mb: 3 }} />
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// ----------------------------------------------------------------------

HeaderBreadcrumb.propTypes = { label: PropTypes.string };

function HeaderBreadcrumb({ label }) {
  const dispatch = useDispatch();

  return (
    <HeaderBreadcrumbs
      sx={{ px: 1 }}
      heading={label}
      action={<DefaultAction button label="Adicionar" handleClick={() => dispatch(openModal('add'))} />}
    />
  );
}
