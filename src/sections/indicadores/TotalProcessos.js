import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
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
import { Fechar, DefaultAction } from '../../components/Actions';
//
import { IndicadorItem, CardInfo, ColaboradorCard, TableExport, TabView, LineProgress } from './Indicadores';

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

Criacao.propTypes = { periodo: PropTypes.string };

export function Criacao({ periodo }) {
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
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

  const resumo = [
    { label: 'Total', valor: total, desc: '' },
    { label: 'Média', valor: total / indicadores?.length, desc: periodo.charAt(0).toUpperCase() + periodo.slice(1) },
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
                  label={
                    (row?.desc &&
                      row?.label !== 'Total' &&
                      row?.label !== 'Média' &&
                      periodo === 'anual' &&
                      fYear(row?.desc)?.toString()) ||
                    (row?.desc &&
                      row?.label !== 'Total' &&
                      row?.label !== 'Média' &&
                      periodo === 'mensal' &&
                      fMonthYear(row?.desc)) ||
                    row?.desc?.toString()
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
                                  src={getFile('colaborador', isProduction() ? colaborador1?.foto : '')}
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
                                  src={getFile('colaborador', isProduction() ? colaborador2?.foto : '')}
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
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function DevolvidosTipos() {
  const theme = useTheme();
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
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
      {indicadores.length > 0 && <TabView vista={vista} setVista={setVista} />}
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

Origem.propTypes = { top: PropTypes.string };

export function Origem({ top }) {
  const theme = useTheme();
  const agrupamento = localStorage.getItem('agrupamento') || 'Unidade orgânica';
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const topNumb = (top === 'Top 5' && 5) || (top === 'Top 10' && 10) || (top === 'Top 20' && 20) || 'Todos';
  const { isLoading, indicadores } = useSelector((state) => state.indicadores);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  const origemByItem = [];
  indicadores?.forEach((row, index) => {
    if (agrupamento === 'Unidade orgânica') {
      const uo = uos?.find((uo) => uo.id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        origemByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        origemByItem.push({ total: row?.total, label: uo?.label || row?.objeto_id });
      }
    } else if (agrupamento === 'Colaborador') {
      const colaborador = colaboradores?.find((colaborador) => colaborador.perfil_id === row?.objeto_id);
      if (topNumb !== 'Todos' && index < topNumb) {
        origemByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      } else if (topNumb === 'Todos') {
        origemByItem.push({ total: row?.total, label: colaborador?.perfil?.displayName || row?.objeto_id });
      }
    }
  });
  const isNotFound = !origemByItem?.filter((row) => row?.total).length;
  const total = sumBy(origemByItem, 'total');
  const labels = origemByItem?.map((row) => row?.label);
  const quantidades = origemByItem?.map((row) => row?.total);
  const percentagem = origemByItem?.map((row) => (row?.total * 100) / total);
  const resumo = [
    { label: 'Total', valor: sumBy(origemByItem, 'total'), desc: '' },
    { label: 'Média', valor: sumBy(origemByItem, 'total') / origemByItem?.length, desc: '' },
    {
      label: 'Mais processos',
      valor: Math.max(...origemByItem?.map((row) => row.total)),
      desc: origemByItem?.find((row) => row.total === Math.max(...origemByItem?.map((row) => row.total)))?.label,
    },
    {
      label: 'Menos processos',
      valor: Math.min(...origemByItem?.map((row) => row.total)),
      desc: origemByItem?.find((row) => row.total === Math.min(...origemByItem?.map((row) => row.total)))?.label,
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
      {indicadores.length > 0 && <TabView vista={vista} setVista={setVista} />}
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
