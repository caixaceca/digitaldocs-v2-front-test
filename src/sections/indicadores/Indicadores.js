import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel-3';
// @mui
import {
  Fab,
  Box,
  Grid,
  Card,
  Stack,
  Table,
  Paper,
  Tooltip,
  TableRow,
  TableCell,
  TextField,
  TableBody,
  Typography,
  CardContent,
  Autocomplete,
  TableContainer,
  TableHead,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { format, add } from 'date-fns';
import useTable, { getComparator, applySort } from '../../hooks/useTable';
import { ptDate, fMShortYear, fMonthYear, fYear, padraoMYDate } from '../../utils/formatTime';
import { fNumber, fPercent, fNumber2, fData, converterSegundos } from '../../utils/formatNumber';
// redux
import { getIndicadores } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Image from '../../components/Image';
import Scrollbar from '../../components/Scrollbar';
import Chart, { useChart } from '../../components/chart';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';
import { TableHeadCustom, TableSearchNotFound, SearchNotFound, TablePaginationAlt } from '../../components/table';
// ----------------------------------------------------------------------

const vistas = [
  { id: 'diario', label: 'Diária' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'anual', label: 'Anual' },
];

const origens = [
  { id: 'c', label: 'Criação' },
  { id: 'e', label: 'Entrada' },
];

const TABLE_HEAD = [
  { id: 'assunto', label: 'Fluxo/Assunto', align: 'left' },
  { id: 'nome', label: 'Estado/Ambiente', align: 'left' },
  { id: 'tempo_execucao', label: 'Tempo médio', align: 'left' },
];

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Criacao() {
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
          ptDate(row?.criado_em)
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
      <HeaderBreadcrumbs
        action=""
        links={[{ name: '' }]}
        heading="Criação de processos"
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ pb: 1 }}>
          <Autocomplete
            fullWidth
            value={vista}
            disableClearable
            onChange={(event, newValue) => {
              setMes(null);
              setVista(newValue);
            }}
            options={vistas}
            getOptionLabel={(option) => option?.label}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Vista" />}
          />
          {vista?.id === 'diario' && mesesList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={mes}
              options={mesesList}
              getOptionLabel={(option) => option?.label}
              onChange={(event, newValue) => setMes(newValue)}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Mês" />}
            />
          )}
          <Autocomplete
            fullWidth
            value={uo}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setUo(newValue)}
            options={applySort(uos, getComparator('asc', 'label'))}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="U.O" />}
          />
          <Autocomplete
            fullWidth
            value={perfilId1}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setPerfilId1(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
            renderInput={(params) => <TextField {...params} label="Colaborador" />}
          />
          {dataFiltered.length > 0 && (
            <>
              <ReactHTMLTableToExcel
                id="table-xls-button-tipo"
                className="MuiButtonBase-root-MuiButton-root"
                table="table-to-xls-tipo"
                filename="Criação de processos"
                sheet="Criação de processos"
                buttonText={
                  <Tooltip arrow title="EXPORTAR">
                    <Fab color="success" size="small" variant="soft">
                      <Image src="/assets/icons/file_format/format_excel.svg" />
                    </Fab>
                  </Tooltip>
                }
              />
              <Table id="table-to-xls-tipo" sx={{ display: 'none' }}>
                <TableExport label="Data" label1="Quantidade" dados={dataFiltered} />
              </Table>
            </>
          )}
        </Stack>
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
                        <CardInfo
                          title={row?.label}
                          total={row?.valor}
                          label={
                            row?.label !== 'Total' && row?.label !== 'Média' ? (
                              <>
                                {(vista?.id === 'anual' && fYear(row?.desc)) ||
                                  (vista?.id === 'mensal' && fMonthYear(row?.desc)) ||
                                  ptDate(row?.desc)}
                              </>
                            ) : (
                              row?.desc
                            )
                          }
                        />
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

export function Execucao() {
  const dispatch = useDispatch();
  const [fluxo, setFuxo] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [estado, setEstado] = useState(null);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.intranet);
  const { isLoading, meusAmbientes, tempoExecucao } = useSelector((state) => state.digitaldocs);
  const {
    page,
    order,
    dense,
    orderBy,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'assunto', defaultRowsPerPage: tempoExecucao.length });
  const perfilId = currentColaborador?.perfil_id;
  useEffect(() => {
    if (currentColaborador) {
      setPerfil({
        id: currentColaborador?.perfil?.id,
        label: currentColaborador?.perfil?.displayName,
        sexo: currentColaborador?.sexo,
      });
    }
  }, [currentColaborador]);
  const colaboradoresList = [];
  colaboradores?.forEach((row) => {
    colaboradoresList.push({ id: row?.perfil_id, label: row?.perfil?.displayName, sexo: row?.sexo });
  });
  const fluxosList = [];
  meusAmbientes?.forEach((row) => {
    row?.fluxos?.forEach((fluxo) => {
      if (fluxo?.id > 0 && !fluxosList.some((obj) => obj.id === fluxo?.id)) {
        fluxosList.push({ id: fluxo?.id, label: fluxo?.assunto });
      }
    });
  });
  const dataFiltered = applySortFilter({ tempoExecucao, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    if (mail && perfilId && (fluxo?.id || perfil?.id || estado?.id)) {
      dispatch(
        getIndicadores('tempoExecucao', {
          mail,
          perfilId,
          fluxoIDFilter: fluxo?.id,
          perfilIDFilter: perfil?.id,
          estadoIDFilter: estado?.id,
        })
      );
    }
  }, [dispatch, perfilId, fluxo?.id, perfil?.id, estado?.id, mail]);

  return (
    <>
      <HeaderBreadcrumbs
        action=""
        links={[{ name: '' }]}
        heading="Tempo de execução"
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ pb: 1 }}>
          <Autocomplete
            fullWidth
            value={fluxo}
            getOptionLabel={(option) => option?.label}
            disableClearable={!perfil?.id && !estado?.id}
            onChange={(event, newValue) => setFuxo(newValue)}
            options={applySort(fluxosList, getComparator('asc', 'label'))}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Fluxo/Assunto" />}
          />
          <Autocomplete
            fullWidth
            value={estado}
            getOptionLabel={(option) => option?.nome}
            disableClearable={!fluxo?.id && !perfil?.id}
            onChange={(event, newValue) => setEstado(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(
              meusAmbientes?.filter((option) => option?.id > 0),
              getComparator('asc', 'nome')
            )}
            renderInput={(params) => <TextField {...params} label="Estado/Ambiente" />}
          />
          <Autocomplete
            fullWidth
            value={perfil}
            getOptionLabel={(option) => option.label}
            disableClearable={!estado?.id && !fluxo?.id}
            onChange={(event, newValue) => setPerfil(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
            renderInput={(params) => <TextField {...params} label="Colaborador" />}
          />
        </Stack>
        {dataFiltered.length > 0 && (
          <Paper sx={{ p: 3, mt: 1, mb: dataFiltered.length > 1 && 2, bgcolor: 'background.neutral', flexGrow: 1 }}>
            {perfil?.label ? (
              <Typography sx={{ textAlign: 'center' }}>
                Em média {perfil?.sexo === 'Masculino' ? 'o' : 'a'}{' '}
                <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                  {perfil?.label}
                </Typography>{' '}
                passa{' '}
                <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                  {converterSegundos(sumBy(dataFiltered, 'tempo_execucao') / dataFiltered.length)}
                </Typography>{' '}
                trabalhando em um processo{' '}
                {fluxo?.label && (
                  <>
                    de{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {fluxo?.label}
                    </Typography>
                  </>
                )}{' '}
                {estado?.nome && (
                  <>
                    no estado{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {estado?.nome}
                    </Typography>
                  </>
                )}
              </Typography>
            ) : (
              <>
                {fluxo?.label ? (
                  <Typography sx={{ textAlign: 'center' }}>
                    Em média um processo de{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {fluxo?.label}
                    </Typography>{' '}
                    passa{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {converterSegundos(
                        sumBy(
                          dataFiltered?.filter(
                            (row) => !row?.nome?.includes('Atendimento') && !row?.nome?.includes('Gerência')
                          ),
                          'tempo_execucao'
                        ) +
                          sumBy(
                            dataFiltered?.filter((row) => row?.nome?.includes('Atendimento')),
                            'tempo_execucao'
                          ) /
                            dataFiltered?.filter((row) => row?.nome?.includes('Atendimento'))?.length +
                          sumBy(
                            dataFiltered?.filter((row) => row?.nome?.includes('Gerência')),
                            'tempo_execucao'
                          ) /
                            dataFiltered?.filter((row) => row?.nome?.includes('Gerência'))?.length
                      )}
                    </Typography>{' '}
                    sendo executado{' '}
                    {estado?.nome && (
                      <>
                        no estado{' '}
                        <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                          {estado?.nome}
                        </Typography>
                      </>
                    )}
                  </Typography>
                ) : (
                  <Typography sx={{ textAlign: 'center' }}>
                    Em média um processo passa{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {converterSegundos(sumBy(dataFiltered, 'tempo_execucao') / dataFiltered.length)}
                    </Typography>{' '}
                    sendo exectado no estado{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {estado?.nome}
                    </Typography>
                  </Typography>
                )}
              </>
            )}
          </Paper>
        )}
        {(dataFiltered.length === 0 || dataFiltered.length > 1) && (
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={3} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row.nome}</TableCell>
                        <TableCell>{converterSegundos(row.tempo_execucao)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum fluxo disponível..." />
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Duracao() {
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

  const resumo = [
    { label: 'Média', valor: sumBy(duracaoByItem, 'dias') / duracaoByItem?.length, desc: '' },
    {
      label: 'Maior duração',
      valor: Math.max(...duracaoByItem?.map((row) => row.dias)),
      desc: duracaoByItem?.find((row) => row.dias === Math.max(...duracaoByItem?.map((row) => row.dias)))?.label,
    },
    {
      label: 'Menor duração',
      valor: Math.min(...duracaoByItem?.map((row) => row.dias)),
      desc: duracaoByItem?.find((row) => row.dias === Math.min(...duracaoByItem?.map((row) => row.dias)))?.label,
    },
  ];

  const seriesVolume = [{ name: 'Média em dias', data: duracaoByItem?.map((row) => row?.dias) }];
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
      <HeaderBreadcrumbs
        action=""
        links={[{ name: '' }]}
        heading="Média de duração dos processos"
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ pb: 1 }}>
          <Autocomplete
            fullWidth
            value={origem}
            disableClearable
            options={origens}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setOrigem(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} fullWidth label="Origem" />}
          />
          <Autocomplete
            fullWidth
            value={assunto}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setAssunto(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(assuntosList, getComparator('asc', 'label'))}
            renderInput={(params) => <TextField {...params} fullWidth label="Assunto/Fluxo" />}
          />
          <Autocomplete
            fullWidth
            value={perfilPID}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setPerfilPID(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
            renderInput={(params) => <TextField {...params} fullWidth label="Colaborador" />}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <DatePicker
              value={dataInicio}
              label="Data inicial"
              onChange={(newValue) => setDataInicio(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { minWidth: { xs: 150, lg: 200 } } } }}
            />
            <DatePicker
              value={dataFim}
              label="Data final"
              onChange={(newValue) => setDataFim(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { minWidth: { xs: 150, lg: 200 } } } }}
            />
            {duracaoByItem.length > 0 && (
              <>
                <ReactHTMLTableToExcel
                  id="table-xls-button-tipo"
                  className="MuiButtonBase-root-MuiButton-root"
                  table="table-to-xls-tipo"
                  filename="Média de duração dos processos"
                  sheet="Média de duração dos processos"
                  buttonText={
                    <Tooltip arrow title="EXPORTAR">
                      <Fab color="success" size="small" variant="soft">
                        <Image src="/assets/icons/file_format/format_excel.svg" />
                      </Fab>
                    </Tooltip>
                  }
                />
                <Table id="table-to-xls-tipo" sx={{ display: 'none' }}>
                  <TableExport label="Label" label1="Dias" dados={duracaoByItem} />
                </Table>
              </>
            )}
          </Stack>
        </Stack>
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
                      <Grid key={row?.label} item xs={12} sm={4}>
                        <CardInfo title={row?.label} total={row?.valor} label={row?.desc} duracao />
                      </Grid>
                    ))}
                  </Grid>
                  <Chart type="bar" series={seriesVolume} options={chartOptions} height={500} />
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

export function FileSystem() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { fileSystem, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const isNotFound = !fileSystem.length;
  const chartColors = [theme.palette.primary.main, theme.palette.primary.dark];
  const chartOptions = useChart({
    chart: { offsetY: -16, sparkline: { enabled: true } },
    grid: { padding: { top: 24, bottom: 24 } },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '56%' },
        dataLabels: {
          name: { offsetY: 8 },
          value: { offsetY: -50 },
          total: {
            label: `Usado de ${fData(500000000000)}`,
            color: theme.palette.text.disabled,
            fontSize: theme.typography.body2.fontSize,
            fontWeight: theme.typography.body2.fontWeight,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [chartColors].map((colors) => [
          { offset: 0, color: colors[0] },
          { offset: 75, color: colors[1] },
        ]),
      },
    },
  });

  const total = { tipo: 'Total', qnt: 0, tamanho: 0, file: 'folder' };
  const pdf = { tipo: 'Pdf', qnt: 0, tamanho: 0, file: 'format_pdf' };
  const outros = { tipo: 'Outros', qnt: 0, tamanho: 0, file: 'file' };
  const word = { tipo: 'Word', qnt: 0, tamanho: 0, file: 'format_word' };
  const imagem = { tipo: 'Img', qnt: 0, tamanho: 0, file: 'format_image' };
  const excel = { tipo: 'Excel', qnt: 0, tamanho: 0, file: 'format_excel' };

  fileSystem?.forEach((row) => {
    total.qnt += row.quantidade;
    total.tamanho += row.tamanhoMB * 1000000;
    if (row.tipo === 'application/pdf') {
      pdf.qnt += row.quantidade;
      pdf.tamanho += row.tamanhoMB * 1000000;
    } else if (row.tipo.includes('image/')) {
      imagem.qnt += row.quantidade;
      imagem.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      row.tipo.includes('excel')
    ) {
      excel.qnt += row.quantidade;
      excel.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      row.tipo.includes('msword')
    ) {
      word.qnt += row.quantidade;
      word.tamanho += row.tamanhoMB * 1000000;
    } else {
      outros.qnt += row.quantidade;
      outros.tamanho += row.tamanhoMB * 1000000;
    }
  });

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getIndicadores('fileSystem', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  return (
    <>
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {isLoading ? (
              ''
            ) : (
              <>
                {isNotFound ? (
                  <Grid item xs={12}>
                    <SearchNotFound message="Nenhum registo encontrado" />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Chart
                        height={500}
                        type="radialBar"
                        options={chartOptions}
                        series={[((total?.tamanho * 100) / 500000000000).toFixed(2)]}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={2}>
                        {[total, pdf, imagem, excel, word, outros].map(
                          (folder) =>
                            folder.qnt > 0 && (
                              <Card
                                key={folder.tipo}
                                sx={{
                                  p: 2,
                                  boxShadow: 'none',
                                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                                  '&:hover': {
                                    bgcolor: 'background.neutral',
                                    boxShadow: (theme) => theme.customShadows.z2,
                                  },
                                }}
                              >
                                <Stack spacing={2} direction="row" alignItems="center">
                                  <Box
                                    component="img"
                                    sx={{ width: 45, height: 45 }}
                                    src={`/assets/icons/file_format/${folder.file}.svg`}
                                  />

                                  <Stack spacing={0.5} flexGrow={1}>
                                    <Typography variant="subtitle1">{folder.tipo}</Typography>
                                    <Stack direction="row" alignContent="center" spacing={0.5}>
                                      <Typography variant="body2">{fNumber(folder.qnt)} </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', typography: 'body2' }}
                                      >
                                        {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={0.5}>
                                    <Typography variant="h6"> {fData(folder.tamanho)} </Typography>
                                    {folder.tipo !== 'Total' && (
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', typography: 'body2' }}
                                      >
                                        ({fPercent((folder.tamanho * 100) / total.tamanho)})
                                      </Typography>
                                    )}
                                  </Stack>
                                </Stack>
                              </Card>
                            )
                        )}
                      </Stack>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Volume() {
  const dispatch = useDispatch();
  const [top, setTop] = useState('Todos');
  const [escopo, setEscopo] = useState({ id: 'uo', label: 'U.O' });
  const { isLoading, volume } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const perfilId = currentColaborador?.perfil_id;

  const volumeByItem = [];
  volume?.forEach((row, index) => {
    if (escopo?.id === 'uo') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (top === 'Todos') {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (escopo?.id === 'perfil') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (top === 'Todos') {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });
  const isNotFound = !volumeByItem.length;

  const resumo = [
    { label: 'Total', valor: sumBy(volumeByItem, 'total'), desc: '' },
    { label: 'Média', valor: sumBy(volumeByItem, 'total') / volumeByItem?.length, desc: '' },
    {
      label: 'Mais processos',
      valor: Math.max(...volumeByItem?.map((row) => row.total)),
      desc: volumeByItem?.find((row) => row.total === Math.max(...volumeByItem?.map((row) => row.total)))?.label,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...volumeByItem?.map((row) => row.total)),
      desc: volumeByItem?.find((row) => row.total === Math.min(...volumeByItem?.map((row) => row.total)))?.label,
    },
  ];

  const seriesVolume = [{ name: 'Nº de processos', data: volumeByItem?.map((row) => row?.total) }];
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    plotOptions: { bar: { columnWidth: '25%' } },
    stroke: { show: false },
    xaxis: { categories: volumeByItem?.map((row) => row?.label) },
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
      dispatch(getIndicadores('indicadoresVolume', { mail, escopo: escopo?.id, perfilId }));
    }
  }, [dispatch, perfilId, escopo?.id, mail]);

  return (
    <>
      <HeaderBreadcrumbs
        action=""
        links={[{ name: '' }]}
        heading="Volume de criação de processos"
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ pb: 1 }}>
          <Autocomplete
            fullWidth
            value={escopo}
            disableClearable
            onChange={(event, newValue) => setEscopo(newValue)}
            options={[
              { id: 'uo', label: 'U.O' },
              { id: 'perfil', label: 'Colaborador' },
            ]}
            getOptionLabel={(option) => option?.label}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Escopo" />}
          />
          <Autocomplete
            fullWidth
            value={top}
            disableClearable
            options={['5', '10', '20', 'Todos']}
            onChange={(event, newValue) => setTop(newValue)}
            renderInput={(params) => <TextField {...params} label="Top" />}
          />
          {volumeByItem.length > 0 && (
            <>
              <ReactHTMLTableToExcel
                id="table-xls-button-tipo"
                className="MuiButtonBase-root-MuiButton-root"
                table="table-to-xls-tipo"
                filename="Volume de criação de processos"
                sheet="Volume de criação de processos"
                buttonText={
                  <Tooltip arrow title="EXPORTAR">
                    <Fab color="success" size="small" variant="soft">
                      <Image src="/assets/icons/file_format/format_excel.svg" />
                    </Fab>
                  </Tooltip>
                }
              />
              <Table id="table-to-xls-tipo" sx={{ display: 'none' }}>
                <TableExport label="Label" label1="Quantidade" dados={volumeByItem} />
              </Table>
            </>
          )}
        </Stack>
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
                        <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
                      </Grid>
                    ))}
                  </Grid>
                  <Chart type="bar" series={seriesVolume} options={chartOptions} height={500} />
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

export function Tipos() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const { isLoading, indicadoresTipos, iAmInGrpGerente } = useSelector((state) => state.digitaldocs);
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

  const total = sumBy(indicadoresTipos, 'total');
  const labels = indicadoresTipos?.map((row) => row?.assunto);
  const quantidades = indicadoresTipos?.map((row) => row?.total);
  const percentagem = indicadoresTipos?.map((row) => (row?.total * 100) / total);

  const resumo = [
    { label: 'Total', valor: sumBy(indicadoresTipos, 'total'), desc: '' },
    {
      label: 'Mais processos',
      valor: Math.max(...indicadoresTipos?.map((row) => row.total)),
      desc: indicadoresTipos?.find((row) => row.total === Math.max(...indicadoresTipos?.map((row) => row.total)))
        ?.assunto,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...indicadoresTipos?.map((row) => row.total)),
      desc: indicadoresTipos?.find((row) => row.total === Math.min(...indicadoresTipos?.map((row) => row.total)))
        ?.assunto,
    },
  ];

  const series = [
    { name: 'Quantidade', type: 'column', data: quantidades },
    { name: 'Percentagem', type: 'line', data: percentagem },
  ];

  const chartOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.focus.main],
    legend: { horizontalAlign: 'center' },
    chart: { height: 350, type: 'line', stacked: false },
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    xaxis: { categories: labels, labels: { maxHeight: 250 }, tooltip: { enabled: false } },
    stroke: { curve: 'straight', width: 4 },
    yaxis: [
      {
        labels: {
          formatter(val) {
            return fNumber(val);
          },
        },
        title: { text: 'Quantidade', style: { color: theme.palette.success.main } },
      },
      {
        min: 0,
        max: 100,
        opposite: true,
        seriesName: 'Percentagem',
        labels: {
          formatter(val) {
            return fPercent(val);
          },
        },
        title: { text: 'Percentagem', style: { color: theme.palette.focus.main } },
      },
    ],
    tooltip: {
      y: [
        { formatter: (value) => fNumber(value) },
        { seriesName: 'Percentagem', formatter: (value) => fPercent(value) },
      ],
      x: { show: true },
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
      <HeaderBreadcrumbs
        action=""
        links={[{ name: '' }]}
        heading="Tipo de processos"
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
          <Autocomplete
            fullWidth
            value={uo}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setUo(newValue)}
            options={applySort(uosList, getComparator('asc', 'label'))}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} fullWidth label="U.O" />}
          />
          <Autocomplete
            fullWidth
            value={perfilPID}
            getOptionLabel={(option) => option?.label}
            onChange={(event, newValue) => setPerfilPID(newValue)}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
            renderInput={(params) => <TextField {...params} fullWidth label="Colaborador" />}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <DatePicker
              label="Data inicial"
              disableFuture
              value={dataInicio}
              onChange={(newValue) => setDataInicio(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { minWidth: { xs: 150, md: 200 } } } }}
            />
            <DatePicker
              label="Data final"
              disableFuture
              value={dataFim}
              onChange={(newValue) => setDataFim(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { minWidth: { xs: 150, md: 200 } } } }}
            />
            {indicadoresTipos.length > 0 && (
              <>
                <ReactHTMLTableToExcel
                  id="table-xls-button-tipo"
                  className="MuiButtonBase-root-MuiButton-root"
                  table="table-to-xls-tipo"
                  filename="Tipos de processos"
                  sheet="Tipos de processos"
                  buttonText={
                    <Tooltip arrow title="EXPORTAR">
                      <Fab color="success" size="small" variant="soft">
                        <Image src="/assets/icons/file_format/format_excel.svg" />
                      </Fab>
                    </Tooltip>
                  }
                />
                <Table id="table-to-xls-tipo" sx={{ display: 'none' }}>
                  <TableExport label="Processo" label1="Quantidade" dados={indicadoresTipos} />
                </Table>
              </>
            )}
          </Stack>
        </Stack>
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
                      <Grid key={row?.label} item xs={12} sm={4}>
                        <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
                      </Grid>
                    ))}
                  </Grid>
                  <Chart type="line" series={series} options={chartOptions} height={500} />
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

