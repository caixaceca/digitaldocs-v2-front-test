import sumBy from 'lodash/sumBy';
import { useState, useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
// utils
import { fNumber, fPercent } from '../../utils/formatNumber';
import { formatDate, fYear, fMonthYear } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// components
import GridItem from '../../components/GridItem';
import Chart, { useChart } from '../../components/chart';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosIndicadores';
//
import { TabView, CardInfo, dadosResumo, TableExport, IndicadorItem } from './Indicadores';

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

export function Criacao({ vista, indicadores }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  const [view, setView] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const isNotFound = !indicadores?.filter(({ criado_em: em }) => em).length;
  const total = sumBy(indicadores, 'total');
  const series = useMemo(
    () => [{ name: 'Nº de processos', data: indicadores?.map(({ criado_em: em, total }) => em && total) }],
    [indicadores]
  );
  const chartOptions = useChart({
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    xaxis: {
      categories:
        vista === 'Anual'
          ? indicadores?.map(({ criado_em: em }) => em && fYear(em))
          : indicadores?.map(({ criado_em: em }) => em && formatDate(em, 'MMM yyyy')),
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
            {resumo?.map(({ label, desc, valor, percentagem }) => (
              <GridItem key={label} sm={6} md={3}>
                <CardInfo
                  title={label}
                  total={valor}
                  percentagem={percentagem}
                  label={
                    (desc && vista === 'Anual' && fYear(desc)?.toString()) ||
                    (desc && vista === 'Mensal' && fMonthYear(desc)) ||
                    desc
                  }
                />
              </GridItem>
            ))}
            <GridItem>
              {view === 'Gráfico' ? (
                <Chart type="area" series={series} options={chartOptions} height={400} />
              ) : (
                <TableExport label="Data" label1="Quantidade" dados={indicadores} vista={vista} total={total} />
              )}
            </GridItem>
          </Grid>
        }
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DevolvidosTipos({ dev, indicadores }) {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.indicadores);
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const isNotFound = !indicadores?.filter(({ total }) => total)?.length;
  const total = useMemo(() => sumBy(indicadores, 'total'), [indicadores]);
  const labels = useMemo(() => indicadores?.map(({ assunto }) => assunto), [indicadores]);
  const quantidades = useMemo(() => indicadores?.map(({ total }) => total), [indicadores]);
  const percentagem = useMemo(() => indicadores?.map(({ total: t }) => (t * 100) / total), [indicadores, total]);
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
            {resumo?.map(({ label, desc, valor, percentagem }) => (
              <GridItem key={label} sm={4}>
                <CardInfo dev={dev} label={desc} title={label} total={valor} percentagem={percentagem} />
              </GridItem>
            ))}
            <GridItem>
              {vista === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="line" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport percentagem total={total} label="Processo" label1="Quantidade" dados={indicadores} />
              )}
            </GridItem>
          </Grid>
        }
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
  const isNotFound = !origemByItem?.filter(({ total }) => total).length;
  const total = useMemo(() => sumBy(origemByItem, 'total'), [origemByItem]);
  const labels = useMemo(() => origemByItem?.map(({ label }) => label), [origemByItem]);
  const quantidades = useMemo(() => origemByItem?.map(({ total }) => total), [origemByItem]);
  const percentagem = useMemo(() => origemByItem?.map(({ total: t }) => (t * 100) / total), [origemByItem, total]);
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
            {resumo?.map(({ label, valor, desc, percentagem }) => (
              <GridItem key={label} sm={6} md={3}>
                <CardInfo title={label} total={valor} label={desc} percentagem={percentagem} />
              </GridItem>
            ))}
            <GridItem>
              {vista === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="line" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport percentagem total={total} label={agrupamento} label1="Quantidade" dados={origemByItem} />
              )}
            </GridItem>
          </Grid>
        }
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function origensItem(indicadores, uos, colaboradores, agrupamento, topNumb) {
  const dados = [];
  indicadores?.forEach(({ objeto_id: objeto, total }, index) => {
    if (agrupamento === 'Unidade orgânica') {
      const uo = uos?.find(({ id }) => id === objeto);
      if (topNumb !== 'Todos' && index < topNumb) dados.push({ total, label: uo?.label || objeto });
      else if (topNumb === 'Todos') dados.push({ total, label: uo?.label || objeto });
    } else if (agrupamento === 'Colaborador') {
      const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === objeto);
      if (topNumb !== 'Todos' && index < topNumb) dados.push({ total, label: colaborador?.nome || objeto });
      else if (topNumb === 'Todos') dados.push({ total, label: colaborador?.nome || objeto });
    }
  });

  return dados;
}
