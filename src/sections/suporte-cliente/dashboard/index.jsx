import { useState, useEffect } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material//Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { setItemValue } from '../../../utils/formatObject';
import { useDispatch, useSelector } from '../../../redux/store';
import { getInSuporte } from '../../../redux/slices/suporte-cliente';
// components
import GridItem from '../../../components/GridItem';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { DashboardTicketSkeleton } from '../../../components/skeleton';
//
import KPI from './kpi';
import { Evolucao, PorDepartamento } from './chart-dasboard';
import { Asuntos, Recentes, Avaliacoes, Desempenho } from './table-dashboard';

// ---------------------------------------------------------------------------------------------------------------------

export default function AdminDashboardMetrics({ departamentos = [], department, setDepartment }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(new Date());
  const [periodo, setPeriodo] = useState('Mensal');

  const { indicadores, isLoading } = useSelector((state) => state.suporte);

  useEffect(() => {
    const year = data.getFullYear();
    const month = periodo === 'Mensal' ? data.getMonth() + 1 : '';
    dispatch(getInSuporte('indicadores', { year, month, department: department?.id ?? '', reset: { dados: null } }));
  }, [dispatch, periodo, data, department?.id]);

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
                slotProps={{ textField: { size: 'small', sx: { maxWidth: periodo === 'Mensal' ? 200 : 150 } } }}
              />
            </Stack>
            <Autocomplete
              fullWidth
              size="small"
              sx={{ minWidth: 200 }}
              options={departamentos}
              value={department || null}
              getOptionLabel={(option) => option?.abreviation || option?.name}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Departamento" />}
              onChange={(event, newValue) => setItemValue(newValue, setDepartment, 'departmentTicket', true)}
            />
          </Stack>
        }
      />

      {isLoading ? (
        <DashboardTicketSkeleton />
      ) : (
        <Stack spacing={3}>
          <KPI dados={indicadores?.kpis ?? null} />

          <Grid container spacing={3}>
            <GridItem md={7}>
              <Evolucao
                periodo={periodo}
                dados={
                  periodo === 'Mensal'
                    ? (indicadores?.indicators_by_day ?? [])
                    : (indicadores?.indicators_by_month ?? [])
                }
              />
            </GridItem>
            <GridItem md={5}>
              <PorDepartamento dados={indicadores?.indicators_by_department?.filter(({ count }) => count) ?? []} />
            </GridItem>
            <GridItem md={7}>
              <Asuntos dados={indicadores?.indicators_by_subject?.filter(({ count }) => count) ?? []} />
            </GridItem>
            <GridItem md={5}>
              <Desempenho dados={indicadores?.indicators_by_employee?.filter(({ closed }) => closed) ?? []} />
            </GridItem>
            <GridItem md={6}>
              <Recentes dados={indicadores?.recent_tickets ?? []} />
            </GridItem>
            <GridItem md={6}>
              <Avaliacoes dados={indicadores?.recent_evaluations ?? []} />
            </GridItem>
          </Grid>
        </Stack>
      )}
    </>
  );
}
