import { useState } from 'react';
import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Divider,
  Accordion,
  Typography,
  CardHeader,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
// utils
import { fNumber, fPercent } from '../../../utils/formatNumber';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_SIZE = { width: 95, height: 95 };

// ----------------------------------------------------------------------

ProcessosPorTipo.propTypes = {
  dados: PropTypes.array,
  total: PropTypes.number,
};

export default function ProcessosPorTipo({ dados, total }) {
  const theme = useTheme();
  const [controlled, setControlled] = useState(false);
  const chartData = [
    { label: 'Trabalhado', percent: 72.5, total: 2700 },
    { label: 'No prazo', percent: 70, total: 2400 },
    { label: 'Por trabalhar', percent: 15, total: 550 },
    { label: 'Devolvidos', percent: 3.5, total: 110 },
  ];
  const chartOptions = merge(BaseOptionChart(), {
    chart: { sparkline: { enabled: true } },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        hollow: { size: '67%' },
        track: { margin: 0 },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            fontSize: theme.typography.subtitle2.fontSize,
          },
        },
      },
    },
  });
  const chartOptionsNoPrazo = {
    ...chartOptions,
    colors: [theme.palette.success.light],
  };
  const chartOptionsPorTrabalhar = {
    ...chartOptions,
    colors: [theme.palette.warning.main],
  };
  const chartOptionsDevolvidos = {
    ...chartOptions,
    colors: [theme.palette.error.main],
  };

  const handleChangeControlled = (panel) => (event, isExpanded) => {
    setControlled(isExpanded ? panel : false);
  };

  return (
    <Card>
      <CardHeader title="Processos por assunto" />
      <Stack spacing={1} sx={{ p: 3 }}>
        {dados.map((row) => (
          <Accordion
            key={row.titulo}
            expanded={controlled === row.titulo}
            onChange={handleChangeControlled(row.titulo)}
          >
            <AccordionSummary expandIcon={<SvgIconStyle src="/assets/icons/arrow-ios-downward.svg" />}>
              <Stack spacing={1} sx={{ flexGrow: 1, mr: 3, pt: 0.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center">
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {row.titulo}
                  </Typography>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="h6">{fNumber(row.total)}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      &nbsp;({fPercent((row.total * 100) / total)})
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </AccordionSummary>
            {controlled === row.titulo && <Divider sx={{ mb: 1.5 }} />}
            <AccordionDetails>
              <Box
                sx={{ display: 'grid', gap: 1, gridTemplateColumns: { lg: 'repeat(4, 1fr)', sm: 'repeat(2, 1fr)' } }}
              >
                {chartData.map((item) => (
                  <>
                    <Stack
                      key={`${row.titulo}-${item.label}`}
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={3}
                      sx={{ width: 1, pt: 3, pb: 2 }}
                    >
                      <ReactApexChart
                        type="radialBar"
                        series={[item.percent]}
                        options={
                          (item.label === 'Trabalhado' && chartOptions) ||
                          (item.label === 'No prazo' && chartOptionsNoPrazo) ||
                          (item.label === 'Por trabalhar' && chartOptionsPorTrabalhar) ||
                          (item.label === 'Devolvidos' && chartOptionsDevolvidos)
                        }
                        {...CHART_SIZE}
                      />

                      <div>
                        <Typography variant="body1" sx={{ opacity: 0.72 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h6">{fNumber(item.total)}</Typography>
                      </div>
                    </Stack>
                  </>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Card>
  );
}
