import { useState } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material//Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// components
import GridItem from '../../../components/GridItem';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
//
import KPI from './kpi';
import useDashboardMockData from './mock';
import { Evolucao, PorDepartamento } from './chart-dasboard';
import { Asuntos, Recentes, Avaliacoes, Desempenho } from './table-dashboard';

// ---------------------------------------------------------------------------------------------------------------------

export default function AdminDashboardMetrics() {
  const [data, setData] = useState(new Date());
  const [periodo, setPeriodo] = useState('Mensal');
  const { kpis, daily, monthly, byDepartment, bySubject, byEmployee, recentTickets, recentEvaluations } =
    useDashboardMockData();

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Painel de Gestão"
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Autocomplete
              fullWidth
              size="small"
              value={periodo}
              disableClearable
              sx={{ maxWidth: 150 }}
              options={['Mensal', 'Anual']}
              onChange={(event, newValue) => setPeriodo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth label="Período" />}
            />
            <DatePicker
              value={data}
              maxDate={new Date()}
              minDate={new Date('2020-01-01')}
              onChange={(newValue) => setData(newValue)}
              label={periodo === 'Mensal' ? 'Mês' : 'Data'}
              views={periodo === 'Mensal' ? ['month', 'year'] : ['year']}
              slotProps={{ textField: { size: 'small', sx: { maxWidth: periodo === 'Mensal' ? 300 : 200 } } }}
            />
          </Stack>
        }
      />

      <Stack spacing={3}>
        <KPI dados={kpis} />

        <Grid container spacing={3}>
          <GridItem md={7}>
            <Evolucao dados={periodo === 'Mensal' ? daily : monthly} periodo={periodo} />
          </GridItem>
          <GridItem md={5}>
            <PorDepartamento dados={byDepartment} />
          </GridItem>
          <GridItem md={7}>
            <Asuntos dados={bySubject} />
          </GridItem>
          <GridItem md={5}>
            <Desempenho dados={byEmployee} />
          </GridItem>
          <GridItem md={6}>
            <Recentes dados={recentTickets} />
          </GridItem>
          <GridItem md={6}>
            <Avaliacoes dados={recentEvaluations} />
          </GridItem>
        </Grid>
      </Stack>
    </>
  );
}