CardInfo.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  total: PropTypes.number,
  duracao: PropTypes.bool,
};

function CardInfo({ title, label, total, duracao }) {
  return (
    <Card
      sx={{
        pb: 1,
        height: 1,
        textAlign: 'center',
        pt: { xs: 2, md: label ? 2 : 4 },
        '&:hover': { bgcolor: 'background.neutral' },
        border: (theme) => theme.palette.mode === 'dark' && `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="h5" sx={{ color: 'text.success', py: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ color: 'text.secondary' }}>
        {duracao ? `${total?.toFixed(2)} ${total > 1 ? 'dias' : 'dia'}` : fNumber(total)}
      </Typography>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableExport.propTypes = { label: PropTypes.string, label1: PropTypes.string, dados: PropTypes.array };

function TableExport({ label, label1, dados }) {
  return (
    <>
      <TableHead>
        <TableRow>
          <TableCell>{label}</TableCell>
          <TableCell align="right">{label1}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {dados?.map((row, index) => (
          <TableRow key={`table_row_export_${index}`}>
            <TableCell>{row?.assunto || row?.criado_em || row?.label}</TableCell>
            <TableCell align="right">{row?.total || row?.dias}</TableCell>
          </TableRow>
        ))}
      </TableBody>
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

// ----------------------------------------------------------------------

function applySortFilter({ tempoExecucao, comparator }) {
  const stabilizedThis = tempoExecucao.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return tempoExecucao;
}
