import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { ptDateTime, fDistance, fToNow } from '../../utils/formatTime';
import { newLineText, normalizeText, noDados } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { ColaboradorInfo } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

const TABLE_HEAD_RETENCOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: '', label: 'Duração', align: 'center' },
  { id: 'preso_em', label: 'Retido em', align: 'center' },
  { id: 'solto_em', label: 'Solto em', align: 'center' },
  { id: 'solto_por', label: 'Solto por', align: 'left' },
];

// ----------------------------------------------------------------------

HistoricoPrisoes.propTypes = { historico: PropTypes.array };

export function HistoricoPrisoes({ historico }) {
  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'preso_em' });
  const [filter, setFilter] = useState('');
  const { colaboradores } = useSelector((state) => state.intranet);

  const dataFiltered = applySortFilter({
    dados: historico?.map((row) => ({
      ...row,
      uo: colaboradores?.find((colab) => colab?.perfil?.id === row?.perfil_id)?.uo?.label,
      foto: colaboradores?.find((colab) => colab?.perfil?.id === row?.perfil_id)?.foto_disk,
      nome: colaboradores?.find((colab) => colab?.perfil?.id === row?.perfil_id)?.perfil?.displayName,
    })),
    comparator: getComparator(order, orderBy),
    filter,
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <CardContent sx={{ p: 1 }}>
      <SearchToolbarSimple filter={filter} setFilter={setFilter} />
      <Scrollbar>
        <TableContainer sx={{ overflow: 'hidden', position: 'relative', minWidth: 800 }}>
          <Table>
            <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD_RETENCOES} onSort={onSort} />
            <TableBody>
              {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => (
                <TableRow key={row?.preso_em} hover>
                  <TableCell>
                    <ColaboradorInfo nome={row?.nome} foto={row?.foto} label={row?.uo} />
                  </TableCell>
                  <TableCell align="center">
                    {(row?.preso_em && row?.solto_em && fDistance(row?.preso_em, row?.solto_em)) ||
                      (row?.preso_em && !row?.solto_em && fToNow(row?.preso_em)) ||
                      noDados(true)}
                  </TableCell>
                  <TableCell align="center">{ptDateTime(row?.preso_em)}</TableCell>
                  <TableCell align="center">{row?.solto_em ? ptDateTime(row?.solto_em) : noDados(true)}</TableCell>
                  <TableCell>{row?.por && row?.solto_em ? row?.por : noDados(true)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {isNotFound && <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />}
          </Table>
        </TableContainer>
      </Scrollbar>

      {!isNotFound && dataFiltered.length > 10 && (
        <TablePaginationAlt
          page={page}
          dense={dense}
          rowsPerPage={rowsPerPage}
          count={dataFiltered.length}
          onChangePage={onChangePage}
          onChangeDense={onChangeDense}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      )}
    </CardContent>
  );
}

// ----------------------------------------------------------------------

HistoricoTransicao.propTypes = { historico: PropTypes.array };

export function HistoricoTransicao({ historico }) {
  return (
    <>
      <Timeline position="right">
        {groupBy(historico, 'data_transicao')
          ?.sort((a, b) => {
            const datetimeA = new Date(a.data);
            const datetimeB = new Date(b.data);
            return datetimeB - datetimeA;
          })
          .map((row, index) => (
            <Transicao
              row={row}
              key={`transicao_${index}`}
              addConector={index !== groupBy(historico, 'data_transicao')?.length - 1}
            />
          ))}
      </Timeline>
    </>
  );
}

// ----------------------------------------------------------------------

Transicao.propTypes = { row: PropTypes.object, addConector: PropTypes.bool };

function Transicao({ row, addConector }) {
  const transicao = row?.transicoes?.[0];
  const { colaboradores } = useSelector((state) => state.intranet);
  const criador = colaboradores?.find((colab) => colab?.perfil?.id === transicao?.perfil_id);
  const estadoDestino = () => {
    let destinos = '';
    row?.transicoes?.forEach((item, index) => {
      destinos +=
        row?.transicoes?.length - 1 === index
          ? item?.nomef?.replace(' - P/S/P', '')
          : `${item?.nomef?.replace(' - P/S/P', '')} / `;
      return destinos;
    });
    return destinos;
  };

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' }, mt: 0.5 }}>
      <TimelineSeparator>
        <TimelineDot
          sx={{ p: 0 }}
          color={
            (transicao?.is_resgate && 'warning') ||
            ((transicao?.modo === 'Devolução' || transicao?.modo === 'desarquivamento') && 'error') ||
            'success'
          }
        >
          <KeyboardArrowUpIcon sx={{ width: 18, height: 18, color: 'common.white' }} />
        </TimelineDot>
        {addConector && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0 }}>
        <Paper sx={{ bgcolor: 'background.neutral' }}>
          <Paper
            sx={{
              p: 2,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'background.neutral',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
              <Label
                variant="ghost"
                color={
                  (transicao?.is_resgate && 'warning') ||
                  ((transicao?.modo === 'Devolução' || transicao?.modo === 'desarquivamento') && 'error') ||
                  'success'
                }
              >
                {(transicao?.is_resgate && 'Resgate') ||
                  (transicao?.modo === 'Paralelo' && 'Seguimento em paralelo') ||
                  transicao?.modo}
              </Label>
              <Stack direction="row" justifyContent="left" alignItems="center" spacing={0.5}>
                <Typography variant="body2">{transicao?.is_resgate ? estadoDestino() : transicao?.nome}</Typography>
                <ArrowRightAltIcon />
                <Typography variant="body2">{transicao?.is_resgate ? transicao?.nome : estadoDestino()}</Typography>
              </Stack>
            </Stack>
          </Paper>
          <Stack sx={{ p: 2 }}>
            <ColaboradorInfo
              foto={criador?.foto_disk}
              nome={`${criador?.perfil?.displayName} (${criador?.uo?.label})`}
              label={transicao.data_transicao ? ptDateTime(transicao.data_transicao) : ''}
            />
            {transicao?.observacao && <Typography sx={{ pt: 2 }}>{newLineText(transicao.observacao)}</Typography>}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.uo && normalizeText(row?.uo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}

// ----------------------------------------------------------------------

function groupBy(dados, item) {
  const _dados = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { data: value[item], transicoes: [] };
      _dados.push(res[value[item]]);
    }
    res[value[item]].transicoes.push(value);
    return res;
  }, {});

  return _dados;
}
