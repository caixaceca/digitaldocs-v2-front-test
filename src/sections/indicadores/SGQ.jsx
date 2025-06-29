import sumBy from 'lodash/sumBy';
import { useMemo, useState } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fPercent, fNumber } from '../../utils/formatNumber';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// components
import GridItem from '../../components/GridItem';
import Chart, { useChart } from '../../components/chart';
import { TableHeadCustom } from '../../components/table';
import { SearchIndicadores } from '../../components/SearchToolbar';
//
import { IndicadorItem } from './Indicadores';
import { applySortFilter } from './applySortFilter';
// _mock_
import { meses, mesesAbr } from '../../_mock';

// ---------------------------------------------------------------------------------------------------------------------

const chartOptionsCommon = (theme) => ({
  colors: [theme.palette.success.main, theme.palette.focus.main, theme.palette.primary.dark],
  chart: { type: 'line', stacked: false },
  legend: { position: 'bottom', horizontalAlign: 'center' },
  grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
  stroke: { width: 3 },
  yaxis: [
    {
      seriesName: 'Entrada',
      labels: { formatter: (value) => fNumber(value) },
      title: { text: 'Nº de processos', style: { color: theme.palette.success.main } },
    },
    { seriesName: 'Entrada', show: false },
    {
      opposite: true,
      seriesName: 'Rácio',
      labels: { formatter: (value) => fPercent(value) },
      title: { text: 'Percentagem', style: { color: theme.palette.primary.dark } },
    },
  ],
  tooltip: {
    y: [
      { formatter: (value) => fNumber(value) },
      { formatter: (value) => fNumber(value) },
      { seriesName: 'Percentagem', formatter: (value) => fPercent(value) },
    ],
    x: { show: true },
  },
});

// ---------------------------------------------------------------------------------------------------------------------

