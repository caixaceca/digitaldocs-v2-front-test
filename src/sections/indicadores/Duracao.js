import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fNumber, fNumber2, converterSegundos } from '../../utils/formatNumber';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import Chart, { useChart } from '../../components/chart';
import { SkeletonTable } from '../../components/skeleton';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosIndicadores';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { IndicadorItem, CardInfo, TableExport, TabView, dadosResumo } from './Indicadores';
// _mock_
import { meses } from '../../_mock';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'tempo_execucao', label: 'Tempo médio', align: 'left' },
];

// ----------------------------------------------------------------------

Execucao.propTypes = { indicadores: PropTypes.array };

export function Execucao({ indicadores }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { fluxos, estados } = useSelector((state) => state.parametrizacao);
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
        <TableContainer>
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

            {!isLoading && isNotFound && <TableSearchNotFound message="Não foi encontrado nenhum dado disponível..." />}
          </Table>
        </TableContainer>
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
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Conclusao.propTypes = { indicadores: PropTypes.array };

export function Conclusao({ indicadores }) {
  const { uos } = useSelector((state) => state.intranet);
  const { isLoading } = useSelector((state) => state.indicadores);
  const [vista, setVista] = useState(localStorage.getItem('tabView') || 'Gráfico');
  const conclusaoByItem = useMemo(() => conclusaoP(indicadores, uos), [indicadores, uos]);
  const isNotFound = !conclusaoByItem?.filter((row) => row?.dias).length;

  const resumo = useMemo(() => dadosResumo(conclusaoByItem, 'dias', 'label'), [conclusaoByItem]);
  const series = useMemo(
    () => [{ name: 'Média em dias', data: conclusaoByItem?.map((row) => row?.dias) }],
    [conclusaoByItem]
  );

  const chartOptions = useChart({
    stroke: { show: false },
    plotOptions: { bar: { columnWidth: '25%' } },
    tooltip: { y: { formatter: (value) => fNumber2(value) } },
    xaxis: { categories: conclusaoByItem?.map((row) => row?.label) },
    grid: { strokeDashArray: 2, xaxis: { lines: { show: false } } },
    yaxis: { title: { text: 'Dias' }, labels: { formatter: (value) => fNumber(value) } },
  });

  return (
    <Card sx={{ p: 1 }}>
      {conclusaoByItem.length > 0 && (
        <TabView
          vista={vista}
          setVista={setVista}
          exportar={<ExportarDados tabela="Duração dos processos - Conclusão" dados={conclusaoByItem} />}
        />
      )}
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3}>
            {resumo?.map((row) => (
              <Grid key={row?.label} item xs={12} sm={4}>
                <CardInfo title={row?.label} total={row?.valor} label={row?.desc} conclusao />
              </Grid>
            ))}
            <Grid item xs={12}>
              {vista === 'Gráfico' && series?.[0]?.data?.length > 0 ? (
                <Chart type="bar" series={series} options={chartOptions} height={500} />
              ) : (
                <TableExport label="Estado" label1="Média em dias" dados={conclusaoByItem} />
              )}
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DuracaoEquipa.propTypes = { indicadores: PropTypes.array };

export function DuracaoEquipa({ indicadores }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  const duracao = useMemo(() => duracaoGroup(indicadores, 'mes'), [indicadores]);
  const isNotFound = !indicadores.length;

  return (
    <>
      {isLoading || isNotFound ? (
        <Card sx={{ p: 1 }}>
          <IndicadorItem isLoading={isLoading} isNotFound={isNotFound} />
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {duracao?.map((row, index) => (
            <Grid key={`mes__${index}`} item xs={12} md={6} xl={4}>
              <Card sx={{ height: 1 }}>
                <CardHeader sx={{ p: 2, pb: 1 }} title={row?.item} />
                <CardContent sx={{ p: 1, pb: '10px !important' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Assunto</TableCell>
                        <TableCell align="right">Média</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row?.indicadores?.map((row, index) => (
                        <TableRow key={`table_row_export_${index}`} hover>
                          <TableCell>{row?.fluxo}</TableCell>
                          <TableCell align="right">
                            {row?.media} {row?.unidade} {row?.media > 1 ? 's' : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function duracaoGroup(dados, item) {
  const dadosGrouped = [];
  dados = applySort(dados, getComparator('asc', 'mes'));
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { item: meses?.find((row) => row?.id === value[item])?.label || value[item], indicadores: [] };
      dadosGrouped.push(res[value[item]]);
    }
    res[value[item]].indicadores.push({ media: value?.media, fluxo: value?.fluxo, unidade: value?.unidade });
    return res;
  }, {});

  return dadosGrouped;
}

function conclusaoP(indicadores, uos) {
  const conclusaoByItem = [];
  indicadores?.forEach((row) => {
    const uo = uos?.find((uo) => uo.id === row?.uo_origem_id);
    conclusaoByItem.push({ dias: row?.dmedh / 24, label: uo?.label || row?.uo_origem_id });
  });

  return conclusaoByItem;
}
