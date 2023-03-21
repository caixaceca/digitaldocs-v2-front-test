import { useEffect, useState } from 'react';
// @mui
import { Card, Stack, TextField, CardHeader, Autocomplete } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// redux
import { getIndicadores } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import { BarChart } from '../../../components/skeleton';
import { SearchNotFound } from '../../../components/table';
import Chart, { useChart } from '../../../components/chart';
// --------------------------------------------------------------------------------------------------------------------------------------------

export default function Ranking() {
  const dispatch = useDispatch();
  const [top, setTop] = useState('10');
  const [escopo, setEscopo] = useState({ id: 'uo', label: 'U.O' });
  const { uos } = useSelector((state) => state.uo);
  const { isLoading, ranking } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.colaborador);
  const perfilId = currentColaborador?.perfil_id;

  const rankingByItem = [];
  ranking?.forEach((row, index) => {
    if (escopo?.id === 'uo') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        rankingByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (top === 'Todos') {
        rankingByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (escopo?.id === 'perfil') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        rankingByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (top === 'Todos') {
        rankingByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });
  const isNotFound = !rankingByItem.length;

  const seriesRanking = [{ name: 'Nº de processos', data: rankingByItem?.map((row) => row?.total) }];
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    plotOptions: { bar: { columnWidth: '25%' } },
    stroke: { show: false },
    xaxis: { categories: rankingByItem?.map((row) => row?.label) },
    yaxis: {
      labels: {
        formatter(val) {
          return val.toFixed(0);
        },
      },
      title: { text: 'Nº de processos' },
    },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(getIndicadores('indicadoresRanking', { mail, escopo: escopo?.id, perfilId }));
    }
  }, [dispatch, perfilId, escopo?.id, mail]);

  return (
    <>
      <Card>
        <CardHeader
          title="Ranking"
          sx={{ mb: 5 }}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Autocomplete
                fullWidth
                size="small"
                value={escopo}
                disableClearable
                sx={{ minWidth: 140 }}
                onChange={(event, newValue) => setEscopo(newValue)}
                options={[
                  { id: 'uo', label: 'U.O' },
                  { id: 'perfil', label: 'Colaborador' },
                ]?.map((option) => option)}
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="Escopo" />}
              />
              <Autocomplete
                fullWidth
                value={top}
                size="small"
                disableClearable
                sx={{ minWidth: 100 }}
                onChange={(event, newValue) => setTop(newValue)}
                options={['5', '10', '20', 'Todos']?.map((option) => option)}
                renderInput={(params) => <TextField {...params} label="Top" />}
              />
            </Stack>
          }
        />
        {isLoading ? (
          <Stack direction="row" justifyContent="center">
            <BarChart />
          </Stack>
        ) : (
          <>
            {isNotFound ? (
              <SearchNotFound message="Nenhum registo encontrado" />
            ) : (
              <Chart type="bar" series={seriesRanking} options={chartOptions} height={500} />
            )}
          </>
        )}
      </Card>
    </>
  );
}
