import { useState, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material//Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { setItemValue } from '@/utils/formatObject';
import { storageGet, storageSet } from '../../utils';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import { TabsWrapperSimple } from '@/components/TabsWrapper';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
//
import ResumoDashboard from './resumo';
import DashColaboradores from './colaboradores';
import DashDepartamentos from './departamentos';

// ---------------------------------------------------------------------------------------------------------------------

export default function Dashboard({ params }) {
  const [periodo, setPeriodo] = useState(storageGet('periodTicket', 'Mensal'));
  const [data, setData] = useState(new Date(storageGet('dataPeriodTicket', new Date())));
  const { departmentList: departamentos = [], selectedDepartment: department, setDepartment, isAdmin } = params;

  const tabsList = useMemo(
    () => [
      {
        value: 'Resumo',
        component: (
          <ResumoDashboard data={data} periodo={periodo} department={department} departamentos={departamentos} />
        ),
      },
      {
        value: 'Departamentos',
        component: <DashDepartamentos department={department?.id} data={data} periodo={periodo} />,
      },
      {
        value: 'Colaboradores',
        component: <DashColaboradores department={department?.id} data={data} periodo={periodo} />,
      },
    ],
    [data, departamentos, department, periodo]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Resumo', '');

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Painel de Gestão"
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Autocomplete
                fullWidth
                size="small"
                value={periodo}
                disableClearable
                sx={{ maxWidth: 120 }}
                options={['Mensal', 'Anual']}
                onChange={(event, newValue) => {
                  setPeriodo(newValue);
                  storageSet('periodTicket', newValue);
                }}
                renderInput={(params) => <TextField {...params} fullWidth label="Período" />}
              />
              <DatePicker
                value={data}
                maxDate={new Date()}
                minDate={new Date('2020-01-01')}
                onChange={(newValue) => {
                  setData(newValue);
                  storageSet('dataPeriodTicket', newValue);
                }}
                label={periodo === 'Mensal' ? 'Mês' : 'Data'}
                views={periodo === 'Mensal' ? ['month', 'year'] : ['year']}
                slotProps={{ textField: { size: 'small', sx: { maxWidth: periodo === 'Mensal' ? 200 : 150 } } }}
              />
            </Stack>
            <Autocomplete
              fullWidth
              size="small"
              sx={{ minWidth: 200 }}
              options={departamentos}
              value={department || null}
              disableClearable={!isAdmin}
              getOptionLabel={(option) => option?.abreviation || option?.name}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Departamento" />}
              onChange={(event, newValue) => setItemValue(newValue, setDepartment, 'departmentTicket', true)}
            />
          </Stack>
        }
      />

      <TabsWrapperSimple tab={tab} tabsList={tabsList} setTab={setTab} />
      {tabsList?.find(({ value }) => value === tab)?.component}
    </>
  );
}
