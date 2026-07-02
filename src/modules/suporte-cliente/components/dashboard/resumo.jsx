import { useEffect } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// utils
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// components
import GridItem from '@/components/GridItem';
import { DashboardTicketSkeleton } from '@/components/skeleton';
//
import KPI from './kpi';
import KPIEstados from './estados-kpi';
import { Asuntos } from './table-dashboard';
import { Evolucao, PorDepartamento } from './chart-dasboard';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoDashboard({ data, periodo, department, departamentos }) {
  const dispatch = useDispatch();

  const { indicadores, isLoading } = useSelector((state) => state.suporte);
  const { indicators_by_day: mensal = [], indicators_by_month: anual = [] } = indicadores || {};

  useEffect(() => {
    const year = data.getFullYear();
    const month = periodo === 'Mensal' ? data.getMonth() + 1 : '';
    dispatch(getInSuporte('indicadores', { year, month, department: department?.id ?? '', reset: { dados: null } }));
  }, [dispatch, periodo, data, department?.id]);

  return (
    <>
      {isLoading ? (
        <DashboardTicketSkeleton />
      ) : (
        <Stack spacing={3}>
          <KPI dados={indicadores?.kpis ?? null} />
          <KPIEstados dados={indicadores?.indicators_by_status ?? null} />

          <Grid container spacing={3}>
            <GridItem md={7}>
              <Evolucao periodo={periodo} dados={periodo === 'Mensal' ? mensal : anual} />
            </GridItem>
            <GridItem md={5}>
              <PorDepartamento
                dados={
                  indicadores?.indicators_by_department
                    ?.filter(({ count }) => count)
                    ?.map((row) => ({
                      ...row,
                      department_name:
                        departamentos?.find(({ name }) => name === row.department_name)?.abreviation ??
                        row.department_name,
                    })) ?? []
                }
              />
            </GridItem>
            <GridItem>
              <Asuntos dados={indicadores?.indicators_by_subject?.filter(({ count }) => count) ?? []} />
            </GridItem>
          </Grid>
        </Stack>
      )}
    </>
  );
}
