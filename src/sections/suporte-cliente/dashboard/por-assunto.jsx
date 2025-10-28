// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import Chart, { useChart } from '../../../components/chart';

// ---------------------------------------------------------------------------------------------------------------------

export default function PorAssunto({ dados }) {
  const categorias = dados.map((i) => i.subject);

  const chartSeries = [
    { name: 'Mês atual', data: dados.map((i) => i.count) },
    { name: 'Mês anterior', data: dados.map((i) => i.countPrev) },
  ];

  const chartOptions = useChart({
    chart: { stacked: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value) => fNumber(value), title: { formatter: (seriesName) => `${seriesName}:` } },
    },
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 2, columnWidth: '60%' } },
    xaxis: { categories: categorias },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: false },
    grid: { border: 'none' },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Tickets por assunto" />
      <Box sx={{ mx: 3 }}>
        <Chart type="bar" series={chartSeries} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
