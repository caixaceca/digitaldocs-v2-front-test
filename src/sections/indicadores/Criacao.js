import { sumBy } from 'lodash';
import { useEffect, useState } from 'react';
// @mui
import { Grid, Card, Stack, TextField, CardHeader, Typography, Autocomplete, CardContent } from '@mui/material';
// utils
import { fNumber } from '../../utils/formatNumber';
import { padraoDate, fMShortYear, fMonthYear, fYear, padraoMYDate } from '../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { getIndicadores } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// components
import { BarChart } from '../../components/skeleton';
import { SearchNotFound } from '../../components/table';
import Chart, { useChart } from '../../components/chart';

// ----------------------------------------------------------------------

const vistas = [
  { id: 'diario', label: 'Diária' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'anual', label: 'Anual' },
];

// --------------------------------------------------------------------------------------------------------------------------------------------

export default function Criacao() {
  const dispatch = useDispatch();
  const { isLoading, iAmInGrpGerente, indicadores } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const perfilId = currentColaborador?.perfil_id;
  const [mes, setMes] = useState(null);
  const [vista, setVista] = useState({ id: 'diario', label: 'Diária' });
  const [uo, setUo] = useState(
    currentColaborador?.uo ? { id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label } : null
  );
  useEffect(() => {
    if (currentColaborador?.uo) {
      setUo({ id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label });
    }
  }, [currentColaborador?.uo]);
  const [perfilId1, setPerfilId1] = useState(
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
  const mesesList = [];
  indicadores?.forEach((row) => {
    const mes = { id: padraoMYDate(row?.criado_em), label: fMShortYear(row?.criado_em) };
    if (!mesesList.some((obj) => obj.id === mes?.id)) {
      mesesList.push(mes);
    }
  });
  const dataFiltered = applyFilter({ indicadores, mes });
  const isNotFound = !dataFiltered.length;
  const series = [{ name: 'Nº de processos', data: dataFiltered?.map((row) => row?.total) }];
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    xaxis: {
      categories: dataFiltered?.map(
        (row) =>
          (vista?.id === 'anual' && fYear(row?.criado_em)) ||
          (vista?.id === 'mensal' && fMShortYear(row?.criado_em)) ||
          padraoDate(row?.criado_em)
      ),
    },
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

  const resumo = [
    { label: 'Total', valor: sumBy(dataFiltered, 'total'), desc: '' },
    { label: 'Média', valor: sumBy(dataFiltered, 'total') / dataFiltered?.length, desc: vista?.label },
    {
      label: 'Mais processos',
      valor: Math.max(...dataFiltered?.map((row) => row.total)),
      desc: dataFiltered?.find((row) => row.total === Math.max(...dataFiltered?.map((row) => row.total)))?.criado_em,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...dataFiltered?.map((row) => row.total)),
      desc: dataFiltered?.find((row) => row.total === Math.min(...dataFiltered?.map((row) => row.total)))?.criado_em,
    },
  ];

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(
        getIndicadores('indicadoresCriacao', { mail, uo: uo?.id, vista: vista?.id, perfilId1: perfilId1?.id, perfilId })
      );
    }
  }, [dispatch, perfilId, vista, uo?.id, perfilId1?.id, mail]);

  return (
    <>
      <Card>
        <CardHeader
          title="Criação de processos"
          sx={{ mb: 2 }}
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Autocomplete
                fullWidth
                size="small"
                value={vista}
                disableClearable
                sx={{ minWidth: 110 }}
                onChange={(event, newValue) => {
                  setMes(null);
                  setVista(newValue);
                }}
                options={vistas?.map((option) => option)}
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="Vista" />}
              />
              {vista?.id === 'diario' && mesesList?.length > 1 && (
                <Autocomplete
                  fullWidth
                  size="small"
                  value={mes}
                  sx={{ minWidth: 150 }}
                  onChange={(event, newValue) => setMes(newValue)}
                  options={mesesList?.map((option) => option)}
                  getOptionLabel={(option) => option?.label}
                  renderInput={(params) => <TextField {...params} label="Mês" />}
                />
              )}
              <Autocomplete
                fullWidth
                value={uo}
                size="small"
                sx={{ minWidth: 220 }}
                onChange={(event, newValue) => setUo(newValue)}
                options={applySort(uos, getComparator('asc', 'label'))?.map((option) => option)}
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="U.O" />}
              />
              <Autocomplete
                fullWidth
                size="small"
                value={perfilId1}
                sx={{ minWidth: 220 }}
                onChange={(event, newValue) => setPerfilId1(newValue)}
                options={applySort(colaboradoresList, getComparator('asc', 'label'))?.map((option) => option)}
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="Colaborador" />}
              />
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
                <>
                  <Grid container spacing={3} sx={{ mb: 7 }}>
                    {resumo?.map((row) => (
                      <Grid key={row?.label} item xs={12} sm={6} md={3}>
                        <Card
                          sx={{
                            py: 2,
                            textAlign: 'center',
                            border: (theme) => theme.palette.mode === 'dark' && `solid 1px ${theme.palette.divider}`,
                          }}
                        >
                          <Typography variant="subtitle1">{row?.label}</Typography>
                          <Typography variant="subtitle1" sx={{ color: 'text.success' }}>
                            &nbsp;
                            {row?.label !== 'Total' && row?.label !== 'Média' ? (
                              <>
                                {(vista?.id === 'anual' && fYear(row?.desc)) ||
                                  (vista?.id === 'mensal' && fMonthYear(row?.desc)) ||
                                  padraoDate(row?.desc)}
                              </>
                            ) : (
                              row?.desc
                            )}
                            &nbsp;
                          </Typography>
                          <Typography variant="h3" sx={{ color: 'text.secondary' }}>
                            {fNumber(row?.valor)}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Chart type="area" series={series} options={chartOptions} height={400} />
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function applyFilter({ indicadores, mes }) {
  const stabilizedThis = indicadores.map((el, index) => [el, index]);
  indicadores = stabilizedThis.map((el) => el[0]);
  if (mes?.id) {
    indicadores = indicadores.filter(
      (row) => row?.criado_em && row?.criado_em.toString().toLowerCase().indexOf(mes.id.toLowerCase()) !== -1
    );
  }

  return indicadores;
}
