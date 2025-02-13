import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
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
// Componente principal

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
  const [fluxo, setFluxo] = useState(null);

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
        { value: 'Garantias', component: <TableParametrizacao item="garantias" /> },
      ];
    }
    if (item === 'motivos') {
      return [
        { value: 'Transição', component: <TableParametrizacao item="motivosTransicao" fluxo={fluxo} /> },
        { value: 'Pendência', component: <TableParametrizacao item="motivosPendencia" /> },
      ];
    }
    return [];
  }, [item, fluxo]);

  const currentTabContent = useMemo(() => tabsList.find((tab) => tab.value === currentTab), [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumb
        label={`${label} - ${currentTab}`}
        filter={currentTab === 'Transição' ? <Fluxos fluxo={fluxo} setFluxo={setFluxo} /> : null}
      />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
      {currentTabContent && <Box key={currentTabContent.value}>{currentTabContent.component}</Box>}
    </>
  );
}

// ----------------------------------------------------------------------

HeaderBreadcrumb.propTypes = { label: PropTypes.string.isRequired, filter: PropTypes.node };

function HeaderBreadcrumb({ label, filter = null }) {
  return (
    <HeaderBreadcrumbs
      sx={{ px: 1 }}
      heading={label}
      action={
        <Stack direction="row" alignItems="center" spacing={1}>
          {filter}
          <AddItem />
        </Stack>
      }
    />
  );
}

// ----------------------------------------------------------------------

Fluxos.propTypes = { fluxo: PropTypes.object, setFluxo: PropTypes.func };

function Fluxos({ fluxo = null, setFluxo }) {
  const { fluxos } = useSelector((state) => state.parametrizacao);
  const LOCAL_STORAGE_KEY = 'fluxoRegras';

  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })) || [],
    [fluxos]
  );

  useEffect(() => {
    const storedFluxoId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedFluxoId) {
      const selectedFluxo = fluxosList.find((row) => Number(row?.id) === Number(storedFluxoId));
      setFluxo(selectedFluxo || null);
    }
  }, [fluxosList, setFluxo]);

  return (
    <Autocomplete
      fullWidth
      size="small"
      disableClearable
      options={fluxosList}
      value={fluxo || null}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setFluxo, LOCAL_STORAGE_KEY, true)}
      renderInput={(params) => <TextField {...params} label="Fluxo" sx={{ width: { md: 250 } }} />}
    />
  );
}
