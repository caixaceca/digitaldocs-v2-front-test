import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { getFile } from '../../utils/getFile';
import { useToggle1 } from '../../hooks/useToggle';
import { fNumber, fPercent } from '../../utils/formatNumber';
import { fMShortYear, fYear, fMonthYear } from '../../utils/formatTime';
import { ColaboradoresAcesso } from '../../utils/validarAcesso';
import { setItemValue, isProduction } from '../../utils/normalizeText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import MyAvatar from '../../components/MyAvatar';
import Chart, { useChart } from '../../components/chart';
import { DTFechar, DefaultAction } from '../../components/Actions';
//
import { TabView, CardInfo, dadosResumo, TableExport, IndicadorItem, ColaboradorCard } from './Indicadores';

// ----------------------------------------------------------------------

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

Criacao.propTypes = { periodo: PropTypes.string, indicadores: PropTypes.array };

export function Criacao({ periodo, indicadores }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
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
        periodo === 'anual'
          ? indicadores?.map((row) => row?.criado_em && fYear(row?.criado_em))
          : indicadores?.map((row) => row?.criado_em && fMShortYear(row?.criado_em)),
    },
    yaxis: { labels: { formatter: (value) => fNumber(value) }, title: { text: 'Nº de processos' } },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  const resumo = useMemo(
    () => [{ label: 'Total', valor: total, desc: '' }, ...dadosResumo(indicadores, 'total', 'criado_em')],
    [indicadores, total]
  );

  return (
    <Card sx={{ p: 1 }}>
      {indicadores.length > 0 && <TabView vista={vista} setVista={setVista} />}
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
                  percentagem={row?.percentagem}
                  label={
                    (row?.desc && periodo === 'anual' && fYear(row?.desc)?.toString()) ||
                    (row?.desc && periodo === 'mensal' && fMonthYear(row?.desc)) ||
                    row?.desc
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              {vista === 'Gráfico' ? (
                <Chart type="area" series={series} options={chartOptions} height={400} />
              ) : (
                <TableExport label="Data" label1="Quantidade" dados={indicadores} periodo={periodo} total={total} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EntradasTrabalhados.propTypes = { indicadores: PropTypes.array };

export function EntradasTrabalhados({ indicadores }) {
  const [colaborador1, setColaborador1] = useState(null);
  const [colaborador2, setColaborador2] = useState(null);
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { isLoading } = useSelector((state) => state.indicadores);
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const { isAdmin, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const [detail, setDetail] = useState(localStorage.getItem('detail') === 'true');

  const colaboradoresAcesso = useMemo(
    () => ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes)?.map((row) => row?.id),
    [cc, colaboradores, isAdmin, meusAmbientes]
  );
  const dadosByColaborador = useMemo(
    () =>
      indicadoresGroupBy(
        indicadores?.filter((row) => colaboradoresAcesso?.includes(row?.perfil_id)),
        'perfil_id'
      ),
    [colaboradoresAcesso, indicadores]
  );
  const dadosByAssunto = useMemo(() => indicadoresGroupBy(indicadores, 'assunto'), [indicadores]);
  const total = useMemo(() => sumBy(indicadores, 'total'), [indicadores]);
  const isNotFound = !dadosByColaborador.length;
  const colaboradoresList = useMemo(
    () => colaboradoresFilter(colaboradores, dadosByColaborador),
    [colaboradores, dadosByColaborador]
  );
  const totalC1 = useMemo(
    () => sumBy(dadosByColaborador?.find((row) => row?.item === colaborador1?.id)?.processos, 'total'),
    [colaborador1?.id, dadosByColaborador]
  );
  const totalC2 = useMemo(
    () => sumBy(dadosByColaborador?.find((row) => row?.item === colaborador2?.id)?.processos, 'total'),
    [colaborador2?.id, dadosByColaborador]
  );

  const handleClose = () => {
    onClose1();
    setColaborador1(null);
    setColaborador2(null);
  };

  return (
    <>
      {isLoading || isNotFound ? (
        <Card>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />{' '}
        </Card>
      ) : (
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
                      <DTFechar title="Comparação colaboradores" handleClick={() => handleClose()} />
                      <DialogContent>
                        <Grid container spacing={1.5} sx={{ mt: 1 }}>
                          <ColaboradorComp
                            colaborador={colaborador1}
                            colaboradorComp={colaborador2}
                            setColaborador={setColaborador1}
                            colaboradoresList={colaboradoresList}
                          />
                          <ColaboradorComp
                            colaborador={colaborador2}
                            colaboradorComp={colaborador1}
                            setColaborador={setColaborador2}
                            colaboradoresList={colaboradoresList}
                          />
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
                          <Stack
                            spacing={0.75}
                            direction="row"
                            alignItems="center"
                            divider={<Divider orientation="vertical" flexItem />}
                          >
                            <Typography variant="subtitle1">&nbsp;{fNumber(subtotal)}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {fPercent(percentagem)}
                            </Typography>
                          </Stack>
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
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DevolvidosTipos.propTypes = { indicadores: PropTypes.array, dev: PropTypes.bool };

export function DevolvidosTipos({ dev, indicadores }) {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.indicadores);
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const isNotFound = !indicadores?.filter((row) => row.total)?.length;
  const total = useMemo(() => sumBy(indicadores, 'total'), [indicadores]);
  const labels = useMemo(() => indicadores?.map((row) => row?.assunto), [indicadores]);
  const quantidades = useMemo(() => indicadores?.map((row) => row?.total), [indicadores]);
  const percentagem = useMemo(() => indicadores?.map((row) => (row?.total * 100) / total), [indicadores, total]);
  const resumo = useMemo(() => dadosResumo(indicadores, 'total', 'assunto'), [indicadores]);
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
      {indicadores.length > 0 && <TabView vista={vista} setVista={setVista} />}
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={4}>
                <CardInfo
                  dev={dev}
                  label={row?.desc}
                  title={row?.label}
                  total={row?.valor}
                  percentagem={row?.percentagem}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              {vista === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
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

Origem.propTypes = { top: PropTypes.string, indicadores: PropTypes.array };

export function Origem({ top, indicadores }) {
  const theme = useTheme();
  const agrupamento = localStorage.getItem('agrupamento') || 'Unidade orgânica';
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const topNumb = (top === 'Top 5' && 5) || (top === 'Top 10' && 10) || (top === 'Top 20' && 20) || 'Todos';
  const { isLoading } = useSelector((state) => state.indicadores);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  const origemByItem = useMemo(
    () => origensItem(indicadores, uos, colaboradores, agrupamento, topNumb),
    [agrupamento, colaboradores, indicadores, topNumb, uos]
  );
  const isNotFound = !origemByItem?.filter((row) => row?.total).length;
  const total = useMemo(() => sumBy(origemByItem, 'total'), [origemByItem]);
  const labels = useMemo(() => origemByItem?.map((row) => row?.label), [origemByItem]);
  const quantidades = useMemo(() => origemByItem?.map((row) => row?.total), [origemByItem]);
  const percentagem = useMemo(() => origemByItem?.map((row) => (row?.total * 100) / total), [origemByItem, total]);
  const resumo = useMemo(
    () => [
      { label: 'Total', valor: sumBy(origemByItem, 'total'), desc: '' },
      ...dadosResumo(origemByItem, 'total', 'label'),
    ],
    [origemByItem]
  );
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
      {indicadores.length > 0 && <TabView vista={vista} setVista={setVista} />}
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={6} md={3}>
                <CardInfo title={row?.label} total={row?.valor} label={row?.desc} percentagem={row?.percentagem} />
              </Grid>
            ))}
            <Grid item xs={12}>
              {vista === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="line" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport percentagem total={total} label={agrupamento} label1="Quantidade" dados={origemByItem} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ColaboradorComp.propTypes = {
  colaborador: PropTypes.object,
  setColaborador: PropTypes.func,
  colaboradorComp: PropTypes.object,
  colaboradoresList: PropTypes.array,
};

export function ColaboradorComp({ colaborador, colaboradoresList = [], colaboradorComp, setColaborador }) {
  return (
    <Grid item xs={12} sm={6}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{ py: 1, px: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
      >
        <MyAvatar
          alt={colaborador?.label}
          src={getFile('colaborador', isProduction() ? colaborador?.foto : '')}
          sx={{ width: 50, height: 50, boxShadow: (theme) => theme.customShadows.z8 }}
        />
        <Autocomplete
          fullWidth
          size="small"
          disableClearable
          value={colaborador}
          onChange={(event, newValue) => setColaborador(newValue)}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          options={colaboradoresList?.filter((row) => row?.id !== colaboradorComp?.id)}
          renderInput={(params) => <TextField {...params} label="Colaborador 1" />}
        />
      </Stack>
    </Grid>
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

export function LineProgress({ item, trabalhadoC1, trabalhadoC2, isTotal, leftSuccess }) {
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

// ----------------------------------------------------------------------

function colaboradoresFilter(colaboradores, dados) {
  const colaboradoresList = [];
  dados?.forEach((row) => {
    const colab = colaboradores?.find((item) => item.perfil_id === row?.item);
    if (colab) {
      colaboradoresList.push({ id: colab?.perfil_id, foto: colab?.foto_disk, label: colab?.perfil?.displayName });
    }
  });

  return colaboradoresList;
}

// ----------------------------------------------------------------------

function origensItem(indicadores, uos, colaboradores, agrupamento, topNumb) {
  const dados = [];
  indicadores?.forEach((row, index) => {
    if (agrupamento === 'Unidade orgânica') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        dados.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        dados.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (agrupamento === 'Colaborador') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        dados.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        dados.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });

  return dados;
}
