import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { setItemValue } from '../../utils/formatText';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
// Components
import { AddItem } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import TableParametrizacao from './TableParametrizacao';

// ----------------------------------------------------------------------

ParametrizacaoTabs.propTypes = { item: PropTypes.string };

export default function ParametrizacaoTabs({ item }) {
  const dispatch = useDispatch();
  const { fluxos } = useSelector((state) => state.parametrizacao);
  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })),
    [fluxos]
  );

  const [currentTab, setCurrentTab] = useState(
    (item === 'anexos' && 'Anexos') ||
      (item === 'motivos' && 'Motivos transição') ||
      (item === 'crédito' && 'Linhas de crédito')
  );
  const [fluxoR, setFluxoR] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras')))
  );

  useEffect(() => {
    if (currentTab === 'Regras anexos' && fluxoR?.id) {
      dispatch(getFromParametrizacao('fluxo', { id: fluxoR?.id }));
      dispatch(getFromParametrizacao('regrasAnexos', { fluxoId: fluxoR?.id }));
    }
  }, [dispatch, currentTab, fluxoR?.id]);

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, '', false);
  };

  const tabsList = [
    ...((item === 'anexos' && [
      { value: 'Anexos', component: <TableParametrizacao item="anexos" /> },
      { value: 'Regras anexos', component: <TableParametrizacao item="regrasAnexos" /> },
    ]) ||
      (item === 'crédito' && [
        { value: 'Linhas de crédito', component: <TableParametrizacao item="linhas" /> },
        { value: 'Despesas', component: <TableParametrizacao item="despesas" /> },
        { value: 'Garantias', component: <TableParametrizacao item="garantias" /> },
      ]) ||
      (item === 'motivos' && [
        { value: 'Motivos transição', component: <TableParametrizacao item="motivosTransicao" fluxo={fluxoR} /> },
        { value: 'Motivos pendência', component: <TableParametrizacao item="motivosPendencia" fluxo={fluxoR} /> },
      ]) ||
      []),
  ];

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={currentTab}
        action={
          <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {(currentTab === 'Regras anexos' || currentTab === 'Motivos transição') && (
                <Autocomplete
                  fullWidth
                  size="small"
                  options={fluxosList}
                  value={fluxoR || null}
                  disableClearable={currentTab !== 'Motivos transição'}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(event, newValue) => {
                    setItemValue(newValue, setFluxoR, 'fluxoRegras', true);
                  }}
                  renderInput={(params) => <TextField {...params} label="Fluxo" sx={{ width: { md: 250 } }} />}
                />
              )}
              <AddItem />
            </Stack>
          </RoleBasedGuard>
        }
      />

      <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} sx={{ mb: 3 }} />
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </RoleBasedGuard>
    </>
  );
}
