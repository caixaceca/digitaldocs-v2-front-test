import { useState } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
// components
import GridItem from '../../../components/GridItem';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
//
import KPI from './kpi';
import useDashboardMockData from './mock';
import { EvolucaoDiaria, PorDepartamento } from './chart-dasboard';
import { Asuntos, Recentes, Avaliacoes, Desempenho } from './table-dashboard';

// ---------------------------------------------------------------------------------------------------------------------

export default function AdminDashboardMetrics() {
  const [period, setPeriod] = useState('Mês atual');
  const { kpis, daily, byDepartment, bySubject, byEmployee, recentTickets, recentEvaluations } = useDashboardMockData();

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Painel de Gestão"
        action={
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Período</InputLabel>
            <Select label="Período" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="Mês atual">Mês atual</MenuItem>
              <MenuItem value="Mês anterior">Mês anterior</MenuItem>
              <MenuItem value="Últimas 7 dias">Últimas 7 dias</MenuItem>
            </Select>
          </FormControl>
        }
      />

      <Stack spacing={3}>
        <KPI dados={kpis} />

        <Grid container spacing={3}>
          <GridItem md={7}>
            <EvolucaoDiaria dados={daily} />
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
