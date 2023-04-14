import { useEffect, useState } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, Stack, TextField, CardHeader, Autocomplete, CardContent } from '@mui/material';
// utils
import { format, add } from 'date-fns';
import { fNumber2 } from '../../utils/formatNumber';
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

const origens = [
  { id: 'c', label: 'Criação' },
  { id: 'e', label: 'Entrada' },
];

// --------------------------------------------------------------------------------------------------------------------------------------------

export default function Duracao() {
  const dispatch = useDispatch();
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const { isLoading, iAmInGrpGerente, duracao, meusAmbientes } = useSelector((state) => state.digitaldocs);
  const perfilId = currentColaborador?.perfil_id;
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [assunto, setAssunto] = useState(null);
  const [origem, setOrigem] = useState({ id: 'c', label: 'Criação' });

  const [perfilPID, setPerfilPID] = useState(
    iAmInGrpGerente
      ? null
      : (currentColaborador?.perfil && {
          id: currentColaborador?.perfil?.id,
          label: currentColaborador?.perfil?.displayName,
        }) ||
          null
  );
  const assuntos = [];
  meusAmbientes?.forEach((row) => {
    row?.fluxos?.forEach((fluxo) => {
      assuntos.push({ id: fluxo?.id, label: fluxo?.assunto });
    });
  });
  const assuntosList = [
    ...new Map(assuntos?.filter((row) => row?.label !== 'Todos').map((item) => [item?.label, item])).values(),
  ];
  const colaboradoresList = [];
  colaboradores?.forEach((row) => {
    colaboradoresList.push({ id: row?.perfil_id, label: row?.perfil?.displayName });
  });
  const duracaoByItem = [];
  duracao?.forEach((row) => {
    const uo = uos?.find((uo) => uo.id === row?.uo_origem_id);
    duracaoByItem.push({ dias: row?.dmedh / 24, label: uo?.label || row?.uo_origem_id });
  });
  const isNotFound = !duracaoByItem.length;

  const seriesRanking = [{ name: 'Média em dias', data: duracaoByItem?.map((row) => row?.dias) }];
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    plotOptions: { bar: { columnWidth: '25%' } },
    stroke: { show: false },
    xaxis: { categories: duracaoByItem?.map((row) => row?.label) },
    yaxis: {
      title: { text: 'Dias' },
      labels: {
        formatter(val) {
          return val.toFixed(0);
        },
      },
    },
    tooltip: { y: { formatter: (value) => fNumber2(value) } },
  });

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(
        getIndicadores('duracao', {
          mail,
          perfilId,
          origem: origem?.id,
          fluxoID: assunto?.id,
          perfilPID: perfilPID?.id,
          dataf: dataFim ? format(add(new Date(dataFim), { hours: 2 }), 'yyyy-MM-dd') : null,
          datai: dataInicio ? format(add(new Date(dataInicio), { hours: 2 }), 'yyyy-MM-dd') : null,
        })
      );
    }
  }, [dispatch, perfilId, assunto?.id, perfilPID?.id, origem?.id, dataInicio, dataFim, mail]);

  return (
    <>
      <Card>
        <CardHeader
          title="Média de duração dos processos"
          sx={{ mb: 2 }}
          action={
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <Autocomplete
                  fullWidth
                  size="small"
                  value={origem}
                  disableClearable
                  sx={{ minWidth: { sm: 120 } }}
                  onChange={(event, newValue) => setOrigem(newValue)}
                  options={origens?.map((option) => option)}
                  getOptionLabel={(option) => option?.label}
                  renderInput={(params) => <TextField {...params} fullWidth label="Origem" />}
                />
                <Autocomplete
                  fullWidth
                  value={assunto}
                  size="small"
                  sx={{ minWidth: { sm: 220 } }}
                  onChange={(event, newValue) => setAssunto(newValue)}
                  options={applySort(assuntosList, getComparator('asc', 'label'))?.map((option) => option)}
                  getOptionLabel={(option) => option?.label}
                  renderInput={(params) => <TextField {...params} fullWidth label="Assunto" />}
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
                  <Grid item xs={12}>
                    <Chart type="bar" series={seriesRanking} options={chartOptions} height={400} />
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
