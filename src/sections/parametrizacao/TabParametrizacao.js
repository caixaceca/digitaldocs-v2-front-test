import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { setItemValue } from '../../utils/formatObject';
// redux
import { useSelector } from '../../redux/store';
// Components
import { AddItem } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import TableParametrizacao from './TableParametrizacao';

// ----------------------------------------------------------------------

TabParametrizacao.propTypes = { item: PropTypes.string, label: PropTypes.string, subTabs: PropTypes.bool };

export default function TabParametrizacao({ item, label, subTabs }) {
  return subTabs ? (
    <SubTabsParametrizacao item={item} label={label} />
  ) : (
    <>
      <HeaderBreadcrumb label={label} />
      <TableParametrizacao item={item} />
    </>
  );
}

// ----------------------------------------------------------------------

SubTabsParametrizacao.propTypes = { item: PropTypes.string, label: PropTypes.string };

function SubTabsParametrizacao({ item, label }) {
  const { fluxos } = useSelector((state) => state.parametrizacao);
  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })),
    [fluxos]
  );
  const [fluxo, setFluxo] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras'))) || null
  );
  const [currentTab, setCurrentTab] = useState((item === 'motivos' && 'Transição') || (item === 'credito' && 'Linhas'));

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, '', false);
  };

  const tabsList = [
    ...((item === 'credito' && [
      { value: 'Linhas', component: <TableParametrizacao item="linhas" /> },
      { value: 'Despesas', component: <TableParametrizacao item="despesas" /> },
      { value: 'Garantias', component: <TableParametrizacao item="garantias" /> },
    ]) ||
      (item === 'motivos' && [
        { value: 'Transição', component: <TableParametrizacao item="motivosTransicao" fluxo={fluxo} /> },
        { value: 'Pendência', component: <TableParametrizacao item="motivosPendencia" /> },
      ]) ||
      []),
  ];

  return (
    <>
      <HeaderBreadcrumb label={`${label} - ${currentTab}`} fluxo={fluxo} setFluxo={setFluxo} fluxosList={fluxosList} />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// ----------------------------------------------------------------------

HeaderBreadcrumb.propTypes = {
  label: PropTypes.string,
  fluxo: PropTypes.object,
  setFluxo: PropTypes.func,
  fluxosList: PropTypes.array,
};

function HeaderBreadcrumb({ label, fluxo = null, setFluxo = null, fluxosList = [] }) {
  return (
    <HeaderBreadcrumbs
      sx={{ px: 1 }}
      heading={label}
      action={
        <Stack direction="row" alignItems="center" spacing={1}>
          {label === 'Motivos - Transição' && (
            <Autocomplete
              fullWidth
              size="small"
              options={fluxosList}
              value={fluxo || null}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onChange={(event, newValue) => setItemValue(newValue, setFluxo, 'fluxoRegras', true)}
              renderInput={(params) => <TextField {...params} label="Fluxo" sx={{ width: { md: 250 } }} />}
            />
          )}
          <AddItem />
        </Stack>
      }
    />
  );
}
