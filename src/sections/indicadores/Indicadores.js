import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel-3';
// @mui
import {
  Box,
  Tab,
  Tabs,
  Grid,
  Card,
  Radio,
  Stack,
  Table,
  Paper,
  Drawer,
  Dialog,
  Avatar,
  Button,
  Tooltip,
  Divider,
  TableRow,
  TableCell,
  TextField,
  TableBody,
  TableHead,
  CardHeader,
  RadioGroup,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  Autocomplete,
  DialogContent,
  TableContainer,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ClearAllOutlinedIcon from '@mui/icons-material/ClearAllOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
// utils
import { format, add } from 'date-fns';
import { BASEURL } from '../../utils/axios';
import useToggle, { useToggle1 } from '../../hooks/useToggle';
import { fMShortYear, fYear, fMonthYear, ptDate } from '../../utils/formatTime';
import { UosAcesso, EstadosAcesso, ColaboradoresAcesso } from '../../utils/validarAcesso';
import { fNumber, fPercent, fNumber2, fData, converterSegundos } from '../../utils/formatNumber';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { dispatch, useDispatch, useSelector } from '../../redux/store';
import { getIndicadores, resetItem, setEstadoFilter } from '../../redux/slices/digitaldocs';
// components
import Panel from '../../components/Panel';
import Image from '../../components/Image';
import Scrollbar from '../../components/Scrollbar';
import Chart, { useChart } from '../../components/chart';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';
import { TableHeadCustom, TableSearchNotFound, SearchNotFound, TablePaginationAlt } from '../../components/table';

// --------------------------------------------------------------------------------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: { paddingRight: theme.spacing(3) },
}));

const TABLE_HEAD = [
  { id: 'assunto', label: 'Fluxo/Assunto', align: 'left' },
  { id: 'nome', label: 'Estado/Ambiente', align: 'left' },
  { id: 'tempo_execucao', label: 'Tempo médio', align: 'left' },
];

const chartOptionsCommon = (theme) => ({
  colors: [theme.palette.success.main, theme.palette.primary.dark],
  chart: { stacked: false },
  legend: { position: 'bottom', horizontalAlign: 'center' },
  grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
  stroke: { curve: 'straight', width: 3 },
  yaxis: [
    {
      labels: { formatter: (value) => fNumber(value) },
      title: { text: 'Nº de processos', style: { color: theme.palette.success.main } },
    },
    {
      min: 0,
      max: 100,
      opposite: true,
      seriesName: 'Percentagem',
      labels: { formatter: (value) => fPercent(value) },
      title: { text: 'Percentagem', style: { color: theme.palette.primary.dark } },
    },
  ],
  tooltip: {
    y: [{ formatter: (value) => fNumber(value) }, { seriesName: 'Percentagem', formatter: (value) => fPercent(value) }],
    x: { show: true },
  },
});

// --------------------------------------------------------------------------------------------------------------------------------------------

