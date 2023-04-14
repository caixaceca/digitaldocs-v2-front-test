import sumBy from 'lodash/sumBy';
import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Box,
  Grid,
  Card,
  Stack,
  TextField,
  Typography,
  CardHeader,
  Autocomplete,
  CardContent,
  ListItemButton,
} from '@mui/material';
// utils
import { format, add } from 'date-fns';
import { fNumber, fPercent } from '../../utils/formatNumber';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/digitaldocs';
// components
import { BarChart } from '../../components/skeleton';
import { SearchNotFound } from '../../components/table';
import Chart, { useChart } from '../../components/chart';

// --------------------------------------------------------------------------------------------------------------------------------------------

export default function Tipos() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const { isLoading, iAmInGrpGerente, indicadoresTipos } = useSelector((state) => state.digitaldocs);
  const perfilId = currentColaborador?.perfil_id;
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [uo, setUo] = useState(
    currentColaborador?.uo ? { id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label } : null
  );
  useEffect(() => {
    if (currentColaborador?.uo) {
      setUo({ id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label });
    }
  }, [currentColaborador?.uo]);
  const [perfilPID, setPerfilPID] = useState(
    iAmInGrpGerente
      ? null
      : (currentColaborador?.perfil && {
          id: currentColaborador?.perfil?.id,
          label: currentColaborador?.perfil?.displayName,
        }) ||
          null
  );
  const uosList = [];
  uos?.forEach((row) => {
    uosList.push({ id: row?.id, label: row?.label });
  });
  const colaboradoresList = [];
  colaboradores?.forEach((row) => {
    if (uo?.id && row?.uo?.id === uo?.id) {
      colaboradoresList.push({ id: row?.perfil_id, label: row?.perfil?.displayName });
    } else if (!uo?.id) {
      colaboradoresList.push({ id: row?.perfil_id, label: row?.perfil?.displayName });
    }
  });
  const isNotFound = !indicadoresTipos.length;

  const colors = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.error.light,
    theme.palette.warning.main,
    theme.palette.focus.main,
    theme.palette.chart.violet[1],
    theme.palette.chart.yellow[1],
    theme.palette.success.light,
    theme.palette.info.light,
    theme.palette.error.main,
    theme.palette.warning.light,
    theme.palette.focus.light,
    theme.palette.chart.violet[3],
    theme.palette.chart.yellow[3],
    theme.palette.success.dark,
    theme.palette.info.dark,
    theme.palette.warning.dark,
    theme.palette.focus.dark,
    theme.palette.error.dark,
  ];

  const chartSeries = indicadoresTipos.map((i) => i.total);
  const chartOptions = useChart({
    colors,
    legend: { show: false },
    chart: { sparkline: { enabled: true } },
    labels: indicadoresTipos.map((i) => i.assunto),
    stroke: { colors: [theme.palette.background.paper] },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (value) => fNumber(value), title: { formatter: (seriesName) => `${seriesName}` } },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            value: { formatter: (value) => fNumber(value) },
            total: {
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              },
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(
        getIndicadores('indicadoresTipos', {
          mail,
          perfilId,
          uoID: uo?.id,
          perfilPID: perfilPID?.id,
          dataf: dataFim ? format(add(new Date(dataFim), { hours: 2 }), 'yyyy-MM-dd') : null,
          datai: dataInicio ? format(add(new Date(dataInicio), { hours: 2 }), 'yyyy-MM-dd') : null,
        })
      );
    }
  }, [dispatch, perfilId, uo?.id, perfilPID?.id, dataInicio, dataFim, mail]);

  return (
    <>
      <Card>
        <CardHeader
          title="Tipo de processos"
          sx={{ mb: 2 }}
          action={
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <Autocomplete
                  fullWidth
                  value={uo}
                  size="small"
                  sx={{ minWidth: { sm: 220 } }}
                  onChange={(event, newValue) => setUo(newValue)}
                  options={applySort(uosList, getComparator('asc', 'label'))?.map((option) => option)}
                  getOptionLabel={(option) => option?.label}
                  renderInput={(params) => <TextField {...params} fullWidth label="U.O" />}
                />
                <Autocomplete
                  fullWidth
                  size="small"
                  value={perfilPID}
                  sx={{ minWidth: { sm: 220 } }}
                  onChange={(event, newValue) => setPerfilPID(newValue)}
                  options={applySort(colaboradoresList, getComparator('asc', 'label'))?.map((option) => option)}
                  getOptionLabel={(option) => option?.label}
                  renderInput={(params) => <TextField {...params} fullWidth label="Colaborador" />}
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <DatePicker
                  label="Data"
                  value={dataInicio}
                  onChange={(newValue) => setDataInicio(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { maxWidth: { lg: 155 } } } }}
                />
                <DatePicker
                  label="Data"
                  value={dataFim}
                  onChange={(newValue) => setDataFim(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { maxWidth: { lg: 155 } } } }}
                />
              </Stack>
            </Stack>
          }
        />
        <CardContent>
          {isLoading ? (
            <Stack direction="row" justifyContent="center">
              <BarChart />
            </Stack>
          ) : (
            <>
              {isNotFound ? (
                <SearchNotFound message="Nenhum registo encontrado" />
              ) : (
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Chart type="donut" series={chartSeries} options={chartOptions} height={350} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    {indicadoresTipos.map((row, index) => (
                      <ListItemButton key={row?.assunto} sx={{ borderRadius: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: 0.5,
                              bgcolor: colors[index],
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                            {row.assunto}
                          </Typography>
                          <Typography variant="h5">{fNumber(row.total)}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ({fPercent((row.total * 100) / sumBy(indicadoresTipos, 'total'))})
                          </Typography>
                        </Stack>
                      </ListItemButton>
                    ))}
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
