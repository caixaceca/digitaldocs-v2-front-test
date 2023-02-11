import sumBy from 'lodash/sumBy';
import merge from 'lodash/merge';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
// @mui
import { Box, Grid, Card, Stack, Typography, CardHeader } from '@mui/material';
// utils
import { fNumber, fPercent } from '../../utils/formatNumber';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// components
import { BaseOptionChart } from '../../components/chart';
//
import { ProcessosTrabalhados, ProcessosNoAno, FileSystem } from './indicadores';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const data1 = [
  { label: 'Trabalhado', value: 7850 },
  { label: 'Por trabalhar', value: 2150 },
];

const processosDoAno = [
  { label: 'Trabalhado', value: 5650 },
  { label: 'No prazo', value: 5500 },
  { label: 'Arquivado', value: 5000 },
  { label: 'Por trabalhar', value: 750 },
  { label: 'Devolvidos', value: 500 },
];

const data2 = [
  { titulo: 'Hoje', total: 50 },
  { titulo: 'Neste mês', total: 1023 },
  { titulo: 'Neste ano', total: 6400 },
  { titulo: 'No prazo', total: 8500 },
  { titulo: 'Devolvidos', total: 3200 },
];

// ----------------------------------------------------------------------

export default function IndicadoresGerais() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const total = sumBy(data1, 'value');
  const { mail } = useSelector((state) => state.colaborador);
  const chartSeries = (data1.filter((i) => i.label === 'Trabalhado')[0].value / total) * 100;
  const chartSeries1 = (6200 / total) * 100;
  const totalProcessosAno = sumBy(
    processosDoAno?.filter((i) => i.label === 'Trabalhado' || i.label === 'Por trabalhar'),
    'value'
  );

  const chartOptions = merge(BaseOptionChart(), {
    colors: [theme.palette.success.main, theme.palette.focus.dark],
    legend: { show: false },
    labels: ['Trabalhado', 'Arquivado'],
    grid: {
      padding: { top: -25, bottom: -25 },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '64%' },
        dataLabels: {
          name: { offsetY: -16 },
          value: { offsetY: 8 },
          total: {
            label: 'Total',
            fontSize: theme.typography.h4.fontSize,
            formatter: () => fNumber(total),
          },
        },
      },
    },
  });

  useEffect(() => {
    // mail && dispatch(getAll('estados', '', '', '', mail));
  }, [dispatch, mail]);

  return (
    <>
      <Grid container spacing={3}>
        <RoleBasedGuard roles={['Todo-111']}>
          <Grid item xs={12}>
            <FileSystem />
          </Grid>
        </RoleBasedGuard>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Processos" sx={{ mb: 3 }} />
            <ReactApexChart type="radialBar" series={[chartSeries, chartSeries1]} options={chartOptions} height={360} />
            <Stack spacing={2} sx={{ p: 3 }}>
              <Legend
                item={{ label: 'Trabalhado', value: data1.filter((i) => i.label === 'Trabalhado')[0].value }}
                total={total}
              />
              <Legend item={{ label: 'Arquivado', value: 6200 }} total={total} />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <ProcessosTrabalhados dados={data2} total={total} />
        </Grid>

        <Grid item xs={12} md={4}>
          <ProcessosNoAno dados={processosDoAno} total={totalProcessosAno} />
        </Grid>

        {/* <Grid item xs={12}>
          <ProcessosPorTipo dados={data} total={total} />
        </Grid> */}
      </Grid>
    </>
  );
}

// ----------------------------------------------------------------------

Legend.propTypes = {
  total: PropTypes.number,
  item: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  }),
};

function Legend({ total, item }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 16,
            height: 16,
            bgcolor: 'grey.50016',
            borderRadius: 0.75,
            ...((item.label === 'Trabalhado' && {
              bgcolor: 'primary.main',
            }) ||
              (item.label === 'Arquivado' && {
                bgcolor: theme.palette.focus.dark,
              })),
          }}
        />

        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {item.label}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle1">{fNumber(item.value)}</Typography>
        <Typography variant="body2">({fPercent((item.value * 100) / total)})</Typography>
      </Stack>
    </Stack>
  );
}