export function EntradaTrabalhado({ entradas, saidas }) {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.indicadores);
  const dados = useMemo(() => entradaTrabalhado(entradas, saidas), [entradas, saidas]);
  const isNotFound = !entradas?.length && !saidas?.length;

  const series = useMemo(
    () => [
      { name: 'Entrada', type: 'column', data: dados?.map(({ entrada }) => entrada) },
      { name: 'Trabalhado', type: 'column', data: dados?.map(({ saida }) => saida) },
      { name: 'Rácio', type: 'line', data: dados?.map(({ racio }) => racio) },
    ],
    [dados]
  );

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    plotOptions: { bar: { borderRadius: 2, columnWidth: '40%' } },
    xaxis: { categories: dados?.map(({ mes }) => mes), labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <>
      {isLoading || isNotFound ? (
        <Card sx={{ p: 1 }}>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />
        </Card>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ p: 1 }}>
            <TableContainer>
              <Table id="table-to-xls-tipo">
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    {mesesAbr?.map((row, index) => (
                      <TableCell key={`mes_${index}`} align="right">
                        {row?.label}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ typography: 'subtitle1' }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {['Entrada', 'Trabalhado', 'Desvio', 'Rácio']?.map((item) => (
                    <TableRow hover key={item}>
                      <TableCell sx={{ typography: 'subtitle2' }}>{item}</TableCell>
                      {dados?.map((row, index) => (
                        <TableCell
                          align="right"
                          key={`${item}_${index}`}
                          sx={{
                            color:
                              (item === 'Desvio' && row?.desvio > 0 && 'success.main') ||
                              (item === 'Desvio' && row?.desvio < 0 && 'error.main'),
                          }}
                        >
                          {(item === 'Entrada' && fNumber(row?.entrada)) ||
                            (item === 'Trabalhado' && fNumber(row?.saida)) ||
                            (item === 'Desvio' && fNumber(row?.desvio)) ||
                            (row?.entrada === 0 && '--') ||
                            fPercent(row?.racio)}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ typography: 'subtitle1' }}>
                        {(item === 'Entrada' && fNumber(sumBy(dados, 'entrada'))) ||
                          (item === 'Trabalhado' && fNumber(sumBy(dados, 'saida'))) ||
                          (item === 'Desvio' && fNumber(sumBy(dados, 'desvio'))) ||
                          fPercent((sumBy(dados, 'saida') * 100) / sumBy(dados, 'entrada'))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Card sx={{ p: 1, pt: 3 }}>
            <Chart type="line" series={series} options={chartOptions} height={500} />
          </Card>
        </Stack>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ProcessosTrabalhados({ indicadores, acao = false }) {
  const [mes, setMes] = useState(null);
  const [item, setItem] = useState(null);
  const { isLoading } = useSelector((state) => state.indicadores);
  const [detalhes, setDetalhes] = useState(localStorage.getItem('detalhes') === 'true');
  const totalTrabalhado = useMemo(() => sumBy(indicadores || [], 'total'), [indicadores]);
  const itemsList = useMemo(
    () =>
      acao ? [...new Set(indicadores?.map((item) => item.forma))] : [...new Set(indicadores?.map((item) => item.tipo))],
    [acao, indicadores]
  );
  const dadosFilter = useMemo(
    () => applySortFilter({ mes, acao, item, dados: indicadores, comparator: getComparator('asc', 'mes') }),
    [item, acao, indicadores, mes]
  );
  const indicadoresAgrupados = useMemo(() => agruparIndicadores(dadosFilter, [], 'mes'), [dadosFilter]);
  const indicadoresPorAssunto = useMemo(
    () => agruparIndicadores(dadosFilter, [], acao ? 'forma' : 'tipo'),
    [acao, dadosFilter]
  );
  const isNotFound = !dadosFilter.length;

  return (
    <>
      {!!indicadores?.length && (
        <Card sx={{ mb: 3, pb: 1 }}>
          <Stack sx={{ p: 2 }}>
            <TotalItem assunto="Total trabalhado" totalTrabalhado={totalTrabalhado} />
          </Stack>
          <SearchIndicadores
            mes={mes}
            item={item}
            setMes={setMes}
            setItem={setItem}
            detalhes={detalhes}
            itemsList={itemsList}
            setDetalhes={setDetalhes}
            indicador={acao ? 'Ação' : 'Trabalhados'}
          />
        </Card>
      )}
      {isLoading || isNotFound ? (
        <Card sx={{ p: 1 }}>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <DadosMes
            item="Total"
            detalhes={!item}
            mp={!item && !mes}
            totalTrabalhado={totalTrabalhado}
            indicadores={indicadoresPorAssunto}
            trabalhado={sumBy(indicadoresPorAssunto, 'total')}
          />
          {!mes &&
            detalhes &&
            indicadoresAgrupados?.map(({ item, indicadores }, index) => {
              const total = sumBy(indicadores, 'total');
              return (
                <DadosMes
                  trabalhado={total}
                  key={`mes__${index}`}
                  indicadores={indicadores}
                  detalhes={detalhes && !item}
                  totalTrabalhado={totalTrabalhado}
                  item={meses?.find(({ id }) => id === item)?.label}
                />
              );
            })}
        </Grid>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Colaboradores({ entradas, saidas }) {
  const [mes, setMes] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [detalhes, setDetalhes] = useState(localStorage.getItem('detalhes') === 'true');
  const [viewEntrada, setViewEntrada] = useState(localStorage.getItem('viewEntrada') === 'true');
  const { isLoading } = useSelector((state) => state.indicadores);
  const { colaboradores } = useSelector((state) => state.intranet);
  const entradasFilter = applySortFilter({ mes, dados: entradas || [], comparator: getComparator('asc', 'mes') });
  const dadosFilter = applySortFilter({ mes, colaborador, dados: saidas, comparator: getComparator('asc', 'mes') });
  const isNotFound = !dadosFilter.length;
  const totalEntrada = sumBy(entradas, 'total');
  const totalTrabalhado = sumBy(saidas, 'total');
  const indicadoresPorColaborador = useMemo(
    () => agruparIndicadores(dadosFilter, colaboradores, 'perfil_id'),
    [colaboradores, dadosFilter]
  );
  const indicadoresAgrupados = useMemo(
    () => agruparIndicadores(dadosFilter, colaboradores, 'mes'),
    [dadosFilter, colaboradores]
  );
  const entradasMes = useMemo(() => agruparPorMes(entradasFilter, 'mes'), [entradasFilter]);

  return (
    <>
      {!!saidas?.length && (
        <Card sx={{ mb: 3, pb: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="center" sx={{ p: 2 }}>
            {viewEntrada && <TotalItem assunto="Total entrada" totalTrabalhado={totalEntrada} />}
            <TotalItem
              entrada={viewEntrada}
              assunto="Total trabalhado"
              totalEntrada={totalEntrada}
              totalTrabalhado={totalTrabalhado}
            />
          </Stack>
          <SearchIndicadores
            mes={mes}
            setMes={setMes}
            detalhes={detalhes}
            indicador="Colaboradores"
            viewEntrada={viewEntrada}
            setDetalhes={setDetalhes}
            colaborador={colaborador}
            setViewEntrada={setViewEntrada}
            setColaborador={setColaborador}
            colaboradoresList={indicadoresPorColaborador}
          />
        </Card>
      )}
      {isLoading || isNotFound ? (
        <Card sx={{ p: 1 }}>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <DadosMes
            item="Total"
            detalhes={!colaborador}
            viewEntrada={viewEntrada}
            mp={!colaborador && !mes}
            totalEntrada={totalEntrada}
            totalTrabalhado={totalTrabalhado}
            indicadores={indicadoresPorColaborador}
            entrada={sumBy(entradasFilter, 'total')}
            trabalhado={sumBy(indicadoresPorColaborador, 'total')}
          />
          {!mes &&
            detalhes &&
            indicadoresAgrupados?.map(({ indicadores, item }, index) => (
              <DadosMes
                colaborador
                key={`mes__${index}`}
                viewEntrada={viewEntrada}
                indicadores={indicadores}
                totalEntrada={totalEntrada}
                totalTrabalhado={totalTrabalhado}
                detalhes={detalhes && !colaborador}
                trabalhado={sumBy(indicadores, 'total')}
                item={meses?.find(({ id }) => id === item)?.label}
                entrada={entradasMes?.find(({ label }) => label === item)?.total}
              />
            ))}
        </Grid>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TotalItem({ assunto, totalTrabalhado = 0, totalEntrada = 0, entrada = false }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ pl: 3 }}>
      <Typography variant="h5" sx={{ color: 'text.secondary' }}>
        {assunto}:
      </Typography>
      <Typography variant="h5">{fNumber(totalTrabalhado)}</Typography>
      {entrada && (
        <Typography sx={{ color: 'text.secondary' }}>({fPercent((totalTrabalhado * 100) / totalEntrada)})</Typography>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DadosMes({
  mp,
  item,
  detalhes,
  indicadores,
  entrada = 0,
  trabalhado = 0,
  totalEntrada = 0,
  totalTrabalhado = 0,
  colaborador = false,
  viewEntrada = false,
}) {
  const { order, orderBy, onSort } = useTable({ defaultOrderBy: 'label', defaultOrder: 'asc' });
  const indicadoresOrdenados = applySortFilter({ comparator: getComparator(order, orderBy), dados: indicadores });
  const TABLE_HEAD = [
    { id: 'label', label: colaborador ? 'Colaborador' : 'Assunto', align: 'left' },
    { id: 'total', label: 'Total', align: 'right' },
    { id: '', label: '%', align: 'right' },
  ];
  return (
    <GridItem md={item === 'Total' ? 12 : 6} xl={item === 'Total' ? 12 : 4}>
      <Card sx={{ height: 1 }}>
        <Stack
          spacing={0.5}
          alignItems="center"
          sx={{ p: 2, pb: detalhes ? 1 : 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'center', sm: 'space-between' }}
        >
          <Typography variant={item === 'Total' ? 'h6' : 'subtitle1'}>{item}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {viewEntrada && (
              <>
                <Typography
                  variant={item === 'Total' ? 'body1' : 'body2'}
                  sx={{ color: 'text.success', opacity: 0.75 }}
                >
                  Entrada:
                </Typography>
                <Typography variant={item === 'Total' ? 'h6' : 'subtitle2'}>{fNumber(entrada)}</Typography>
                {!mp && entrada > 0 && totalEntrada > 0 && (
                  <Typography variant={item === 'Total' ? 'body2' : 'caption'} sx={{ color: 'text.disabled' }}>
                    ({fPercent((entrada * 100) / totalEntrada)})
                  </Typography>
                )}
              </>
            )}
            {viewEntrada && (
              <Typography variant={item === 'Total' ? 'body1' : 'body2'} sx={{ color: 'text.secondary', pl: 1 }}>
                Trabalhado:
              </Typography>
            )}
            <Typography variant={item === 'Total' ? 'h6' : 'subtitle2'}>{fNumber(trabalhado)}</Typography>
            {!mp && (
              <>
                {viewEntrada && entrada > 0 && (
                  <Typography
                    variant={item === 'Total' ? 'body2' : 'caption'}
                    sx={{ color: 'text.success', opacity: 0.5 }}
                  >
                    ({fPercent((trabalhado * 100) / entrada)})
                  </Typography>
                )}
                <Typography variant={item === 'Total' ? 'body2' : 'caption'} sx={{ color: 'text.disabled' }}>
                  ({fPercent((trabalhado * 100) / totalTrabalhado)})
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
        {detalhes && (
          <CardContent sx={{ p: 1, pb: '10px !important' }}>
            <Table>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={TABLE_HEAD} />
              <TableBody>
                {indicadoresOrdenados?.map((item, index) => (
                  <TableRow key={`row_${index}`} hover>
                    <TableCell>{item?.label}</TableCell>
                    <TableCell align="right">{fNumber(item?.total)}</TableCell>
                    <TableCell align="right" sx={{ typography: 'caption', color: 'text.secondary' }}>
                      {viewEntrada && entrada > 0 && (
                        <Typography variant="caption" sx={{ pr: 2, color: 'success.main', opacity: 0.75 }}>
                          {fPercent((item?.total * 100) / entrada)}
                        </Typography>
                      )}
                      <Typography variant="caption">{fPercent((item?.total * 100) / trabalhado)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </GridItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function entradaTrabalhado(entradas, saidas) {
  const dadosCompletos = [];
  mesesAbr?.forEach(({ id, label }) => {
    const entrada = entradas?.find(({ mes }) => mes === id);
    const saida = saidas?.find(({ mes }) => mes === id);
    dadosCompletos?.push({
      mes: label,
      saida: saida?.total || 0,
      entrada: entrada?.total || 0,
      desvio: (saida?.total || 0) - (entrada?.total || 0),
      racio: entrada?.total > 0 && saida?.total > 0 ? (saida?.total * 100) / entrada?.total : 0,
    });
  });

  return dadosCompletos;
}

// ---------------------------------------------------------------------------------------------------------------------

function agruparIndicadores(dados, colaboradores, item) {
  const dadosGrouped = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      if (item === 'mes') res[value[item]] = { item: value[item], indicadores: [] };
      else if (item === 'perfil_id') {
        const colaborador = colaboradores?.find((colab) => colab?.perfil_id === value[item]);
        res[value[item]] = { id: value[item], label: colaborador?.perfil?.displayName || value[item], total: 0 };
      } else if (item === 'tipo') res[value[item]] = { label: value?.tipo || value[item], total: 0 };
      else if (item === 'forma') res[value[item]] = { label: value?.forma || value[item], total: 0 };

      dadosGrouped.push(res[value[item]]);
    }
    if (item === 'mes') {
      const colaborador =
        'perfil_id' in value
          ? colaboradores?.find((colab) => colab?.perfil_id === value?.perfil_id) || value?.perfil_id
          : '';
      res[value[item]].indicadores.push({
        total: value?.total,
        label: colaborador?.perfil?.displayName || colaborador || value?.tipo || value?.forma,
      });
    } else if (item === 'perfil_id' || item === 'tipo' || item === 'forma') {
      res[value[item]].total += value?.total;
    }
    return res;
  }, {});

  return dadosGrouped;
}

// ---------------------------------------------------------------------------------------------------------------------

function agruparPorMes(dados, item) {
  const dadosGrouped = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { label: value?.mes || value[item], total: 0 };
      dadosGrouped.push(res[value[item]]);
    }
    res[value[item]].total += value?.total;
    return res;
  }, {});

  return dadosGrouped;
}