export function FileSystem() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fileSystem, isLoading } = useSelector((state) => state.digitaldocs);
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
    if (mail && cc?.perfil_id) {
      dispatch(getIndicadores('fileSystem', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  return (
    <>
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {isLoading ? (
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="center">
                  <BarChart />
                </Stack>
              </Grid>
            ) : (
              <>
                {isNotFound ? (
                  <Grid item xs={12}>
                    <SearchNotFound message="Nenhum registo encontrado..." />
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
                                  borderRadius: 1,
                                  boxShadow: 'none',
                                  border: `solid 1px ${theme.palette.divider}`,
                                  '&:hover': { bgcolor: 'background.neutral', boxShadow: theme.customShadows.z2 },
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

export function TotalProcessos() {
  const [top, setTop] = useState('Todos');
  const [vista, setVista] = useState('mensal');
  const { cc } = useSelector((state) => state.intranet);
  const [currentTab, setCurrentTab] = useState('criacao');
  const [agrupamento, setAgrupamento] = useState('Unidade orgânica');
  const { meusAmbientes, estadoFilter } = useSelector((state) => state.digitaldocs);
  const [perfil, setPerfil] = useState(cc?.perfil ? { id: cc?.perfil?.id, label: cc?.perfil?.displayName } : null);
  const firstAmbiente = meusAmbientes?.find((row) => row?.nome?.includes('Gerência') || row?.id > 0);
  useEffect(() => {
    if (!estadoFilter && firstAmbiente) {
      dispatch(setEstadoFilter({ id: firstAmbiente?.id, label: firstAmbiente?.nome }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, firstAmbiente, estadoFilter]);

  const VIEW_TABS = [
    { value: 'criacao', label: 'Criação', component: <Criacao vista={vista} /> },
    { value: 'entradas', label: 'Entradas', component: <EntradasTrabalhados /> },
    { value: 'trabalhados', label: 'Trabalhados', component: <EntradasTrabalhados /> },
    { value: 'devolucoesInternas', label: 'Devoluções internas', component: <DevolvidosTipos /> },
    { value: 'devolucoesExternas', label: 'Devoluções externas', component: <DevolvidosTipos /> },
    { value: 'volume', label: 'Volume', component: <Volume agrupamento={agrupamento} topLabel={top} /> },
    { value: 'tipos', label: 'Fluxos/Assuntos', component: <DevolvidosTipos /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    dispatch(resetItem('indicadores'));
    setCurrentTab(newValue);
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={`Total de processos - ${VIEW_TABS?.find((row) => row?.value === currentTab)?.label}`}
        links={[{ name: '' }]}
        action={
          <Filtrar
            top={top}
            vista={vista}
            perfil={perfil}
            setTop={setTop}
            tab={currentTab}
            setVista={setVista}
            setPerfil={setPerfil}
            agrupamento={agrupamento}
            setAgrupamento={setAgrupamento}
          />
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ mb: 3, height: 50, position: 'relative' }}>
        <TabsWrapperStyle>
          <Tabs
            value={currentTab}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={handleChangeTab}
          >
            {VIEW_TABS.map((tab) => (
              <Tab disableRipple key={tab.value} value={tab.value} label={tab.label} sx={{ px: 0.5 }} />
            ))}
          </Tabs>
        </TabsWrapperStyle>
      </Card>
      {VIEW_TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Criacao.propTypes = { vista: PropTypes.string };

export function Criacao({ vista }) {
  const [currentTab, setCurrentTab] = useState('grafico');
  const { isLoading, indicadores } = useSelector((state) => state.digitaldocs);
  const isNotFound = !indicadores.length;
  const total = sumBy(indicadores, 'total');
  const series = [{ name: 'Nº de processos', data: indicadores?.map((row) => row?.total) }];
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    xaxis: {
      categories: indicadores?.map((row) =>
        vista === 'anual' ? fYear(row?.criado_em) : vista === 'mensal' && fMShortYear(row?.criado_em)
      ),
    },
    yaxis: { labels: { formatter: (value) => fNumber(value) }, title: { text: 'Nº de processos' } },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  const resumo = [
    { label: 'Total', valor: total, desc: '' },
    { label: 'Média', valor: total / indicadores?.length, desc: vista.charAt(0).toUpperCase() + vista.slice(1) },
    {
      label: 'Mais processos',
      valor: Math.max(...indicadores?.map((row) => row.total)),
      desc: indicadores?.find((row) => row.total === Math.max(...indicadores?.map((row) => row.total)))?.criado_em,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...indicadores?.map((row) => row.total)),
      desc: indicadores?.find((row) => row.total === Math.min(...indicadores?.map((row) => row.total)))?.criado_em,
    },
  ];

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <CardContent>
        {isLoading ? (
          <Stack direction="row" justifyContent="center">
            <BarChart />
          </Stack>
        ) : (
          <>
            {isNotFound ? (
              <SearchNotFound message="Nenhum registo encontrado..." />
            ) : (
              <>
                <Grid container spacing={3}>
                  {resumo?.map((row) => (
                    <Grid key={row?.label} item xs={12} sm={6} md={3}>
                      <CardInfo
                        title={row?.label}
                        total={row?.valor}
                        label={
                          (row?.label !== 'Total' && row?.label !== 'Média' && vista === 'anual' && fYear(row?.desc)) ||
                          (row?.label !== 'Total' &&
                            row?.label !== 'Média' &&
                            vista === 'mensal' &&
                            fMonthYear(row?.desc)) ||
                          row?.desc
                        }
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    {currentTab === 'grafico' ? (
                      <Chart type="area" series={series} options={chartOptions} height={400} />
                    ) : (
                      <TableExport label="Data" label1="Quantidade" dados={indicadores} vista={vista} total={total} />
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function EntradasTrabalhados() {
  const [colaborador1, setColaborador1] = useState(null);
  const [colaborador2, setColaborador2] = useState(null);
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, isAdmin, meusAmbientes, indicadores } = useSelector((state) => state.digitaldocs);

  const colaboradoresAcesso = ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes)?.map((row) => row?.id);
  const dadosByColaborador = indicadoresGroupBy(
    indicadores?.filter((row) => colaboradoresAcesso?.includes(row?.perfil_id)),
    'perfil_id'
  );
  const dadosByAssunto = indicadoresGroupBy(indicadores, 'assunto');
  const isNotFound = !dadosByColaborador.length;
  const total = sumBy(indicadores, 'total');
  const colaboradoresList = [];
  dadosByColaborador?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.item);
    if (colaborador) {
      colaboradoresList.push({
        id: colaborador?.perfil_id,
        foto: colaborador?.foto_disk,
        label: colaborador?.perfil?.displayName,
      });
    }
  });

  const handleClose = () => {
    onClose1();
    setColaborador1(null);
    setColaborador2(null);
  };

  return (
    <>
      {isLoading ? (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="center">
              <BarChart />
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          {isNotFound ? (
            <Card>
              <CardContent>
                <SearchNotFound message="Nenhum registo encontrado..." />
              </CardContent>
            </Card>
          ) : (
            <>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={6} lg={4}>
                  <Card sx={{ height: 1 }}>
                    <CardHeader
                      title={
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                            Total:
                          </Typography>
                          <Typography variant="h5">{fNumber(total)}</Typography>
                        </Stack>
                      }
                      action={
                        dadosByColaborador.length > 1 && (
                          <>
                            <Button size="small" variant="soft" startIcon={<SwapHorizOutlinedIcon />} onClick={onOpen1}>
                              Comparação
                            </Button>
                            <Dialog open={open1} onClose={handleClose} fullWidth maxWidth="sm">
                              <DialogTitle sx={{ pr: 1 }}>
                                <Stack direction="row" spacing={3} justifyContent="space-between">
                                  <Typography variant="h6">Comparação colaboradores</Typography>
                                  <Stack sx={{ pr: 1 }}>
                                    <Tooltip title="Fechar">
                                      <IconButton color="inherit" onClick={handleClose}>
                                        <CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>
                              </DialogTitle>
                              <DialogContent>
                                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                      fullWidth
                                      size="small"
                                      disableClearable
                                      value={colaborador1}
                                      onChange={(event, newValue) => setColaborador1(newValue)}
                                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                      options={colaboradoresList?.filter((row) => row?.id !== colaborador2?.id)}
                                      renderInput={(params) => <TextField {...params} label="Colaborador 1" />}
                                    />
                                    {colaborador1 && (
                                      <Stack direction="row" justifyContent="center" sx={{ pt: 2 }}>
                                        <Avatar
                                          alt={colaborador1?.label}
                                          src={`${BASEURL}/colaborador/file/colaborador/${colaborador1?.foto}`}
                                          sx={{ width: 64, height: 64, boxShadow: (theme) => theme.customShadows.z8 }}
                                        />
                                      </Stack>
                                    )}
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                      fullWidth
                                      size="small"
                                      disableClearable
                                      value={colaborador2}
                                      onChange={(event, newValue) => setColaborador2(newValue)}
                                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                      options={colaboradoresList?.filter((row) => row?.id !== colaborador1?.id)}
                                      renderInput={(params) => <TextField {...params} label="Colaborador 2" />}
                                    />
                                    {colaborador2 && (
                                      <Stack direction="row" justifyContent="center" sx={{ pt: 2 }}>
                                        <Avatar
                                          alt={colaborador2?.label}
                                          src={`${BASEURL}/colaborador/file/colaborador/${colaborador2?.foto}`}
                                          sx={{ width: 64, height: 64, boxShadow: (theme) => theme.customShadows.z8 }}
                                        />
                                      </Stack>
                                    )}
                                  </Grid>
                                  {colaborador1 && colaborador2 && (
                                    <>
                                      <LineProgress
                                        isTotal
                                        item="Total"
                                        trabalhadoC1={sumBy(
                                          dadosByColaborador?.find((row) => row?.item === colaborador1?.id)?.processos,
                                          'total'
                                        )}
                                        trabalhadoC2={sumBy(
                                          dadosByColaborador?.find((row) => row?.item === colaborador2?.id)?.processos,
                                          'total'
                                        )}
                                      />
                                      {dadosByAssunto?.map((row) => {
                                        const trabalhadoC1 =
                                          dadosByColaborador
                                            ?.find((colaborador) => colaborador?.item === colaborador1?.id)
                                            ?.processos?.find((assunto) => assunto?.assunto === row?.item)?.total || 0;
                                        const trabalhadoC2 =
                                          dadosByColaborador
                                            ?.find((colaborador) => colaborador?.item === colaborador2?.id)
                                            ?.processos?.find((assunto) => assunto?.assunto === row?.item)?.total || 0;
                                        return (
                                          <>
                                            {(trabalhadoC1 > 0 || trabalhadoC2 > 0) && (
                                              <LineProgress
                                                item={row?.item}
                                                trabalhadoC1={trabalhadoC1}
                                                trabalhadoC2={trabalhadoC2}
                                              />
                                            )}
                                          </>
                                        );
                                      })}
                                    </>
                                  )}
                                </Grid>
                              </DialogContent>
                            </Dialog>
                          </>
                        )
                      }
                    />
                    <CardContent>
                      {dadosByAssunto?.map((row) => {
                        const subtotal = sumBy(row?.processos, 'total');
                        const percentagem = (subtotal * 100) / total;
                        return (
                          <Stack key={`${row.item}_entrab`} spacing={0.5} sx={{ width: 1, mb: 2 }}>
                            <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                                {row?.item}
                              </Typography>
                              <Typography variant="subtitle1">&nbsp;{fNumber(subtotal)}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                ({fPercent(percentagem)})
                              </Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={percentagem} color="success" />
                          </Stack>
                        );
                      })}
                    </CardContent>
                  </Card>
                </Grid>
                {dadosByColaborador?.map((row) => (
                  <ColaboradorCard key={row.item} colaboradorDados={row} total={total} assuntos={dadosByAssunto} />
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function DevolvidosTipos() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('grafico');
  const { isLoading, indicadores } = useSelector((state) => state.digitaldocs);
  const isNotFound = !indicadores.length;
  const total = sumBy(indicadores, 'total');
  const labels = indicadores?.map((row) => row?.assunto);
  const quantidades = indicadores?.map((row) => row?.total);
  const percentagem = indicadores?.map((row) => (row?.total * 100) / total);

  const resumo = [
    { label: 'Total', valor: sumBy(indicadores, 'total'), desc: '' },
    {
      label: 'Mais processos',
      valor: Math.max(...indicadores?.map((row) => row.total)),
      desc: indicadores?.find((row) => row.total === Math.max(...indicadores?.map((row) => row.total)))?.assunto,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...indicadores?.map((row) => row.total)),
      desc: indicadores?.find((row) => row.total === Math.min(...indicadores?.map((row) => row.total)))?.assunto,
    },
  ];

  const series = [
    { name: 'Quantidade', type: 'bar', data: quantidades },
    { name: 'Percentagem', type: 'line', data: percentagem },
  ];

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    xaxis: { categories: labels, labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <CardContent>
        {isLoading ? (
          <Stack direction="row" justifyContent="center">
            <BarChart />
          </Stack>
        ) : (
          <>
            {isNotFound ? (
              <SearchNotFound message="Nenhum registo encontrado..." />
            ) : (
              <>
                <Grid container spacing={3}>
                  {resumo?.map((row) => (
                    <Grid key={row?.label} item xs={12} sm={4}>
                      <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    {currentTab === 'grafico' ? (
                      <Chart type="line" series={series} options={chartOptions} height={500} />
                    ) : (
                      <TableExport percentagem total={total} label="Processo" label1="Quantidade" dados={indicadores} />
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Execucao() {
  const [fluxo, setFluxo] = useState(null);
  const { cc } = useSelector((state) => state.intranet);
  const { isLoading, indicadores, estadoFilter } = useSelector((state) => state.digitaldocs);
  const [perfil, setPerfil] = useState(cc?.perfil ? { id: cc?.perfil?.id, label: cc?.perfil?.displayName } : null);
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
  } = useTable({ defaultOrderBy: 'assunto', defaultRowsPerPage: indicadores.length });
  const dataFiltered = applySortFilter({ indicadores, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Tempo de execução"
        links={[{ name: '' }]}
        action={<Filtrar tab="execucao" fluxo={fluxo} perfil={perfil} setFluxo={setFluxo} setPerfil={setPerfil} />}
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
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
                {estadoFilter?.label && (
                  <>
                    no estado{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {estadoFilter?.label}
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
                    {estadoFilter?.label && (
                      <>
                        no estado{' '}
                        <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                          {estadoFilter?.label}
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
                    sendo executado no estado{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {estadoFilter?.label}
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
                  <TableSearchNotFound message="Não foi encontrado nenhum dado disponível..." />
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
  const [fluxo, setFluxo] = useState(null);
  const [currentTab, setCurrentTab] = useState('grafico');
  const { cc, uos } = useSelector((state) => state.intranet);
  const { isLoading, indicadores } = useSelector((state) => state.digitaldocs);
  const [perfil, setPerfil] = useState(cc?.perfil ? { id: cc?.perfil?.id, label: cc?.perfil?.displayName } : null);
  const duracaoByItem = [];
  indicadores?.forEach((row) => {
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
    yaxis: { title: { text: 'Dias' }, labels: { formatter: (value) => fNumber(value) } },
    tooltip: { y: { formatter: (value) => fNumber2(value) } },
  });

  return (
    <>
      <HeaderBreadcrumbs
        heading="Média de duração dos processos"
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        action={<Filtrar tab="duracao" fluxo={fluxo} perfil={perfil} setFluxo={setFluxo} setPerfil={setPerfil} />}
      />

      <Card sx={{ p: 1 }}>
        {duracaoByItem.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
        <CardContent>
          {isLoading ? (
            <Stack direction="row" justifyContent="center">
              <BarChart />
            </Stack>
          ) : (
            <>
              {isNotFound ? (
                <SearchNotFound message="Nenhum registo encontrado..." />
              ) : (
                <>
                  <Grid container spacing={3}>
                    {resumo?.map((row) => (
                      <Grid key={row?.label} item xs={12} sm={4}>
                        <CardInfo title={row?.label} total={row?.valor} label={row?.desc} duracao />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      {currentTab === 'grafico' ? (
                        <Chart type="bar" series={seriesVolume} options={chartOptions} height={500} />
                      ) : (
                        <TableExport label="Estado/Ambiente" label1="Média em dias" dados={duracaoByItem} />
                      )}
                    </Grid>
                  </Grid>
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

Volume.propTypes = { agrupamento: PropTypes.string, topLabel: PropTypes.string };

export function Volume({ agrupamento, topLabel }) {
  const theme = useTheme();
  const top = (topLabel === 'Top 5' && 5) || (topLabel === 'Top 10' && 10) || (topLabel === 'Top 20' && 20) || 'Todos';
  const [currentTab, setCurrentTab] = useState('grafico');
  const { isLoading, indicadores } = useSelector((state) => state.digitaldocs);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  const volumeByItem = [];
  indicadores?.forEach((row, index) => {
    if (agrupamento === 'Unidade orgânica') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (top === 'Todos') {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (agrupamento === 'Colaborador') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (top !== 'Todos' && index < top) {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (top === 'Todos') {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });
  const isNotFound = !volumeByItem.length;
  const total = sumBy(volumeByItem, 'total');
  const labels = volumeByItem?.map((row) => row?.label);
  const quantidades = volumeByItem?.map((row) => row?.total);
  const percentagem = volumeByItem?.map((row) => (row?.total * 100) / total);
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

  const series = [
    { name: 'Nº de processos', type: 'bar', data: quantidades },
    { name: 'Percentagem', type: 'line', data: percentagem },
  ];

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    xaxis: { categories: labels, labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <CardContent>
        {isLoading ? (
          <Stack direction="row" justifyContent="center">
            <BarChart />
          </Stack>
        ) : (
          <>
            {isNotFound ? (
              <SearchNotFound message="Nenhum registo encontrado..." />
            ) : (
              <>
                <Grid container spacing={3}>
                  {resumo?.map((row) => (
                    <Grid key={row?.label} item xs={12} sm={6} md={3}>
                      <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    {currentTab === 'grafico' ? (
                      <Chart type="line" series={series} options={chartOptions} height={500} />
                    ) : (
                      <TableExport
                        percentagem
                        total={total}
                        label={agrupamento}
                        label1="Quantidade"
                        dados={volumeByItem}
                      />
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Filtrar.propTypes = {
  tab: PropTypes.string,
  top: PropTypes.string,
  fluxo: PropTypes.object,
  vista: PropTypes.string,
  perfil: PropTypes.object,
  agrupamento: PropTypes.string,
  setTop: PropTypes.func,
  setFluxo: PropTypes.func,
  setVista: PropTypes.func,
  setPerfil: PropTypes.func,
  setAgrupamento: PropTypes.func,
};

export function Filtrar({
  tab,
  top,
  fluxo,
  vista,
  perfil,
  setTop,
  setVista,
  setFluxo,
  setPerfil,
  agrupamento,
  setAgrupamento,
}) {
  const dispatch = useDispatch();
  const [datai, setDatai] = useState(null);
  const [dataf, setDataf] = useState(null);
  const { toggle: open, onOpen, onClose } = useToggle();
  const [momento, setMomento] = useState('Criação no sistema');
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const { fluxos, isAdmin, meusAmbientes, estadoFilter, estados } = useSelector((state) => state.digitaldocs);
  const [uo, setUo] = useState(cc?.uo ? { id: cc?.uo?.id, label: cc?.uo?.label } : null);
  const uosList = UosAcesso(uos, cc, isAdmin, meusAmbientes);
  const estadosList = EstadosAcesso(uos, cc, isAdmin, estados, meusAmbientes);
  const colaboradoresList =
    uo?.id && tab !== 'execucao'
      ? ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes)?.filter((row) => row?.uoId === uo?.id)
      : ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes);
  const perfilId = cc?.perfil_id;
  const firstAmbiente = meusAmbientes?.find((row) => row?.nome?.includes('Gerência') || row?.id > 0);
  useEffect(() => {
    if (cc) {
      setUo({ id: cc?.uo?.id, label: cc?.uo?.label });
      setPerfil({ id: cc?.perfil?.id, label: cc?.perfil?.displayName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cc]);

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(
        getIndicadores(tab, {
          mail,
          vista,
          perfilId,
          uo: uo?.id,
          fluxo: fluxo?.id,
          perfil: perfil?.id,
          estado: estadoFilter?.id,
          momento: momento === 'Criação no sistema' ? 'c' : 'e',
          agrupamento: agrupamento === 'Colaborador' ? 'perfil' : 'uo',
          datai: datai ? format(add(new Date(datai), { hours: 2 }), 'yyyy-MM-dd') : null,
          dataf: dataf ? format(add(new Date(dataf), { hours: 2 }), 'yyyy-MM-dd') : null,
        })
      );
    }
  }, [
    dispatch,
    tab,
    mail,
    vista,
    datai,
    dataf,
    momento,
    perfilId,
    estadoFilter,
    uo?.id,
    fluxo?.id,
    perfil?.id,
    agrupamento,
  ]);

  const onResetFilter = () => {
    if (datai && setDatai) setDatai(null);
    if (dataf && setDataf) setDataf(null);
    if (fluxo && setFluxo) setFluxo(null);
    if (top !== 'Todos' && setTop) setTop('Todos');
    if (vista !== 'mensal' && setVista) setVista('mensal');
    if (momento !== 'Criação no sistema' && setMomento) setMomento('Criação no sistema');
    if (agrupamento !== 'Unidade orgânica' && setAgrupamento) setAgrupamento('Unidade orgânica');
    if (uo?.id !== cc?.uo?.id && setUo) setUo({ id: cc?.uo?.id, label: cc?.uo?.label });
    if (perfil?.id !== cc?.perfil?.id && setPerfil) setPerfil({ id: cc?.perfil?.id, label: cc?.perfil?.displayName });
    if (
      firstAmbiente?.id &&
      estadoFilter?.id !== firstAmbiente?.id &&
      (tab === 'trabalhados' || tab === 'devolucoesInternas' || tab === 'devolucoesExternas')
    ) {
      dispatch(setEstadoFilter({ id: firstAmbiente?.id, label: firstAmbiente?.nome }));
    } else if (estadoFilter?.id) {
      dispatch(setEstadoFilter(null));
    }
  };

  const handleSetEstado = (newValue) => {
    dispatch(setEstadoFilter(newValue));
  };

  const haveColaborador = tab === 'criacao' || tab === 'tipos' || tab === 'duracao' || tab === 'execucao';
  const haveEstado =
    tab === 'trabalhados' || tab === 'devolucoesInternas' || tab === 'devolucoesExternas' || tab === 'execucao';
  const havePeriodo =
    tab === 'entradas' ||
    tab === 'trabalhados' ||
    tab === 'devolucoesInternas' ||
    tab === 'devolucoesExternas' ||
    tab === 'tipos' ||
    tab === 'duracao';

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
        {tab === 'duracao' && momento && (
          <Panel label="Momento">
            <Typography noWrap>{momento}</Typography>
          </Panel>
        )}
        {tab === 'volume' && (agrupamento || top !== 'Todos') && (
          <>
            {agrupamento && (
              <Panel label="Agrupamento">
                <Typography noWrap>{agrupamento}</Typography>
              </Panel>
            )}
            {top !== 'Todos' && (
              <Panel label="Top">
                <Typography noWrap>{top}</Typography>
              </Panel>
            )}
          </>
        )}
        {tab === 'criacao' && vista && (
          <Panel label="Vista">
            <Typography noWrap sx={{ textTransform: 'capitalize' }}>
              {vista}
            </Typography>
          </Panel>
        )}
        {(tab === 'criacao' || tab === 'entradas' || tab === 'tipos') && uo?.label && (
          <Panel label="Agência/U.O">
            <Typography noWrap>{uo?.label}</Typography>
          </Panel>
        )}
        {haveColaborador && perfil?.label && (
          <Panel label="Colaborador">
            <Typography noWrap>{perfil?.label}</Typography>
          </Panel>
        )}
        {haveEstado && estadoFilter?.label && (
          <Panel label="Estado/Ambiente">
            <Typography noWrap>{estadoFilter?.label}</Typography>
          </Panel>
        )}
        {(tab === 'duracao' || tab === 'execucao') && fluxo?.label && (
          <Panel label="Fluxo/Assunto">
            <Typography noWrap>{fluxo?.label}</Typography>
          </Panel>
        )}
        {havePeriodo && (datai || dataf) && (
          <Panel label={(datai && dataf && 'Período') || (datai && 'Desde') || (dataf && 'Até')}>
            <Typography noWrap>
              {(datai && dataf && `${ptDate(datai)}-${ptDate(dataf)}`) ||
                (datai && ptDate(datai)) ||
                (dataf && ptDate(dataf))}
            </Typography>
          </Panel>
        )}
        <Button variant="contained" endIcon={<FilterListOutlinedIcon />} onClick={onOpen}>
          Filtrar
        </Button>
      </Stack>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        BackdropProps={{ invisible: true }}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1, pl: 2 }}>
          <Typography variant="subtitle1">Filtrar</Typography>
          <IconButton onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 2 }}>
            {tab === 'duracao' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2"> Momento </Typography>
                <RadioGroup value={momento} onChange={(event, newValue) => setMomento(newValue)}>
                  {['Criação no sistema', 'Data de entrada'].map((row) => (
                    <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
                  ))}
                </RadioGroup>
              </Stack>
            )}
            {tab === 'volume' && (
              <>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2"> Agrupamento </Typography>
                  <RadioGroup value={agrupamento} onChange={(event, newValue) => setAgrupamento(newValue)}>
                    {['Unidade orgânica', 'Colaborador'].map((row) => (
                      <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
                    ))}
                  </RadioGroup>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2"> Top </Typography>
                  <RadioGroup value={top} onChange={(event, newValue) => setTop(newValue)}>
                    {['Todos', 'Top 5', 'Top 10', 'Top 20'].map((row) => (
                      <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
                    ))}
                  </RadioGroup>
                </Stack>
              </>
            )}
            {tab === 'criacao' && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle2"> Vista </Typography>
                <RadioGroup row value={vista} onChange={(event, newValue) => setVista(newValue)}>
                  {['mensal', 'anual'].map((row) => (
                    <FormControlLabel
                      key={row}
                      value={row}
                      label={row}
                      control={<Radio size="small" />}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </RadioGroup>
              </Stack>
            )}
            {(tab === 'criacao' || tab === 'entradas' || tab === 'tipos') && (
              <FilterAutocomplete
                value={uo}
                setValue={setUo}
                options={uosList}
                label="Unidade orgânica"
                disableClearable={tab === 'entradas'}
              />
            )}
            {haveColaborador && (
              <FilterAutocomplete
                value={perfil}
                label="Colaborador"
                setValue={setPerfil}
                disableClearable={tab === 'execucao' && !estadoFilter && !fluxo}
                options={applySort(colaboradoresList, getComparator('asc', 'label'))}
              />
            )}
            {haveEstado && (
              <FilterAutocomplete
                value={estadoFilter}
                label="Estado/Ambiente"
                setValue={handleSetEstado}
                options={estadosList}
                disableClearable={haveEstado && !perfil && !fluxo}
              />
            )}
            {(tab === 'duracao' || tab === 'execucao') && (
              <FilterAutocomplete
                value={fluxo}
                label="Fluxo/Assunto"
                setValue={setFluxo}
                disableClearable={tab === 'execucao' && !perfil && !estadoFilter}
                options={applySort(
                  fluxos?.map((row) => ({ id: row?.id, label: row?.assunto })),
                  getComparator('asc', 'label')
                )}
              />
            )}
            {havePeriodo && (
              <Stack spacing={1}>
                <Typography variant="subtitle2"> Período </Typography>
                <DatePicker
                  value={datai}
                  label="Data inicial"
                  onChange={(newValue) => {
                    if (newValue && newValue?.toString() !== 'Invalid Date') {
                      setDatai(newValue);
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  value={dataf}
                  label="Data final"
                  onChange={(newValue) => {
                    if (newValue && newValue?.toString() !== 'Invalid Date') {
                      setDataf(newValue);
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Stack>
            )}
          </Stack>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <Button
            fullWidth
            type="submit"
            color="inherit"
            variant="outlined"
            onClick={onResetFilter}
            startIcon={<ClearAllOutlinedIcon />}
          >
            Limpar
          </Button>
        </Box>
      </Drawer>
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
        p: 1,
        height: 1,
        textAlign: 'center',
        pt: { xs: 2, md: label ? 2 : 4 },
        '&:hover': { bgcolor: 'background.neutral' },
        border: (theme) => theme.palette.mode === 'dark' && `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="h5" sx={{ color: 'text.success', py: 0.5 }} noWrap>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ color: 'text.secondary' }}>
        {duracao ? `${total?.toFixed(2)} ${total > 1 ? 'dias' : 'dia'}` : fNumber(total)}
      </Typography>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ColaboradorCard.propTypes = { colaboradorDados: PropTypes.object, assuntos: PropTypes.array, total: PropTypes.number };

function ColaboradorCard({ colaboradorDados, total, assuntos }) {
  const totalColaborador = sumBy(colaboradorDados?.processos, 'total');
  const { colaboradores } = useSelector((state) => state.intranet);
  const colaborador = colaboradores?.find((row) => row.perfil_id === colaboradorDados.item);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card
        sx={{
          p: 3,
          pb: 2,
          height: 1,
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2, mb: 2, width: 1, borderRadius: 1, backgroundColor: 'background.neutral' }}
        >
          <Avatar
            alt={colaborador?.perfil?.displayName}
            src={`${BASEURL}/colaborador/file/colaborador/${colaborador?.foto_disk}`}
            sx={{ width: 64, height: 64, boxShadow: (theme) => theme.customShadows.z8 }}
          />
          <Stack>
            <Typography variant="subtitle1" noWrap>
              {colaborador?.perfil?.displayName}
            </Typography>
            <Stack spacing={1} direction="row" alignItems="center" sx={{ color: 'text.success' }}>
              <Typography variant="h5">{fNumber(totalColaborador)}</Typography>
              <Typography sx={{ opacity: 0.75 }}>({fPercent((totalColaborador * 100) / total)})</Typography>
            </Stack>
          </Stack>
        </Stack>

        {colaboradorDados?.processos?.map((row) => {
          const percentagem = (row?.total * 100) / totalColaborador;
          const totalAssunto = assuntos?.find((assunto) => assunto?.item === row?.assunto);
          return (
            <Stack key={row.assunto} spacing={0.5} sx={{ width: 1, mb: 2 }}>
              <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                  {row?.assunto}
                </Typography>
                <Typography variant="subtitle1">&nbsp;{fNumber(row?.total)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.success', opacity: 0.75 }}>
                  ({fPercent(percentagem)})
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ({fPercent((row?.total * 100) / sumBy(totalAssunto?.processos, 'total'))})
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={percentagem} color="success" />
            </Stack>
          );
        })}
      </Card>
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterAutocomplete.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterAutocomplete({ label, value, options, setValue, ...other }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2"> {label} </Typography>
      <Autocomplete
        fullWidth
        value={value}
        options={options}
        getOptionLabel={(option) => option?.label}
        onChange={(event, newValue) => setValue(newValue)}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        renderInput={(params) => <TextField {...params} placeholder="Selecionar..." />}
        {...other}
      />
    </Stack>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function ButtonExport() {
  return (
    <ReactHTMLTableToExcel
      id="table-xls-button-tipo"
      className="MuiButtonBase-root-MuiButton-root"
      table="table-to-xls-tipo"
      filename="Indicadore"
      sheet="Indicadore"
      buttonText={
        <Button
          size="small"
          variant="soft"
          color="inherit"
          startIcon={<Image src="/assets/icons/file_format/format_excel.svg" sx={{ height: 20 }} />}
        >
          Exportar
        </Button>
      }
    />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableExport.propTypes = {
  dados: PropTypes.array,
  total: PropTypes.number,
  label: PropTypes.string,
  vista: PropTypes.string,
  label1: PropTypes.string,
  percentagem: PropTypes.bool,
};

function TableExport({ label, label1, dados, total = 0, percentagem = false, vista = '' }) {
  return (
    <Table id="table-to-xls-tipo">
      <TableHead>
        <TableRow>
          <TableCell>{label}</TableCell>
          <TableCell align="right">{label1}</TableCell>
          {percentagem && <TableCell align="right">Percentagem</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {dados?.map((row, index) => (
          <TableRow key={`table_row_export_${index}`} hover>
            <TableCell>
              {row?.criado_em ? (
                <>{vista === 'anual' ? fYear(row?.criado_em) : vista === 'mensal' && fMonthYear(row?.criado_em)}</>
              ) : (
                row?.assunto || row?.label
              )}
            </TableCell>
            <TableCell align="right">
              {label1 === 'Média em dias' ? fNumber2(row?.total || row?.dias) : fNumber(row?.total || row?.dias)}
            </TableCell>
            {percentagem && <TableCell align="right">{fPercent((row?.total * 100) / total)}</TableCell>}
          </TableRow>
        ))}
        {label1 !== 'Média em dias' && (
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle1">Total</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1">{fNumber(total)}</Typography>
            </TableCell>
            {percentagem && <TableCell align="right"> </TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TabView.propTypes = { currentTab: PropTypes.string, setCurrentTab: PropTypes.func };

function TabView({ currentTab, setCurrentTab }) {
  return (
    <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
      {currentTab === 'tabela' && <ButtonExport />}
      <Tabs
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
        sx={{ width: 120, minHeight: '35px' }}
      >
        {[
          { value: 'grafico', label: 'Gráfico' },
          { value: 'tabela', label: 'Tabela' },
        ].map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} sx={{ mx: '5px !important', minHeight: '35px' }} />
        ))}
      </Tabs>
    </Stack>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

LineProgress.propTypes = {
  item: PropTypes.string,
  isTotal: PropTypes.bool,
  trabalhadoC1: PropTypes.number,
  trabalhadoC2: PropTypes.number,
};

function LineProgress({ item, trabalhadoC1, trabalhadoC2, isTotal }) {
  const theme = useTheme();
  const totalT = trabalhadoC1 > trabalhadoC2 ? trabalhadoC1 : trabalhadoC2;
  return (
    <>
      <Grid item xs={12} sx={{ mt: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant={isTotal ? 'h6' : 'subtitle1'}>{fNumber(trabalhadoC1)}</Typography>
          <Typography variant={isTotal ? 'body1' : 'body2'} noWrap sx={{ textAlign: 'center' }}>
            {item}
          </Typography>
          <Typography variant={isTotal ? 'h6' : 'subtitle1'}>{fNumber(trabalhadoC2)}</Typography>
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pt: '6px !important' }}>
        <Stack direction="column" alignItems="flex-end">
          <Box sx={{ width: `${(trabalhadoC1 * 100) / totalT}%`, border: `2px solid ${theme.palette.success.main}` }}>
            {' '}
          </Box>
          <Box sx={{ width: '100%', border: `1px solid ${theme.palette.success.main}` }}> </Box>
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pt: '6px !important' }}>
        <Stack direction="column" alignItems="flex-start">
          <Box sx={{ width: `${(trabalhadoC2 * 100) / totalT}%`, border: `2px solid ${theme.palette.focus.main}` }}>
            {' '}
          </Box>
          <Box sx={{ width: '100%', border: `1px solid ${theme.palette.focus.main}` }}> </Box>
        </Stack>
      </Grid>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function applySortFilter({ indicadores, comparator }) {
  const stabilizedThis = indicadores.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  indicadores = stabilizedThis.map((el) => el[0]);

  return indicadores;
}

// ----------------------------------------------------------------------

function indicadoresGroupBy(dados, item) {
  const dadosGrouped = [];
  dados = applySort(dados, getComparator('asc', 'assunto'));
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { item: value[item], processos: [] };
      dadosGrouped.push(res[value[item]]);
    }
    res[value[item]].processos.push({ assunto: value?.assunto, total: value?.total });
    return res;
  }, {});

  return dadosGrouped;
}
