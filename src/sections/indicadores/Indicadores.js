import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
// utils
import { format, add } from 'date-fns';
import { getFile } from '../../utils/getFile';
import useToggle, { useToggle1 } from '../../hooks/useToggle';
import { fMShortYear, fYear, fMonthYear, ptDate } from '../../utils/formatTime';
import { dataValido, setDataUtil, setItemValue } from '../../utils/normalizeText';
import { UosAcesso, EstadosAcesso, ColaboradoresAcesso } from '../../utils/validarAcesso';
import { fNumber, fPercent, fNumber2, fData, converterSegundos } from '../../utils/formatNumber';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/indicadores';
// components
import Panel from '../../components/Panel';
import MyAvatar from '../../components/MyAvatar';
import Scrollbar from '../../components/Scrollbar';
import Chart, { useChart } from '../../components/chart';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import { BarChart, SkeletonTable } from '../../components/skeleton';
import { Fechar, ExportExcel, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, SearchNotFound, TablePaginationAlt } from '../../components/table';

// --------------------------------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'assunto', label: 'Fluxo/Assunto', align: 'left' },
  { id: 'nome', label: 'Ambiente', align: 'left' },
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
  const { fileSystem, isLoading } = useSelector((state) => state.indicadores);
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
    <Card>
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3} alignItems="center">
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
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={0.5}>
                            <Typography variant="h6"> {fData(folder.tamanho)} </Typography>
                            {folder.tipo !== 'Total' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
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
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function TotalProcessos() {
  const [top, setTop] = useState(localStorage.getItem('top') || 'Todos');
  const [vista, setVista] = useState(localStorage.getItem('vista') || 'mensal');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabTotal') || 'data');

  const tabsList = [
    { value: 'data', label: 'Data', component: <Criacao vista={vista} /> },
    { value: 'entradas', label: 'Entradas', component: <DevolvidosTipos /> },
    { value: 'criacao', label: 'Criação', component: <EntradasTrabalhados /> },
    { value: 'trabalhados', label: 'Trabalhados', component: <EntradasTrabalhados /> },
    { value: 'devolucoes', label: 'Devoluções', component: <DevolvidosTipos /> },
    { value: 'volume', label: 'Volume', component: <Volume top={top} /> },
    { value: 'tipos', label: 'Fluxos/Assuntos', component: <DevolvidosTipos /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tabTotal');
  };

  return (
    <>
      <Cabecalho
        top={top}
        vista={vista}
        setTop={setTop}
        tab={currentTab}
        setVista={setVista}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={handleChangeTab}
        title={`Total de processos - ${tabsList?.find((row) => row?.value === currentTab)?.label}`}
      />

      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Criacao.propTypes = { vista: PropTypes.string };

export function Criacao({ vista }) {
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const isNotFound = !indicadores?.filter((row) => row?.criado_em).length;
  const total = sumBy(indicadores, 'total');
  const series = useMemo(
    () => [{ name: 'Nº de processos', data: indicadores?.map((row) => row?.criado_em && row?.total) }],
    [indicadores]
  );
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    xaxis: {
      categories:
        vista === 'anual'
          ? indicadores?.map((row) => row?.criado_em && fYear(row?.criado_em))
          : indicadores?.map((row) => row?.criado_em && fMShortYear(row?.criado_em)),
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
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={6} md={3}>
                <CardInfo
                  title={row?.label}
                  total={row?.valor}
                  label={
                    (row?.desc &&
                      row?.label !== 'Total' &&
                      row?.label !== 'Média' &&
                      vista === 'anual' &&
                      fYear(row?.desc)?.toString()) ||
                    (row?.desc &&
                      row?.label !== 'Total' &&
                      row?.label !== 'Média' &&
                      vista === 'mensal' &&
                      fMonthYear(row?.desc)) ||
                    row?.desc?.toString()
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              {currentTab === 'Gráfico' ? (
                <Chart type="area" series={series} options={chartOptions} height={400} />
              ) : (
                <TableExport label="Data" label1="Quantidade" dados={indicadores} vista={vista} total={total} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function EntradasTrabalhados() {
  const [colaborador1, setColaborador1] = useState(null);
  const [colaborador2, setColaborador2] = useState(null);
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const { isAdmin, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const [detail, setDetail] = useState(localStorage.getItem('detail') === 'true');

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
  const totalC1 = sumBy(dadosByColaborador?.find((row) => row?.item === colaborador1?.id)?.processos, 'total');
  const totalC2 = sumBy(dadosByColaborador?.find((row) => row?.item === colaborador2?.id)?.processos, 'total');

  const handleClose = () => {
    onClose1();
    setColaborador1(null);
    setColaborador2(null);
  };

  return (
    <Card
      sx={{
        boxShadow: !isLoading && !isNotFound && 'none !important',
        backgroundColor: !isLoading && !isNotFound && 'transparent !important',
      }}
    >
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        nop={!isLoading && !isNotFound}
        children={
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ height: 1, p: 2, pt: 1 }}>
                <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                    Total:
                  </Typography>
                  <Typography variant="h4">{fNumber(total)}</Typography>
                </Stack>
                <Stack spacing={1} direction="row" alignItems="center" justifyContent="center">
                  <DefaultAction
                    small
                    button
                    label={detail ? 'Esconder detalhes' : 'Mostrar detalhes'}
                    handleClick={() => setItemValue(!detail, setDetail, 'detail', false)}
                  />
                  {dadosByColaborador.length > 1 && (
                    <>
                      <DefaultAction small button handleClick={onOpen1} label="Comparar colaboradores" />
                      <Dialog open={open1} onClose={handleClose} fullWidth maxWidth="sm">
                        <DialogTitle sx={{ pr: 1 }}>
                          <Stack direction="row" spacing={3} justifyContent="space-between" sx={{ pr: 1.5 }}>
                            <Typography variant="h6">Comparação colaboradores</Typography>
                            <Fechar handleClick={handleClose} />
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
                                  <MyAvatar
                                    alt={colaborador1?.label}
                                    src={getFile('colaborador', colaborador1?.foto)}
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
                                  <MyAvatar
                                    alt={colaborador2?.label}
                                    src={getFile('colaborador', colaborador2?.foto)}
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
                                  trabalhadoC1={totalC1}
                                  trabalhadoC2={totalC2}
                                  leftSuccess={totalC1 > totalC2}
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
                                          leftSuccess={trabalhadoC1 > trabalhadoC2}
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
                  )}
                </Stack>
                {detail && (
                  <>
                    {dadosByAssunto?.map((row) => {
                      const subtotal = sumBy(row?.processos, 'total');
                      const percentagem = (subtotal * 100) / total;
                      return (
                        <Stack key={`${row.item}_entrab`} spacing={0.5} sx={{ width: 1, my: 3 }}>
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
                  </>
                )}
              </Card>
            </Grid>
            {dadosByColaborador?.map((row) => (
              <ColaboradorCard
                total={total}
                key={row.item}
                detail={detail}
                colaboradorDados={row}
                assuntos={dadosByAssunto}
              />
            ))}
          </Grid>
        }
      />{' '}
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function DevolvidosTipos() {
  const theme = useTheme();
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const isNotFound = !indicadores?.filter((row) => row.total)?.length;
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

  const series = useMemo(
    () => [
      { name: 'Quantidade', type: 'bar', data: quantidades },
      { name: 'Percentagem', type: 'line', data: percentagem },
    ],
    [percentagem, quantidades]
  );

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    xaxis: { categories: labels, labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={4}>
                <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
              </Grid>
            ))}
            <Grid item xs={12}>
              {currentTab === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="line" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport percentagem total={total} label="Processo" label1="Quantidade" dados={indicadores} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Execucao() {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { fluxos, estados } = useSelector((state) => state.parametrizacao);
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const fluxo = localStorage.getItem('fluxoIndic')
    ? fluxos?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic')))
    : '';
  const estado = localStorage.getItem('estadoIndic')
    ? estados?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic')))
    : '';
  const colaborador = localStorage.getItem('colaboradorIndic')
    ? colaboradores?.find((row) => Number(row?.perfil?.id) === Number(localStorage.getItem('colaboradorIndic')))
    : '';
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
  } = useTable({ defaultOrderBy: 'assunto' });
  const dataFiltered = applySort(indicadores, getComparator(order, orderBy));
  const totalTempo = sumBy(dataFiltered, 'tempo_execucao') / dataFiltered.length;
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <Cabecalho title="Tempo de execução" tab="execucao" />
      <Card sx={{ p: 1 }}>
        {dataFiltered.length > 0 && (
          <Paper sx={{ p: 2, mb: dataFiltered.length > 1 ? 1 : 0, bgcolor: 'background.neutral', flexGrow: 1 }}>
            {colaborador ? (
              <Typography sx={{ textAlign: 'center' }}>
                Em média {colaborador?.sexo === 'Masculino' ? 'o ' : 'a '}
                <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                  {colaborador?.perfil?.displayName}
                </Typography>{' '}
                passa{' '}
                <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                  {converterSegundos(totalTempo)}
                </Typography>{' '}
                trabalhando em um processo{' '}
                {fluxo && (
                  <>
                    de{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {fluxo?.assunto}
                    </Typography>
                  </>
                )}{' '}
                {estado && (
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
                {fluxo ? (
                  <Typography sx={{ textAlign: 'center' }}>
                    Em média um processo de{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {fluxo?.assunto}
                    </Typography>{' '}
                    passa{' '}
                    <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                      {converterSegundos(
                        (sumBy(
                          dataFiltered?.filter(
                            (row) => !row?.nome?.includes('Atendimento') && !row?.nome?.includes('Gerência')
                          ),
                          'tempo_execucao'
                        ) || 0) +
                          ((sumBy(
                            dataFiltered?.filter((row) => row?.nome?.includes('Atendimento')),
                            'tempo_execucao'
                          ) / dataFiltered?.filter((row) => row?.nome?.includes('Atendimento'))?.length || 0) +
                            (sumBy(
                              dataFiltered?.filter((row) => row?.nome?.includes('Gerência')),
                              'tempo_execucao'
                            ) / dataFiltered?.filter((row) => row?.nome?.includes('Gerência'))?.length || 0))
                      )}
                    </Typography>{' '}
                    sendo executado{' '}
                    {estado && (
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
                      {converterSegundos(totalTempo)}
                    </Typography>{' '}
                    sendo executado{' '}
                    {estado && (
                      <>
                        no estado{' '}
                        <Typography variant="spam" sx={{ typography: 'h6', color: 'text.success' }}>
                          {estado?.nome}
                        </Typography>
                      </>
                    )}
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
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow hover key={`execucao_${index}`}>
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
  const { uos } = useSelector((state) => state.intranet);
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const duracaoByItem = useMemo(() => duracaoP(indicadores, uos), [indicadores, uos]);
  const isNotFound = !duracaoByItem?.filter((row) => row?.dias).length;

  const resumo = useMemo(
    () => [
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
    ],
    [duracaoByItem]
  );

  const series = useMemo(
    () => [{ name: 'Média em dias', data: duracaoByItem?.map((row) => row?.dias) }],
    [duracaoByItem]
  );

  const chartOptions = useChart({
    stroke: { show: false },
    plotOptions: { bar: { columnWidth: '25%' } },
    tooltip: { y: { formatter: (value) => fNumber2(value) } },
    xaxis: { categories: duracaoByItem?.map((row) => row?.label) },
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    yaxis: { title: { text: 'Dias' }, labels: { formatter: (value) => fNumber(value) } },
  });

  return (
    <>
      <Cabecalho tab="duracao" title="Média de duração dos processos" />
      <Card sx={{ p: 1 }}>
        {duracaoByItem.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
        <IndicadorItem
          isLoading={isLoading}
          isNotFound={isNotFound}
          children={
            <Grid container spacing={3}>
              {resumo?.map((row) => (
                <Grid key={row?.label} item xs={12} sm={4}>
                  <CardInfo title={row?.label} total={row?.valor} label={row?.desc} duracao />
                </Grid>
              ))}
              <Grid item xs={12}>
                {currentTab === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                  <Chart type="bar" series={series} options={chartOptions} height={500} />
                ) : (
                  <TableExport label="Ambiente" label1="Média em dias" dados={duracaoByItem} />
                )}
              </Grid>
            </Grid>
          }
        />
      </Card>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Volume.propTypes = { top: PropTypes.string };

export function Volume({ top }) {
  const theme = useTheme();
  const agrupamento = localStorage.getItem('agrupamento') || 'Unidade orgânica';
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const topNumb = (top === 'Top 5' && 5) || (top === 'Top 10' && 10) || (top === 'Top 20' && 20) || 'Todos';
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  const volumeByItem = [];
  indicadores?.forEach((row, index) => {
    if (agrupamento === 'Unidade orgânica') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        volumeByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (agrupamento === 'Colaborador') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        volumeByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });
  const isNotFound = !volumeByItem?.filter((row) => row?.total).length;
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

  const series = useMemo(
    () => [
      { name: 'Nº de processos', type: 'bar', data: quantidades },
      { name: 'Percentagem', type: 'line', data: percentagem },
    ],
    [percentagem, quantidades]
  );

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    xaxis: { categories: labels, labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={6} md={3}>
                <CardInfo title={row?.label} total={row?.valor} label={row?.desc} />
              </Grid>
            ))}
            <Grid item xs={12}>
              {currentTab === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="line" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport percentagem total={total} label={agrupamento} label1="Quantidade" dados={volumeByItem} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

IndicadorItem.propTypes = {
  nop: PropTypes.bool,
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  isNotFound: PropTypes.bool,
};

function IndicadorItem({ isLoading, isNotFound, children, nop }) {
  return (
    <CardContent sx={{ p: nop && 0 }}>
      {isLoading ? (
        <Stack direction="row" justifyContent="center">
          <BarChart />
        </Stack>
      ) : (
        <>{isNotFound ? <SearchNotFound message="Nenhum registo encontrado..." /> : children}</>
      )}
    </CardContent>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Cabecalho.propTypes = {
  tab: PropTypes.string,
  top: PropTypes.string,
  setTop: PropTypes.func,
  title: PropTypes.string,
  vista: PropTypes.string,
  setVista: PropTypes.func,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export function Cabecalho({ title, tab, top, vista, setTop, setVista, tabsList = [], currentTab = '', changeTab }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [origem, setOrigem] = useState(localStorage.getItem('origem') || 'Interna');
  const [momento, setMomento] = useState(localStorage.getItem('momento') || 'Criação no sistema');
  const [agrEntradas, setAgrEntradas] = useState(localStorage.getItem('agrEntradas') || 'Balcão');
  const [agrupamento, setAgrupamento] = useState(localStorage.getItem('agrupamento') || 'Unidade orgânica');
  const [datai, setDatai] = useState(
    localStorage.getItem('dataIIndic') ? add(new Date(localStorage.getItem('dataIIndic')), { hours: 2 }) : null
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFIndic') ? add(new Date(localStorage.getItem('dataFIndic')), { hours: 2 }) : null
  );
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const { isAdmin, meusAmbientes, fluxos, estados } = useSelector((state) => state.parametrizacao);
  const perfilId = useMemo(() => cc?.perfil_id, [cc?.perfil_id]);

  const fluxosList = useMemo(() => fluxos?.map((row) => ({ id: row?.id, label: row?.assunto })), [fluxos]);
  const [fluxo, setFluxo] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))) || null
  );

  const uosList = useMemo(() => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'id'), [cc, isAdmin, meusAmbientes, uos]);
  const [uo, setUo] = useState(
    uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
      uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );

  const balcoesList = useMemo(
    () => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'balcao'),
    [cc, isAdmin, meusAmbientes, uos]
  );
  const [balcao, setBalcao] = useState(
    balcoesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('balcaoIndic'))) ||
      balcoesList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );

  const estadosList = useMemo(
    () => EstadosAcesso(uos, cc, isAdmin, estados, meusAmbientes),
    [cc, estados, isAdmin, meusAmbientes, uos]
  );
  const [estado, setEstado] = useState(
    estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))) || null
  );

  const colaboradoresList = useMemo(
    () =>
      uo?.id && tab !== 'execucao'
        ? ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes)?.filter((row) => row?.uoId === uo?.id)
        : ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes),
    [cc, colaboradores, isAdmin, meusAmbientes, tab, uo?.id]
  );
  const [perfil, setPerfil] = useState(
    colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
      colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId)) ||
      null
  );

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoIndic') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id))
      );
      localStorage.setItem('uoIndic', localStorage.getItem('uoIndic') || cc?.uo?.id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uosList, cc?.uo?.id]);

  useEffect(() => {
    if (!perfil?.id && colaboradoresList && (localStorage.getItem('colaboradorIndic') || perfilId)) {
      setPerfil(
        colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
          colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId))
      );
      localStorage.setItem('colaboradorIndic', localStorage.getItem('colaboradorIndic') || perfilId || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList, perfilId]);

  useEffect(() => {
    if (!fluxo && fluxosList && localStorage.getItem('fluxoIndic')) {
      setFluxo(fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))));
    }
  }, [fluxosList, fluxo]);

  useEffect(() => {
    if (!estado && estadosList && localStorage.getItem('estadoIndic')) {
      setEstado(estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))));
    }
  }, [estadosList, estado]);

  useEffect(() => {
    if (mail && perfilId && tab) {
      dispatch(
        getIndicadores(tab, {
          mail,
          vista,
          origem,
          perfilId,
          uo: uo?.id,
          agrEntradas,
          balcao: balcao?.id,
          fluxo: fluxo?.id,
          perfil: perfil?.id,
          estado: estado?.id,
          momento: momento === 'Criação no sistema' ? 'c' : 'e',
          datai: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
          dataf: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          agrupamento: agrupamento === 'Colaborador' ? 'perfil' : 'uo',
        })
      );
    }
  }, [
    tab,
    mail,
    vista,
    datai,
    dataf,
    balcao,
    estado,
    uo?.id,
    origem,
    momento,
    dispatch,
    perfilId,
    fluxo?.id,
    perfil?.id,
    agrupamento,
    agrEntradas,
  ]);

  const haveColaborador = tab === 'data' || tab === 'tipos' || tab === 'duracao' || tab === 'execucao';
  const haveEstado =
    tab === 'execucao' ||
    tab === 'devolucoes' ||
    tab === 'trabalhados' ||
    (tab === 'entradas' && agrEntradas === 'Ambiente');
  const havePeriodo =
    tab === 'criacao' ||
    tab === 'entradas' ||
    tab === 'trabalhados' ||
    tab === 'devolucoes' ||
    tab === 'tipos' ||
    tab === 'duracao';

  return (
    <>
      <Box sx={{ mb: 2, color: 'text.secondary', px: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {title}
            </Typography>
          </Box>

          <Button variant="contained" endIcon={<FilterListOutlinedIcon />} onClick={onOpen}>
            Filtrar
          </Button>
        </Stack>
      </Box>

      {currentTab && (
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={changeTab} sx={{ mb: 2 }} />
      )}

      <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
          {tab === 'duracao' && momento && (
            <Panel label="Momento" children={<Typography noWrap>{momento}</Typography>} />
          )}
          {tab === 'volume' && (agrupamento || top !== 'Todos') && (
            <>
              {agrupamento && <Panel label="Agrupamento" children={<Typography noWrap>{agrupamento}</Typography>} />}
              {top !== 'Todos' && <Panel label="Top" children={<Typography noWrap>{top}</Typography>} />}
            </>
          )}
          {tab === 'entradas' && agrEntradas && (
            <Panel label="Agrupamento" children={<Typography noWrap>{agrEntradas}</Typography>} />
          )}
          {tab === 'data' && vista && (
            <Panel
              label="Vista"
              children={
                <Typography noWrap sx={{ textTransform: 'capitalize' }}>
                  {vista}
                </Typography>
              }
            />
          )}
          {(tab === 'data' || tab === 'criacao' || tab === 'tipos') && uo?.label && (
            <Panel label="Agência/U.O" children={<Typography noWrap>{uo?.label}</Typography>} />
          )}
          {tab === 'entradas' && balcao?.label && agrEntradas === 'Balcão' && (
            <Panel label="Balcão" children={<Typography noWrap>{balcao?.label}</Typography>} />
          )}
          {haveColaborador && perfil?.label && (
            <Panel label="Colaborador" children={<Typography noWrap>{perfil?.label}</Typography>} />
          )}
          {haveEstado && estado?.label && (
            <Panel label="Ambiente" children={<Typography noWrap>{estado?.label}</Typography>} />
          )}
          {tab === 'devolucoes' && origem && (
            <Panel label="Origem" children={<Typography noWrap>{origem}</Typography>} />
          )}
          {(tab === 'duracao' || tab === 'execucao') && fluxo?.label && (
            <Panel label="Fluxo/Assunto" children={<Typography noWrap>{fluxo?.label}</Typography>} />
          )}
          {havePeriodo && (datai || dataf) && (
            <Panel
              label={(datai && dataf && 'Período') || (datai && 'Desde') || (dataf && 'Até')}
              children={
                <Typography noWrap>
                  {(datai && dataf && `${ptDate(datai)}-${ptDate(dataf)}`) ||
                    (datai && ptDate(datai)) ||
                    (dataf && ptDate(dataf))}
                </Typography>
              }
            />
          )}
        </Stack>
      </Stack>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            Filtrar
            <Fechar handleClick={onClose} />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {tab === 'devolucoes' && (
              <FilterRG
                label="Origem"
                localS="origem"
                value={origem}
                setValue={setOrigem}
                options={['Interna', 'Externa']}
              />
            )}
            {tab === 'duracao' && (
              <FilterRG
                label="Momento"
                localS="momento"
                value={momento}
                setValue={setMomento}
                options={['Criação no sistema', 'Data de entrada']}
              />
            )}
            {tab === 'entradas' && (
              <FilterRG
                label="Agrupamento"
                localS="agrEntradas"
                value={agrEntradas}
                setValue={setAgrEntradas}
                options={['Balcão', 'Ambiente']}
              />
            )}
            {tab === 'volume' && (
              <>
                <FilterRG
                  label="Agrupamento"
                  localS="agrupamento"
                  value={agrupamento}
                  setValue={setAgrupamento}
                  options={['Unidade orgânica', 'Colaborador']}
                />
                <FilterRG
                  label="Top"
                  localS="top"
                  value={top}
                  setValue={setTop}
                  options={['Todos', 'Top 5', 'Top 10', 'Top 20']}
                />
              </>
            )}
            {tab === 'data' && (
              <FilterRG label="Vista" localS="vista" value={vista} setValue={setVista} options={['mensal', 'anual']} />
            )}
            {(tab === 'data' || tab === 'criacao' || tab === 'tipos') && (
              <FilterAutocomplete
                value={uo}
                setValue={setUo}
                options={uosList}
                label="Unidade orgânica"
                disableClearable={tab === 'criacao'}
              />
            )}
            {tab === 'entradas' && agrEntradas === 'Balcão' && (
              <FilterAutocomplete
                value={balcao}
                label="Balcão"
                disableClearable
                setValue={setBalcao}
                options={balcoesList}
              />
            )}
            {haveColaborador && (
              <FilterAutocomplete
                value={perfil}
                label="Colaborador"
                setValue={setPerfil}
                options={colaboradoresList}
                disableClearable={tab === 'execucao' && !estado && !fluxo}
              />
            )}
            {haveEstado && (
              <FilterAutocomplete
                value={estado}
                label="Ambiente"
                setValue={setEstado}
                options={estadosList}
                disableClearable={haveEstado && !perfil && !fluxo}
              />
            )}
            {(tab === 'duracao' || tab === 'execucao') && (
              <FilterAutocomplete
                value={fluxo}
                label="Fluxo/Assunto"
                setValue={setFluxo}
                disableClearable={tab === 'execucao' && !perfil && !estado}
                options={fluxosList}
              />
            )}
            {havePeriodo && (
              <Stack direction="row" spacing={1}>
                <DatePicker
                  disableFuture
                  value={datai}
                  label="Data inicial"
                  slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                  onChange={(newValue) => setDataUtil(newValue, setDatai, 'dataIIndic', setDataf, 'dataFIndic', dataf)}
                />
                <DatePicker
                  disableFuture
                  value={dataf}
                  minDate={datai}
                  disabled={!datai}
                  label="Data final"
                  slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                  onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFIndic', '', '', '')}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
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

ColaboradorCard.propTypes = {
  detail: PropTypes.bool,
  total: PropTypes.number,
  assuntos: PropTypes.array,
  colaboradorDados: PropTypes.object,
};

function ColaboradorCard({ colaboradorDados, total, assuntos, detail }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const totalColaborador = sumBy(colaboradorDados?.processos, 'total');
  const colaborador = colaboradores?.find((row) => row.perfil_id === colaboradorDados.item);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ height: 1, p: 2 }}>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" sx={{ py: 1 }}>
          <MyAvatar
            alt={colaborador?.perfil?.displayName}
            src={getFile('colaborador', colaborador?.foto_disk)}
            sx={{ width: 50, height: 50, boxShadow: (theme) => theme.customShadows.z8 }}
          />
          <Stack>
            <Typography variant="subtitle1" noWrap>
              {colaborador?.perfil?.displayName}
            </Typography>
            <Stack spacing={1} direction="row" alignItems="center" sx={{ color: 'text.success' }}>
              <Typography variant="h6">{fNumber(totalColaborador)}</Typography>
              <Typography sx={{ opacity: 0.75 }}>({fPercent((totalColaborador * 100) / total)})</Typography>
            </Stack>
          </Stack>
        </Stack>
        {detail && (
          <>
            {colaboradorDados?.processos?.map((row) => {
              const percentagem = (row?.total * 100) / totalColaborador;
              const totalAssunto = assuntos?.find((assunto) => assunto?.item === row?.assunto);
              return (
                <Stack key={row.assunto} spacing={0.5} sx={{ width: 1, my: 3 }}>
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
          </>
        )}
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
  const localS =
    (label === 'Ambiente' && 'estadoIndic') ||
    (label === 'Unidade orgânica' && 'uoIndic') ||
    (label === 'Fluxo/Assunto' && 'fluxoIndic') ||
    (label === 'Colaborador' && 'colaboradorIndic') ||
    '';
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={options}
      getOptionLabel={(option) => option?.label}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setValue, localS, true)}
      {...other}
    />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterRG.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  localS: PropTypes.string,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterRG({ label, localS, value, setValue, options = [] }) {
  return (
    <Stack>
      <Typography variant="subtitle2">{label}</Typography>
      <RadioGroup row value={value} onChange={(event, newValue) => setItemValue(newValue, setValue, localS)}>
        {options?.map((row) => (
          <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
        ))}
      </RadioGroup>
    </Stack>
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
      <Tabs
        value={currentTab}
        sx={{ width: 120, minHeight: '35px' }}
        onChange={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tabView')}
      >
        {['Gráfico', 'Tabela'].map((tab) => (
          <Tab key={tab} label={tab} value={tab} sx={{ mx: '5px !important', minHeight: '35px' }} />
        ))}
      </Tabs>
      {currentTab === 'Tabela' && <ExportExcel icon filename="Indicadores" table="table-to-xls-tipo" />}
    </Stack>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

LineProgress.propTypes = {
  item: PropTypes.string,
  isTotal: PropTypes.bool,
  leftSuccess: PropTypes.bool,
  trabalhadoC1: PropTypes.number,
  trabalhadoC2: PropTypes.number,
};

function LineProgress({ item, trabalhadoC1, trabalhadoC2, isTotal, leftSuccess }) {
  const theme = useTheme();
  const colorLeft = leftSuccess ? theme.palette.success.main : theme.palette.focus.main;
  const colorRight = leftSuccess ? theme.palette.focus.main : theme.palette.success.main;
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
          <Box sx={{ width: `${(trabalhadoC1 * 100) / totalT}%`, border: `2px solid ${colorLeft}` }}> </Box>
          <Box sx={{ width: '100%', border: `1px solid ${colorLeft}` }}> </Box>
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pt: '6px !important' }}>
        <Stack direction="column" alignItems="flex-start">
          <Box sx={{ width: `${(trabalhadoC2 * 100) / totalT}%`, border: `2px solid ${colorRight}` }}> </Box>
          <Box sx={{ width: '100%', border: `1px solid ${colorRight}` }}> </Box>
        </Stack>
      </Grid>
    </>
  );
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

function duracaoP(indicadores, uos) {
  const duracaoByItem = [];
  indicadores?.forEach((row) => {
    const uo = uos?.find((uo) => uo.id === row?.uo_origem_id);
    duracaoByItem.push({ dias: row?.dmedh / 24, label: uo?.label || row?.uo_origem_id });
  });

  return duracaoByItem;
}
