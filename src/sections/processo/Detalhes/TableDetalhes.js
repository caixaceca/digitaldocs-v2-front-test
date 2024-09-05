import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// utils
import { normalizeText, noDados } from '../../../utils/formatText';
import { ptDateTime, fDistance, fToNow } from '../../../utils/formatTime';
// hooks
import useTable, { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { getAll } from '../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import Scrollbar from '../../../components/Scrollbar';
import { SkeletonTable } from '../../../components/skeleton';
import { Criado, ColaboradorInfo } from '../../../components/Panel';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD_RETENCOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: '', label: 'Duração', align: 'center' },
  { id: 'preso_em', label: 'Retido em', align: 'center' },
  { id: 'solto_em', label: 'Solto em', align: 'center', minWidth: 100, width: 10 },
];

const TABLE_HEAD_ATRIBUICOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'atribuido_em', label: 'Atribuido em', align: 'center', minWidth: 130, width: 10 },
];

const TABLE_HEAD_PENDENCIAS = [
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: 'observacao', label: 'Observação', align: 'left' },
  { id: '', label: 'Duração', align: 'left' },
  { id: 'data_pendente', label: 'Registo', align: 'center', minWidth: 130, width: 10 },
];

// ----------------------------------------------------------------------

TableDetalhes.propTypes = { id: PropTypes.number, item: PropTypes.string };

export default function TableDetalhes({ id, item }) {
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
  } = useTable();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const { processo, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (mail && id && item && perfilId) {
      dispatch(getAll(item, { mail, id, perfilId }));
    }
  }, [dispatch, mail, item, perfilId, id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    dados:
      (item === 'hretencoes' && dadosComColaboradores(processo?.hretencoes || [], colaboradores)) ||
      (item === 'hpendencias' && dadosComColaboradores(processo?.hpendencias || [], colaboradores)) ||
      (item === 'hatribuicoes' && dadosComColaboradores(processo?.hatribuicoes || [], colaboradores)) ||
      [],
    comparator: getComparator(order, orderBy),
    filter,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Box sx={{ p: 1 }}>
      <SearchToolbarSimple filter={filter} setFilter={setFilter} />
      <Scrollbar>
        <TableContainer sx={{ overflow: 'hidden', position: 'relative', minWidth: 800 }}>
          <Table size={dense || item?.includes('anexo') ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={
                (item === 'hretencoes' && TABLE_HEAD_RETENCOES) ||
                (item === 'hpendencias' && TABLE_HEAD_PENDENCIAS) ||
                (item === 'hatribuicoes' && TABLE_HEAD_ATRIBUICOES)
              }
              onSort={onSort}
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={(item === 'hatribuicoes' && 3) || 4} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`table_detalhes_${index}`}>
                    {(item === 'hretencoes' && (
                      <>
                        <TableCell>
                          <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} />
                        </TableCell>
                        <TableCell align="center">
                          {(row?.preso_em && row?.solto_em && fDistance(row?.preso_em, row?.solto_em)) ||
                            (row?.preso_em && !row?.solto_em && fToNow(row?.preso_em)) ||
                            noDados(true)}
                        </TableCell>
                        <TableCell align="center">{ptDateTime(row?.preso_em)}</TableCell>
                        <TableCell align={row?.solto_em ? 'left' : 'center'}>
                          {row?.solto_em ? (
                            <Criado tipo="data" value={ptDateTime(row?.solto_em)} />
                          ) : (
                            <Criado sx={{ color: 'text.success' }} caption value="Ainda está a trabalhar no processo" />
                          )}
                          {row?.solto_em && row?.por && (
                            <Criado tipo="user" value={row?.por === 'system' ? 'Pelo sistema' : row?.por} baralhar />
                          )}
                        </TableCell>
                      </>
                    )) ||
                      (item === 'hatribuicoes' && (
                        <>
                          <TableCell>
                            <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} />
                          </TableCell>
                          <TableCell>{row?.estado}</TableCell>
                          <TableCell>
                            {row?.atribuido_em && <Criado caption tipo="data" value={ptDateTime(row?.atribuido_em)} />}
                            {row?.atribuidor && <Criado caption tipo="user" value={row?.atribuidor} baralhar />}
                          </TableCell>
                        </>
                      )) ||
                      (item === 'hpendencias' && (
                        <>
                          <TableCell>{row?.motivo}</TableCell>
                          <TableCell>{row?.observacao || noDados(true)}</TableCell>
                          <TableCell>
                            {(row?.data_pendente && row?.data_libertado && (
                              <Criado caption tipo="time" value={fDistance(row?.data_pendente, row?.data_libertado)} />
                            )) ||
                              (row?.data_pendente && !row?.data_libertado && (
                                <Criado caption tipo="time" value={fToNow(row?.data_pendente)} />
                              )) ||
                              noDados(true)}
                            {row?.data_libertado && (
                              <Criado caption tipo="data" value={ptDateTime(row?.data_libertado)} />
                            )}
                          </TableCell>
                          <TableCell>
                            {row?.nome && <Criado caption tipo="user" value={row?.nome} baralhar />}
                            {row?.data_pendente && (
                              <Criado caption tipo="data" value={ptDateTime(row?.data_pendente)} />
                            )}
                          </TableCell>
                        </>
                      ))}
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
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
    </Box>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.estado && normalizeText(row?.estado).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.observacao && normalizeText(row?.observacao).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}

function dadosComColaboradores(dados, colaboradores) {
  const dadosList = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores.find((item) => Number(item?.perfil_id) === Number(row?.perfil_id));
    dadosList.push({
      ...row,
      uo: colaborador?.uo?.label,
      foto: colaborador?.foto_disk,
      mail: colaborador?.perfil?.mail,
      nome: colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`,
    });
  });
  return dadosList;
}
