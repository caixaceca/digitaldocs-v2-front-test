import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
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
import Chart, { useChart } from '../../components/chart';
import { TableHeadCustom } from '../../components/table';
import { SearchIndicadores } from '../../components/SearchToolbar';
//
import { IndicadorItem } from './Indicadores';
import { applySortFilter } from './applySortFilter';
// _mock_
import { meses, mesesAbr } from '../../_mock';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export function EntradaTrabalhado() {
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.indicadores);
  const indicadores = {
    objeto_entrada: [
      {
        ano: 2023,
        mes: 2,
        total: 4,
      },
      {
        ano: 2023,
        mes: 4,
        total: 16,
      },
      {
        ano: 2023,
        mes: 6,
        total: 10,
      },
      {
        ano: 2023,
        mes: 7,
        total: 33,
      },
      {
        ano: 2023,
        mes: 8,
        total: 13,
      },
      {
        ano: 2023,
        mes: 7,
        total: 2,
      },
      {
        ano: 2023,
        mes: 8,
        total: 4,
      },
      {
        ano: 2023,
        mes: 9,
        total: 7,
      },
      {
        ano: 2023,
        mes: 10,
        total: 9,
      },
    ],
    objeto_saida: [
      {
        ano: 2023,
        mes: 1,
        total: 3,
      },
      {
        ano: 2023,
        mes: 2,
        total: 14,
      },
      {
        ano: 2023,
        mes: 3,
        total: 2,
      },
      {
        ano: 2023,
        mes: 4,
        total: 26,
      },
      {
        ano: 2023,
        mes: 5,
        total: 3,
      },
      {
        ano: 2023,
        mes: 6,
        total: 20,
      },
      {
        ano: 2023,
        mes: 7,
        total: 95,
      },
      {
        ano: 2023,
        mes: 8,
        total: 5,
      },
      {
        ano: 2023,
        mes: 9,
        total: 6,
      },
      {
        ano: 2023,
        mes: 10,
        total: 21,
      },
    ],
  };

  const dados = useMemo(() => entradaTrabalhado(indicadores), [indicadores]);
  const isNotFound = !indicadores?.objeto_entrada.length && !indicadores?.objeto_saida.length;

  const series = useMemo(
    () => [
      { name: 'Entrada', type: 'column', data: dados?.map((row) => row?.entrada) },
      { name: 'Trabalhado', type: 'column', data: dados?.map((row) => row?.saida) },
      { name: 'Rácio', type: 'line', data: dados?.map((row) => row?.racio) },
    ],
    [dados]
  );

  const chartOptions = useChart({
    ...chartOptionsCommon(theme),
    plotOptions: { bar: { borderRadius: 2, columnWidth: '40%' } },
    xaxis: { categories: dados?.map((row) => row?.mes), labels: { maxHeight: 250 }, tooltip: { enabled: false } },
  });

  return (
    <>
      {isLoading || isNotFound ? (
        <Card sx={{ p: 1 }}>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 1, pt: 3 }}>
              <Chart type="line" series={series} options={chartOptions} height={500} />
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function ProcessosTrabalhados() {
  const [mes, setMes] = useState(null);
  const [assunto, setAssunto] = useState(null);
  const [detalhes, setDetalhes] = useState(localStorage.getItem('detalhes') === 'true');
  const { isLoading } = useSelector((state) => state.indicadores);
  const indicadores = [
    {
      ano: 2023,
      mes: 1,
      total: 2,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 1,
      total: 1,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 2,
      total: 9,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 2,
      total: 3,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 2,
      total: 2,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 3,
      total: 1,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 3,
      total: 1,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 4,
      total: 4,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 4,
      total: 11,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 4,
      total: 2,
      tipo: 'Encerramento de conta',
    },
    {
      ano: 2023,
      mes: 4,
      total: 4,
      tipo: 'Pedido de crédito',
    },
    {
      ano: 2023,
      mes: 4,
      total: 5,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 5,
      total: 1,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 5,
      total: 1,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 5,
      total: 1,
      tipo: 'Encerramento de conta',
    },
    {
      ano: 2023,
      mes: 6,
      total: 7,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 6,
      total: 3,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 6,
      total: 2,
      tipo: 'Encerramento de conta',
    },
    {
      ano: 2023,
      mes: 6,
      total: 2,
      tipo: 'Nº operação',
    },
    {
      ano: 2023,
      mes: 6,
      total: 1,
      tipo: 'Pedido de crédito',
    },
    {
      ano: 2023,
      mes: 6,
      total: 3,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 6,
      total: 1,
      tipo: 'Receção de faturas / Pagamento de fornecedor',
    },
    {
      ano: 2023,
      mes: 6,
      total: 1,
      tipo: 'Transferência Nacional',
    },
    {
      ano: 2023,
      mes: 7,
      total: 17,
      tipo: 'Abertura de conta',
    },
    {
      ano: 2023,
      mes: 7,
      total: 27,
      tipo: 'Atualização/Manutenção de conta',
    },
    {
      ano: 2023,
      mes: 7,
      total: 10,
      tipo: 'Cartão Vinti4 - Adesão',
    },
    {
      ano: 2023,
      mes: 7,
      total: 1,
      tipo: 'Encerramento de conta',
    },
    {
      ano: 2023,
      mes: 7,
      total: 24,
      tipo: 'Pedido de crédito',
    },
    {
      ano: 2023,
      mes: 7,
      total: 9,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 7,
      total: 1,
      tipo: 'Receção de Cartões - DOP',
    },
    {
      ano: 2023,
      mes: 7,
      total: 5,
      tipo: 'Receção de faturas / Pagamento de fornecedor',
    },
    {
      ano: 2023,
      mes: 7,
      total: 1,
      tipo: 'Transferência Internacional',
    },
    {
      ano: 2023,
      mes: 8,
      total: 2,
      tipo: 'Comunicação Operação Numerário',
    },
    {
      ano: 2023,
      mes: 8,
      total: 2,
      tipo: 'Pedido de crédito',
    },
    {
      ano: 2023,
      mes: 8,
      total: 1,
      tipo: 'Processos Judiciais e Fiscais',
    },
    {
      ano: 2023,
      mes: 9,
      total: 3,
      tipo: 'Comunicação Operação Numerário',
    },
    {
      ano: 2023,
      mes: 9,
      total: 1,
      tipo: 'Encerramento de conta',
    },
    {
      ano: 2023,
      mes: 9,
      total: 2,
      tipo: 'Pedido de crédito',
    },
    {
      ano: 2023,
      mes: 10,
      total: 1,
      tipo: 'Cartão Vinti4 - Adesão',
    },
    {
      ano: 2023,
      mes: 10,
      total: 20,
      tipo: 'Comunicação Operação Numerário',
    },
  ];
  const totalTrabalhado = useMemo(() => sumBy(indicadores, 'total'), [indicadores]);
  const assuntosList = useMemo(() => [...new Set(indicadores?.map((item) => item.tipo))], [indicadores]);
  const dadosFilter = applySortFilter({ mes, assunto, dados: indicadores, comparator: getComparator('asc', 'mes') });
  const indicadoresAgrupados = useMemo(() => agruparIndicadores(dadosFilter, [], 'mes'), [dadosFilter]);
  const indicadoresPorAssunto = useMemo(() => agruparIndicadores(dadosFilter, [], 'tipo'), [dadosFilter]);
  const isNotFound = !dadosFilter.length;

  return (
    <>
      {!!indicadores.length && (
        <Card sx={{ mb: 3, pb: 1 }}>
          <Stack sx={{ p: 2 }}>
            <TotalItem assunto="Total trabalhado" totalTrabalhado={totalTrabalhado} />
          </Stack>
          <SearchIndicadores
            mes={mes}
            setMes={setMes}
            assunto={assunto}
            item="Trabalhados"
            detalhes={detalhes}
            setAssunto={setAssunto}
            setDetalhes={setDetalhes}
            assuntosList={assuntosList}
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
            detalhes={!assunto}
            mp={!assunto && !mes}
            totalTrabalhado={totalTrabalhado}
            indicadores={indicadoresPorAssunto}
            trabalhado={sumBy(indicadoresPorAssunto, 'total')}
          />
          {!mes &&
            detalhes &&
            indicadoresAgrupados?.map((row, index) => {
              const total = sumBy(row?.indicadores, 'total');
              return (
                <DadosMes
                  trabalhado={total}
                  key={`mes__${index}`}
                  indicadores={row?.indicadores}
                  detalhes={detalhes && !assunto}
                  totalTrabalhado={totalTrabalhado}
                  item={meses?.find((item) => item?.id === row?.item)?.label}
                />
              );
            })}
        </Grid>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Colaboradores() {
  const [mes, setMes] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [detalhes, setDetalhes] = useState(localStorage.getItem('detalhes') === 'true');
  const [viewEntrada, setViewEntrada] = useState(localStorage.getItem('viewEntrada') === 'true');
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoading } = useSelector((state) => state.indicadores);
  const indicadores = {
    objeto_entrada: [
      {
        ano: 2023,
        mes: 2,
        total: 1,
      },
      {
        ano: 2023,
        mes: 2,
        total: 3,
      },
      {
        ano: 2023,
        mes: 4,
        total: 15,
      },
      {
        ano: 2023,
        mes: 4,
        total: 1,
      },
      {
        ano: 2023,
        mes: 6,
        total: 10,
      },
      {
        ano: 2023,
        mes: 7,
        total: 33,
      },
      {
        ano: 2023,
        mes: 8,
        total: 13,
      },
      {
        ano: 2023,
        mes: 7,
        total: 2,
      },
      {
        ano: 2023,
        mes: 8,
        total: 4,
      },
      {
        ano: 2023,
        mes: 9,
        total: 5,
      },
      {
        ano: 2023,
        mes: 9,
        total: 2,
      },
      {
        ano: 2023,
        mes: 10,
        total: 3,
      },
      {
        ano: 2023,
        mes: 10,
        total: 6,
      },
    ],
    objeto_saida: [
      {
        ano: 2023,
        mes: 1,
        total: 3,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 2,
        total: 4,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 2,
        total: 3,
        perfil_id: 2,
      },
      {
        ano: 2023,
        mes: 2,
        total: 7,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 3,
        total: 1,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 3,
        total: 1,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 4,
        total: 19,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 4,
        total: 4,
        perfil_id: 2,
      },
      {
        ano: 2023,
        mes: 4,
        total: 3,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 5,
        total: 1,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 5,
        total: 2,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 6,
        total: 14,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 6,
        total: 6,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 7,
        total: 95,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 8,
        total: 5,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 9,
        total: 1,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 9,
        total: 5,
        perfil_id: 13,
      },
      {
        ano: 2023,
        mes: 10,
        total: 1,
        perfil_id: 1,
      },
      {
        ano: 2023,
        mes: 10,
        total: 20,
        perfil_id: 13,
      },
    ],
    erro: null,
  };
  const entradasFilter = applySortFilter({
    mes,
    dados: indicadores?.objeto_entrada || [],
    comparator: getComparator('asc', 'mes'),
  });
  const dadosFilter = applySortFilter({
    mes,
    colaborador,
    dados: indicadores?.objeto_saida || [],
    comparator: getComparator('asc', 'mes'),
  });
  const isNotFound = !dadosFilter.length;
  const totalEntrada = sumBy(indicadores?.objeto_entrada, 'total');
  const totalTrabalhado = sumBy(indicadores?.objeto_saida, 'total');
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
      {!!indicadores?.objeto_saida?.length && (
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
            item="Colaboradores"
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
            indicadoresAgrupados?.map((row, index) => (
              <DadosMes
                colaborador
                key={`mes__${index}`}
                viewEntrada={viewEntrada}
                totalEntrada={totalEntrada}
                indicadores={row?.indicadores}
                totalTrabalhado={totalTrabalhado}
                detalhes={detalhes && !colaborador}
                trabalhado={sumBy(row?.indicadores, 'total')}
                item={meses?.find((item) => item?.id === row?.item)?.label}
                entrada={entradasMes?.find((item) => item?.label === row?.item)?.total}
              />
            ))}
        </Grid>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TotalItem.propTypes = {
  entrada: PropTypes.bool,
  assunto: PropTypes.string,
  totalEntrada: PropTypes.number,
  totalTrabalhado: PropTypes.number,
};

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

// --------------------------------------------------------------------------------------------------------------------------------------------

DadosMes.propTypes = {
  mp: PropTypes.bool,
  item: PropTypes.string,
  detalhes: PropTypes.bool,
  entrada: PropTypes.number,
  viewEntrada: PropTypes.bool,
  colaborador: PropTypes.bool,
  trabalhado: PropTypes.number,
  indicadores: PropTypes.array,
  totalEntrada: PropTypes.number,
  totalTrabalhado: PropTypes.number,
};

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
    <Grid item xs={12} md={item === 'Total' ? 12 : 6} xl={item === 'Total' ? 12 : 4}>
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
    </Grid>
  );
}

// ----------------------------------------------------------------------

function entradaTrabalhado(dados) {
  const dadosCompletos = [];
  mesesAbr?.forEach((row) => {
    const entrada = dados?.objeto_entrada?.find((item) => item?.mes === row?.id);
    const saida = dados?.objeto_saida?.find((item) => item?.mes === row?.id);
    dadosCompletos?.push({
      mes: row?.label,
      saida: saida?.total || 0,
      entrada: entrada?.total || 0,
      desvio: (saida?.total || 0) - (entrada?.total || 0),
      racio: entrada?.total > 0 && saida?.total > 0 ? (saida?.total * 100) / entrada?.total : 0,
    });
  });

  return dadosCompletos;
}

function agruparIndicadores(dados, colaboradores, item) {
  const dadosGrouped = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      if (item === 'mes') {
        res[value[item]] = { item: value[item], indicadores: [] };
      } else if (item === 'perfil_id') {
        const colaborador = colaboradores?.find((colab) => colab?.id === value[item]);
        res[value[item]] = { id: value[item], label: colaborador?.perfil?.displayName || value[item], total: 0 };
      } else if (item === 'tipo') {
        res[value[item]] = { label: value?.tipo || value[item], total: 0 };
      }
      dadosGrouped.push(res[value[item]]);
    }
    if (item === 'mes') {
      const colaborador =
        'perfil_id' in value ? colaboradores?.find((colab) => colab?.id === value?.perfil_id) || value?.perfil_id : '';
      res[value[item]].indicadores.push({
        total: value?.total,
        label: colaborador?.perfil?.displayName || colaborador || value?.tipo,
      });
    } else if (item === 'perfil_id' || item === 'tipo') {
      res[value[item]].total += value?.total;
    }
    return res;
  }, {});

  return dadosGrouped;
}

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
