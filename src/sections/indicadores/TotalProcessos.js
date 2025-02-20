import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
// utils
import { fNumber, fPercent } from '../../utils/formatNumber';
import { fMShortYear, fYear, fMonthYear } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// components
import Chart, { useChart } from '../../components/chart';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosIndicadores';
//
import { TabView, CardInfo, dadosResumo, TableExport, IndicadorItem } from './Indicadores';

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

Criacao.propTypes = { vista: PropTypes.string, indicadores: PropTypes.array };

export function Criacao({ vista, indicadores }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  const [view, setView] = useState(localStorage.getItem('tabView') || 'Gráfico');
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
        vista === 'Anual'
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
      {indicadores.length > 0 && (
        <TabView
          vista={view}
          setVista={setView}
          exportar={<ExportarDados tabela="Total de processos - Data" dados={indicadores} />}
        />
      )}
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
                    (row?.desc && vista === 'Anual' && fYear(row?.desc)?.toString()) ||
                    (row?.desc && vista === 'Mensal' && fMonthYear(row?.desc)) ||
                    row?.desc
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              {view === 'Gráfico' ? (
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
      {indicadores.length > 0 && (
        <TabView
          vista={vista}
          setVista={setVista}
          exportar={<ExportarDados tabela="Total de processos" dados={indicadores} />}
        />
      )}
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
      {origemByItem.length > 0 && (
        <TabView
          vista={vista}
          setVista={setVista}
          exportar={<ExportarDados tabela="Origem dos processos" dados={origemByItem} />}
        />
      )}
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
