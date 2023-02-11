import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Typography, CardHeader } from '@mui/material';
// utils
import { fNumber, fPercent } from '../../../utils/formatNumber';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

ProcessosNoAno.propTypes = {
  dados: PropTypes.array,
  total: PropTypes.number,
};

export default function ProcessosNoAno({ dados, total }) {
  const theme = useTheme();
  const chartColors = [
    theme.palette.success.main,
    theme.palette.success.light,
    theme.palette.focus.dark,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];
  const chartOptions1 = merge(BaseOptionChart(), {
    colors: chartColors,
    legend: { show: false },
    labels: dados.map((i) => i.label),
    grid: {
      padding: { top: -20, bottom: -20 },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '45%' },
        dataLabels: {
          name: { offsetY: -14 },
          value: { offsetY: 6, fontSize: theme.typography.h4.fontSize },
          total: {
            label: 'Total',
            formatter: () => fNumber(total),
          },
        },
      },
    },
  });
  return (
    <Card>
      <CardHeader title="No ano" sx={{ mb: 2 }} />
      <ReactApexChart
        type="radialBar"
        series={dados.map((i) => ((i.value / total) * 100)?.toFixed(2))}
        options={chartOptions1}
        height={280}
      />
      <Stack spacing={1} sx={{ p: 3 }}>
        {dados.map((item) => (
          <Legend1 key={item.label} item={item} total={total} />
        ))}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

Legend1.propTypes = {
  total: PropTypes.number,
  item: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  }),
};

function Legend1({ total, item }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 15,
            height: 15,
            bgcolor:
              (item.label === 'Trabalhado' && theme.palette.success.main) ||
              (item.label === 'No prazo' && theme.palette.success.light) ||
              (item.label === 'Arquivado' && theme.palette.focus.dark) ||
              (item.label === 'Por trabalhar' && theme.palette.warning.main) ||
              (item.label === 'Devolvidos' && theme.palette.error.main),
            borderRadius: 0.7,
          }}
        />

        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {item.label}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2">{fNumber(item.value)}</Typography>
        <Typography variant="caption">({fPercent((item.value * 100) / total)})</Typography>
      </Stack>
    </Stack>
  );
}
