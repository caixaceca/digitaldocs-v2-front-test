// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
// utils
import { mesesAbr } from '../../../_mock/_others';
import { fNumber, fPercent } from '../../../utils/formatNumber';
// components
import Chart, { useChart, getChartColors } from '../../../components/chart';

// ---------------------------------------------------------------------------------------------------------------------

export function PorDepartamento({ dados }) {
  const theme = useTheme();
  const chartColors = getChartColors(theme);
  const chartSeries = dados.map((i) => i.count);
  const total = dados?.map((i) => i.count).reduce((a, b) => a + b, 0);

  const chartOptions = useChart({
    labels: dados.map((i) => i.department),
    stroke: { width: 1, color: 'transparent' },
    legend: { show: false },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (value) => fNumber(value), title: { formatter: (seriesName) => `${seriesName}` } },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: { value: { formatter: (value) => fNumber(value) }, total: { formatter: () => fNumber(total) } },
        },
      },
    },
  });

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Distribuição por departamento" />
      <Stack direction="row" alignItems="center" justifyContent="space-around" spacing={3} sx={{ flexGrow: 1, p: 2 }}>
        <Chart type="donut" series={chartSeries} options={chartOptions} height={250} />

        <Stack spacing={1.2}>
          {dados.map((s, index) => (
            <Stack key={s.department} direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, backgroundColor: chartColors.main[index], borderRadius: 1 }} />
                <Typography variant="body2">
                  {s.department}{' '}
                  <Typography component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                    ({fPercent((s.count * 100) / total)})
                  </Typography>
                </Typography>
              </Stack>
              <Typography variant="subtitle2">{s.count}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Evolucao({ dados, periodo }) {
  const categories = periodo === 'Mensal' ? dados.map((i) => i.day) : dados.map((i) => mesesAbr[i.month - 1].label);

  const series = [
    { name: 'Abertos', data: dados.map((i) => i.opened) },
    { name: 'Resolvidos', data: dados.map((i) => i.resolved) },
  ];

  const chartOptions = useChart({
    stroke: { width: 2 },
    xaxis: { categories },
    // markers: { size: 3, strokeWidth: 1 },
    legend: { position: 'bottom', horizontalAlign: 'center' },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={periodo === 'Mensal' ? 'Evolução diária' : 'Evolução mensal'} />
      <Box sx={{ p: 1 }}>
        <Chart type="area" series={series} options={chartOptions} height={300} />
      </Box>
    </Card>
  );
}
